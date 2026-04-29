from __future__ import annotations

import argparse
import copy
from datetime import datetime, timezone
import json
import os
import shutil
import sys
from pathlib import Path
from typing import Any, Sequence

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

SCRIPT_DIR = Path(__file__).resolve().parent
MPL_CONFIG_DIR = SCRIPT_DIR / ".mplconfig"
MPL_CONFIG_DIR.mkdir(exist_ok=True)
os.environ.setdefault("MPLCONFIGDIR", str(MPL_CONFIG_DIR))

import gymnasium as gym
import numpy as np
import blade
from blade.Game import Game
from blade.Scenario import Scenario
from blade.envs.fixed_target_strike_reward import FixedTargetStrikeRewardConfig
from blade.envs.fixed_target_strike_types import (
    FixedTargetStrikeConfig,
    OBSERVATION_VERSION,
    REWARD_VERSION,
)
from blade.utils.constants import KILOMETERS_TO_NAUTICAL_MILES
from blade.utils.utils import (
    get_bearing_between_two_points,
    get_distance_between_two_points,
    get_terminal_coordinates_from_distance_and_bearing,
)

from train_support import *  # noqa: F403 - local training constants and helpers

def _load_scenario_payload(scenario_path: Path) -> dict[str, Any]:
    with scenario_path.open("r", encoding="utf-8") as scenario_file:
        return json.load(scenario_file)


def _resolve_side_id_from_payload(
    scenario_payload: dict[str, Any], side_name: str
) -> str | None:
    current_scenario = scenario_payload.get("currentScenario", scenario_payload)
    for side in current_scenario.get("sides", []):
        if str(side.get("name")) == side_name:
            return str(side.get("id"))
    return None


def _build_curriculum_target_order(
    args: argparse.Namespace, scenario_payload: dict[str, Any]
) -> list[str]:
    current_scenario = scenario_payload.get("currentScenario", scenario_payload)
    target_side_id = _resolve_side_id_from_payload(
        scenario_payload, args.target_side_name
    )
    if target_side_id is None:
        return normalize_id_list(args.target_ids, DEFAULT_TARGET_IDS)

    available_target_ids = {
        str(target.get("id"))
        for key in ("facilities", "airbases", "ships")
        for target in current_scenario.get(key, [])
        if str(target.get("sideId")) == target_side_id
    }
    preferred_high_value_ids = [
        target_id
        for target_id in normalize_id_list(
            args.high_value_target_ids, DEFAULT_HIGH_VALUE_TARGET_IDS
        )
        if target_id in available_target_ids
    ]
    ordered_target_ids = [
        target_id
        for target_id in normalize_id_list(args.target_ids, DEFAULT_TARGET_IDS)
        if target_id in available_target_ids and target_id not in preferred_high_value_ids
    ]
    return preferred_high_value_ids + ordered_target_ids


def build_curriculum_stages(args: argparse.Namespace) -> list[dict[str, Any]]:
    scenario_payload = _load_scenario_payload(args.scenario_path)
    ordered_target_ids = _build_curriculum_target_order(args, scenario_payload)
    if len(ordered_target_ids) == 0:
        ordered_target_ids = normalize_id_list(args.target_ids, DEFAULT_TARGET_IDS)

    stage_specs = [
        {
            "key": "stage_1",
            "label": "Opening",
            "target_count": 1,
            "threat_scale": 0.35,
            "start_distance_scale": 0.45,
            "max_episode_steps": max(60, int(round(args.max_episode_steps * 0.5))),
            "success_threshold": 0.55,
        },
        {
            "key": "stage_2",
            "label": "Approach",
            "target_count": 1,
            "threat_scale": 0.65,
            "start_distance_scale": 0.65,
            "max_episode_steps": max(90, int(round(args.max_episode_steps * 0.7))),
            "success_threshold": 0.65,
        },
        {
            "key": "stage_3",
            "label": "Coordination",
            "target_count": min(2, len(ordered_target_ids)),
            "threat_scale": 0.85,
            "start_distance_scale": 0.85,
            "max_episode_steps": max(120, int(round(args.max_episode_steps * 0.85))),
            "success_threshold": 0.72,
        },
        {
            "key": "stage_4",
            "label": "Full Mission",
            "target_count": len(ordered_target_ids),
            "threat_scale": 1.0,
            "start_distance_scale": 1.0,
            "max_episode_steps": args.max_episode_steps,
            "success_threshold": 0.8,
        },
    ]

    stages: list[dict[str, Any]] = []
    seen_signatures: set[tuple[Any, ...]] = set()
    for stage_spec in stage_specs:
        target_count = max(1, min(int(stage_spec["target_count"]), len(ordered_target_ids)))
        stage_target_ids = ordered_target_ids[:target_count]
        signature = (
            tuple(stage_target_ids),
            round(float(stage_spec["threat_scale"]), 3),
            round(float(stage_spec["start_distance_scale"]), 3),
            int(stage_spec["max_episode_steps"]),
        )
        if signature in seen_signatures:
            continue
        seen_signatures.add(signature)
        stages.append(
            {
                **stage_spec,
                "target_ids": stage_target_ids,
            }
        )
    return stages


def _scale_target_side_threats(
    scenario_payload: dict[str, Any], args: argparse.Namespace, threat_scale: float
) -> None:
    current_scenario = scenario_payload.get("currentScenario", scenario_payload)
    target_side_id = _resolve_side_id_from_payload(scenario_payload, args.target_side_name)
    if target_side_id is None:
        return

    for group_name in ("aircraft", "facilities", "ships"):
        for unit in current_scenario.get(group_name, []):
            if str(unit.get("sideId")) != target_side_id:
                continue
            if isinstance(unit.get("range"), (int, float)):
                unit["range"] = round(float(unit["range"]) * threat_scale, 3)
            for weapon in unit.get("weapons", []):
                if isinstance(weapon.get("range"), (int, float)):
                    weapon["range"] = round(float(weapon["range"]) * threat_scale, 3)


def _move_allies_for_curriculum(
    scenario_payload: dict[str, Any], args: argparse.Namespace, distance_scale: float
) -> None:
    current_scenario = scenario_payload.get("currentScenario", scenario_payload)
    controllable_side_id = _resolve_side_id_from_payload(
        scenario_payload, args.controllable_side_name
    )
    target_side_id = _resolve_side_id_from_payload(scenario_payload, args.target_side_name)
    if controllable_side_id is None or target_side_id is None:
        return

    targets = [
        target
        for key in ("facilities", "airbases", "ships")
        for target in current_scenario.get(key, [])
        if str(target.get("sideId")) == target_side_id
    ]
    allies = [
        ally
        for ally in current_scenario.get("aircraft", [])
        if str(ally.get("sideId")) == controllable_side_id
    ]
    if len(targets) == 0 or len(allies) == 0:
        return

    target_centroid_latitude = sum(float(target.get("latitude", 0.0)) for target in targets) / len(
        targets
    )
    target_centroid_longitude = sum(
        float(target.get("longitude", 0.0)) for target in targets
    ) / len(targets)

    for ally in allies:
        ally_latitude = float(ally.get("latitude", 0.0))
        ally_longitude = float(ally.get("longitude", 0.0))
        bearing_from_target = get_bearing_between_two_points(
            target_centroid_latitude,
            target_centroid_longitude,
            ally_latitude,
            ally_longitude,
        )
        current_distance_nm = max(
            1.0,
            float(
                get_distance_between_two_points(
                    target_centroid_latitude,
                    target_centroid_longitude,
                    ally_latitude,
                    ally_longitude,
                )
            )
            * KILOMETERS_TO_NAUTICAL_MILES,
        )
        scaled_distance_km = (current_distance_nm * distance_scale) / KILOMETERS_TO_NAUTICAL_MILES
        next_latitude, next_longitude = get_terminal_coordinates_from_distance_and_bearing(
            target_centroid_latitude,
            target_centroid_longitude,
            scaled_distance_km,
            bearing_from_target,
        )
        ally["latitude"] = next_latitude
        ally["longitude"] = next_longitude
        ally["heading"] = get_bearing_between_two_points(
            next_latitude,
            next_longitude,
            target_centroid_latitude,
            target_centroid_longitude,
        )
        ally["route"] = []
        ally["desiredRoute"] = []


def mutate_curriculum_payload(
    scenario_payload: dict[str, Any],
    args: argparse.Namespace,
    curriculum_stage: dict[str, Any],
) -> dict[str, Any]:
    mutated_payload = copy.deepcopy(scenario_payload)
    current_scenario = mutated_payload.get("currentScenario", mutated_payload)
    target_side_id = _resolve_side_id_from_payload(mutated_payload, args.target_side_name)
    selected_target_ids = set(curriculum_stage["target_ids"])
    if target_side_id is not None:
        for group_name in ("facilities", "airbases", "ships"):
            current_scenario[group_name] = [
                target
                for target in current_scenario.get(group_name, [])
                if str(target.get("sideId")) != target_side_id
                or str(target.get("id")) in selected_target_ids
            ]

    _scale_target_side_threats(
        mutated_payload,
        args,
        float(curriculum_stage["threat_scale"]),
    )
    _move_allies_for_curriculum(
        mutated_payload,
        args,
        float(curriculum_stage["start_distance_scale"]),
    )
    return mutated_payload


def build_config(
    args: argparse.Namespace, curriculum_stage: dict[str, Any] | None = None
) -> FixedTargetStrikeConfig:
    ally_ids = normalize_id_list(args.ally_ids, DEFAULT_ALLY_IDS)
    target_ids = (
        list(curriculum_stage["target_ids"])
        if curriculum_stage is not None
        else normalize_id_list(args.target_ids, DEFAULT_TARGET_IDS)
    )
    return FixedTargetStrikeConfig(
        max_allies=len(ally_ids),
        max_targets=max(len(normalize_id_list(args.target_ids, DEFAULT_TARGET_IDS)), len(target_ids)),
        max_episode_steps=(
            int(curriculum_stage["max_episode_steps"])
            if curriculum_stage is not None
            else args.max_episode_steps
        ),
        normalize_margin_nm=120.0,
        eta_clip_seconds=1800.0,
        threat_buffer_nm=5.0,
        guided_launch_bootstrap_steps=max(
            int(getattr(args, "guided_launch_bootstrap_steps", 0)),
            0,
        ),
        reward_config=build_reward_config(args),
        controllable_side_name=args.controllable_side_name,
        target_side_name=args.target_side_name,
        target_ids=target_ids,
        ally_ids=ally_ids,
    )


def load_game(
    scenario_path: Path,
    *,
    args: argparse.Namespace | None = None,
    curriculum_stage: dict[str, Any] | None = None,
) -> Game:
    game = Game(
        current_scenario=Scenario(),
        record_every_seconds=1,
        recording_export_path=str(scenario_path.parent),
    )
    scenario_payload = _load_scenario_payload(scenario_path)
    if args is not None and curriculum_stage is not None:
        scenario_payload = mutate_curriculum_payload(
            scenario_payload,
            args,
            curriculum_stage,
        )
    game.load_scenario(json.dumps(scenario_payload))
    return game


def create_env(
    args: argparse.Namespace, curriculum_stage: dict[str, Any] | None = None
):
    config = build_config(args, curriculum_stage)
    game = load_game(args.scenario_path, args=args, curriculum_stage=curriculum_stage)
    return gym.make("vista/FixedTargetStrike-v0", game=game, config=config)


def build_smoke_action(config: FixedTargetStrikeConfig) -> np.ndarray:
    ally_action_block_size = config.max_targets + 3
    action = np.zeros((config.max_allies * ally_action_block_size,), dtype=np.float32)
    for ally_index in range(config.max_allies):
        base_index = ally_index * ally_action_block_size
        if config.max_targets > 1:
            action[base_index + 1] = 1.0
        else:
            action[base_index] = 1.0
        control_index = base_index + config.max_targets
        action[control_index] = 0.95
        action[control_index + 1] = 0.5
        action[control_index + 2] = 0.0
    return action


def run_preflight(args: argparse.Namespace) -> None:
    curriculum_stage = build_curriculum_stages(args)[0] if args.curriculum_enabled else None
    env = create_env(args, curriculum_stage)
    observation, _ = env.reset(seed=args.seed)
    required_obs_keys = {
        "allies",
        "targets",
        "launch_eta",
        "impact_eta",
        "range_margin",
        "threat_exposure",
        "weapon_range_advantage",
        "ally_mask",
        "target_mask",
        "global",
    }
    if set(observation) != required_obs_keys:
        raise RuntimeError(f"Unexpected observation keys from reset: {sorted(observation)}")

    _, _, _, _, info = env.step(build_smoke_action(env.unwrapped.config))
    breakdown = info.get("reward_breakdown")
    if not isinstance(breakdown, dict):
        raise RuntimeError("Preflight step did not return a reward_breakdown dict")
    missing_keys = REQUIRED_REWARD_KEYS.difference(breakdown)
    if missing_keys:
        raise RuntimeError(f"Preflight reward_breakdown missing keys: {sorted(missing_keys)}")
    if info.get("done_reason") not in {
        "in_progress",
        "success",
        "failure",
        "truncated",
    }:
        raise RuntimeError(f"Unexpected preflight done_reason: {info.get('done_reason')}")
    env.close()


def create_algorithm_progress_state(
    args: argparse.Namespace, algorithm: str
) -> dict[str, Any]:
    return {
        "algorithm": algorithm,
        "status": "queued",
        "current_timesteps": 0,
        "timesteps_target": args.timesteps,
        "checkpoints": [],
        "episodes": [],
        "best_checkpoint": None,
        "final_evaluation": None,
        "selected_model_path": None,
        "final_model_path": None,
        "error": None,
    }


def create_progress_state(args: argparse.Namespace) -> dict[str, Any]:
    algorithms = normalize_algorithm_list(args.algorithms)
    curriculum_stages = build_curriculum_stages(args) if args.curriculum_enabled else []
    return {
        "status": "running",
        "training_mode": "curriculum" if args.curriculum_enabled else "standard",
        "objective": "success_rate",
        "objective_detail": "success_rate > mean_reward > shorter mean_episode_steps",
        "scenario_path": str(args.scenario_path),
        "algorithms": algorithms,
        "current_algorithm": algorithms[0] if algorithms else None,
        "timesteps_target": args.timesteps,
        "current_timesteps": 0,
        "overall_timesteps_target": args.timesteps * len(algorithms),
        "overall_timesteps": 0,
        "eval_frequency": args.progress_eval_frequency,
        "eval_episodes": args.progress_eval_episodes,
        "selection_eval_episodes": args.eval_episodes,
        "selection_eval_seed_count": args.eval_seed_count,
        "current_stage": curriculum_stages[0]["key"] if curriculum_stages else None,
        "curriculum": {
            "enabled": args.curriculum_enabled,
            "stage_count": len(curriculum_stages),
            "stages": curriculum_stages,
        },
        "checkpoints": [],
        "episodes": [],
        "algorithm_runs": {
            algorithm: create_algorithm_progress_state(args, algorithm)
            for algorithm in algorithms
        },
        "best_run": None,
        "error": None,
    }


def _ally_ready_from_observation(
    observation: dict[str, Any], ally_index: int
) -> bool:
    target_mask = np.asarray(observation.get("target_mask", []), dtype=bool)
    launch_eta = np.asarray(observation.get("launch_eta", []), dtype=np.float32)
    range_margin = np.asarray(observation.get("range_margin", []), dtype=np.float32)
    if launch_eta.ndim != 2 or ally_index >= launch_eta.shape[0] or target_mask.size == 0:
        return False
    if not np.any(target_mask):
        return False
    ready_by_eta = np.any(launch_eta[ally_index, target_mask] <= 0.0)
    ready_by_margin = (
        range_margin.ndim == 2
        and ally_index < range_margin.shape[0]
        and np.any(range_margin[ally_index, target_mask] >= 0.5)
    )
    return bool(ready_by_eta or ready_by_margin)


def _extract_step_tot_qualities(reward_breakdown: dict[str, Any], tot_weight: float) -> list[float]:
    if tot_weight <= 0:
        return []
    step_qualities: list[float] = []
    for group in reward_breakdown.get("tot_groups", []):
        if not isinstance(group, dict):
            continue
        launch_count = max(int(group.get("launch_count", 0)), 1)
        group_bonus = float(group.get("group_bonus", 0.0))
        group_quality = group_bonus / max(tot_weight * launch_count, 1e-6)
        step_qualities.append(float(np.clip(group_quality, 0.0, 1.0)))
    return step_qualities


def run_policy_evaluation(
    model: BaseAlgorithm,
    args: argparse.Namespace,
    *,
    episodes: int,
    seed: int,
    export_path: Path | None = None,
    recording_path: Path | None = None,
    curriculum_stage: dict[str, Any] | None = None,
) -> dict[str, Any]:
    env = create_env(args, curriculum_stage)
    totals: list[float] = []
    episode_steps_list: list[int] = []
    survivability_list: list[float] = []
    weapon_efficiency_list: list[float] = []
    time_to_ready_list: list[float] = []
    tot_quality_list: list[float] = []
    last_info: dict[str, Any] = {}
    total_steps = 0
    recording_steps: list[str] = []
    outcome_counts = {
        "success": 0,
        "failure": 0,
        "truncated": 0,
        "in_progress": 0,
    }

    for episode_index in range(episodes):
        observation, _ = env.reset(seed=seed + episode_index)
        initial_ally_ids = list(env.unwrapped._ally_catalog)
        initial_target_ids = list(env.unwrapped._target_catalog)
        first_ready_step_by_ally: dict[str, int] = {}
        for ally_index, ally_id in enumerate(initial_ally_ids):
            if _ally_ready_from_observation(observation, ally_index):
                first_ready_step_by_ally[ally_id] = 0
        episode_weapons_fired = 0
        episode_tot_qualities: list[float] = []
        if recording_path is not None and episode_index == 0:
            recording_steps.append(json.dumps(env.unwrapped.game.export_scenario()))

        done = False
        episode_reward = 0.0
        episode_steps = 0
        episode_done_reason = "in_progress"
        while not done:
            action, _ = model.predict(observation, deterministic=True)
            observation, reward, terminated, truncated, info = env.step(action)
            episode_reward += float(reward)
            episode_steps += 1
            done = bool(terminated or truncated)
            last_info = info
            episode_done_reason = str(info.get("done_reason") or "in_progress")
            reward_breakdown = info.get("reward_breakdown", {})
            if isinstance(reward_breakdown, dict):
                episode_weapons_fired += max(int(reward_breakdown.get("weapons_fired", 0)), 0)
                episode_tot_qualities.extend(
                    _extract_step_tot_qualities(reward_breakdown, args.tot_weight)
                )
            for ally_index, ally_id in enumerate(initial_ally_ids):
                if ally_id not in first_ready_step_by_ally and _ally_ready_from_observation(
                    observation, ally_index
                ):
                    first_ready_step_by_ally[ally_id] = episode_steps
            if recording_path is not None and episode_index == 0:
                recording_steps.append(json.dumps(env.unwrapped.game.export_scenario()))

        if episode_done_reason not in outcome_counts:
            episode_done_reason = "in_progress"
        outcome_counts[episode_done_reason] += 1
        totals.append(episode_reward)
        episode_steps_list.append(episode_steps)
        total_steps += episode_steps
        alive_ally_count = len(env.unwrapped._get_alive_ally_ids())
        remaining_target_count = len(env.unwrapped._get_alive_target_ids())
        destroyed_target_count = max(len(initial_target_ids) - remaining_target_count, 0)
        survivability_list.append(alive_ally_count / max(len(initial_ally_ids), 1))
        if episode_weapons_fired > 0:
            weapon_efficiency_list.append(
                destroyed_target_count / max(episode_weapons_fired, 1)
            )
        else:
            weapon_efficiency_list.append(float(destroyed_target_count > 0))
        time_to_ready_list.append(
            float(
                np.mean(
                    [
                        first_ready_step_by_ally.get(
                            ally_id, env.unwrapped.config.max_episode_steps
                        )
                        for ally_id in initial_ally_ids
                    ]
                )
            )
        )
        tot_quality_list.append(
            float(np.mean(episode_tot_qualities)) if episode_tot_qualities else 0.0
        )

    if export_path is not None:
        write_json(export_path, env.unwrapped.game.export_scenario())
    if recording_path is not None:
        ensure_parent(recording_path)
        with recording_path.open("w", encoding="utf-8") as replay_file:
            replay_file.write("\n".join(recording_steps))

    env.close()
    mean_episode_steps = float(np.mean(episode_steps_list)) if episode_steps_list else 0.0
    success_rate = outcome_counts["success"] / max(episodes, 1)
    failure_rate = outcome_counts["failure"] / max(episodes, 1)
    truncated_rate = outcome_counts["truncated"] / max(episodes, 1)
    return {
        "evaluation_seed": int(seed),
        "mean_reward": float(np.mean(totals)),
        "std_reward": float(np.std(totals)),
        "episodes": int(episodes),
        "total_steps": int(total_steps),
        "mean_episode_steps": mean_episode_steps,
        "success_count": int(outcome_counts["success"]),
        "failure_count": int(outcome_counts["failure"]),
        "truncated_count": int(outcome_counts["truncated"]),
        "success_rate": float(success_rate),
        "failure_rate": float(failure_rate),
        "truncated_rate": float(truncated_rate),
        "win_rate": float(success_rate),
        "survivability": float(np.mean(survivability_list)) if survivability_list else 0.0,
        "survivability_std": float(np.std(survivability_list)) if survivability_list else 0.0,
        "weapon_efficiency": (
            float(np.mean(weapon_efficiency_list)) if weapon_efficiency_list else 0.0
        ),
        "weapon_efficiency_std": (
            float(np.std(weapon_efficiency_list)) if weapon_efficiency_list else 0.0
        ),
        "time_to_ready": float(np.mean(time_to_ready_list)) if time_to_ready_list else 0.0,
        "time_to_ready_std": (
            float(np.std(time_to_ready_list)) if time_to_ready_list else 0.0
        ),
        "tot_quality": float(np.mean(tot_quality_list)) if tot_quality_list else 0.0,
        "tot_quality_std": float(np.std(tot_quality_list)) if tot_quality_list else 0.0,
        "done_reason_distribution": outcome_counts,
        "done_reason": last_info.get("done_reason"),
        "done_reason_detail": last_info.get("done_reason_detail"),
        "selected_target_id": last_info.get("selected_target_id"),
        "selected_target_ids": last_info.get("selected_target_ids", []),
        "selected_target_assignments": last_info.get("selected_target_assignments", {}),
        "launch_count": last_info.get("launch_count"),
        "reward_breakdown": last_info.get("reward_breakdown", {}),
        "observation_version": OBSERVATION_VERSION,
        "reward_version": REWARD_VERSION,
        "curriculum_stage": curriculum_stage["key"] if curriculum_stage is not None else None,
    }


def _combine_population_stats(
    evaluations: Sequence[dict[str, Any]], *, mean_key: str, std_key: str
) -> tuple[float, float]:
    total_count = sum(max(int(evaluation.get("episodes", 0)), 0) for evaluation in evaluations)
    if total_count <= 0:
        return 0.0, 0.0

    weighted_mean = (
        sum(
            float(evaluation.get(mean_key, 0.0)) * max(int(evaluation.get("episodes", 0)), 0)
            for evaluation in evaluations
        )
        / total_count
    )
    second_moment = (
        sum(
            max(int(evaluation.get("episodes", 0)), 0)
            * (
                float(evaluation.get(std_key, 0.0)) ** 2
                + float(evaluation.get(mean_key, 0.0)) ** 2
            )
            for evaluation in evaluations
        )
        / total_count
    )
    variance = max(second_moment - (weighted_mean**2), 0.0)
    return float(weighted_mean), float(np.sqrt(variance))


def _combine_weighted_mean(evaluations: Sequence[dict[str, Any]], key: str) -> float:
    total_count = sum(max(int(evaluation.get("episodes", 0)), 0) for evaluation in evaluations)
    if total_count <= 0:
        return 0.0
    return float(
        sum(
            float(evaluation.get(key, 0.0)) * max(int(evaluation.get("episodes", 0)), 0)
            for evaluation in evaluations
        )
        / total_count
    )


def _build_seed_variability_summary(
    evaluations: Sequence[dict[str, Any]],
) -> dict[str, Any]:
    if len(evaluations) <= 1:
        return {
            "warning": False,
            "reasons": [],
            "success_rate_std": 0.0,
            "mean_reward_std": 0.0,
            "survivability_std": 0.0,
            "weapon_efficiency_std": 0.0,
            "time_to_ready_std": 0.0,
            "tot_quality_std": 0.0,
        }

    success_rate_std = float(np.std([float(e.get("success_rate", 0.0)) for e in evaluations]))
    mean_reward_std = float(np.std([float(e.get("mean_reward", 0.0)) for e in evaluations]))
    survivability_std = float(
        np.std([float(e.get("survivability", 0.0)) for e in evaluations])
    )
    weapon_efficiency_std = float(
        np.std([float(e.get("weapon_efficiency", 0.0)) for e in evaluations])
    )
    time_to_ready_std = float(
        np.std([float(e.get("time_to_ready", 0.0)) for e in evaluations])
    )
    tot_quality_std = float(np.std([float(e.get("tot_quality", 0.0)) for e in evaluations]))
    mean_reward_mean = float(
        np.mean([float(e.get("mean_reward", 0.0)) for e in evaluations])
    )

    reasons: list[str] = []
    if success_rate_std >= 0.15:
        reasons.append("success_rate")
    if survivability_std >= 0.18:
        reasons.append("survivability")
    if weapon_efficiency_std >= 0.12:
        reasons.append("weapon_efficiency")
    if time_to_ready_std >= 20.0:
        reasons.append("time_to_ready")
    if tot_quality_std >= 0.2:
        reasons.append("tot_quality")
    if mean_reward_std >= max(20.0, abs(mean_reward_mean) * 0.35):
        reasons.append("mean_reward")

    return {
        "warning": len(reasons) > 0,
        "reasons": reasons,
        "success_rate_std": success_rate_std,
        "mean_reward_std": mean_reward_std,
        "survivability_std": survivability_std,
        "weapon_efficiency_std": weapon_efficiency_std,
        "time_to_ready_std": time_to_ready_std,
        "tot_quality_std": tot_quality_std,
    }


def run_benchmark_evaluation(
    model: BaseAlgorithm,
    args: argparse.Namespace,
    *,
    episodes_per_seed: int,
    base_seed: int,
    seed_count: int,
    export_path: Path | None = None,
    recording_path: Path | None = None,
    curriculum_stage: dict[str, Any] | None = None,
) -> dict[str, Any]:
    per_seed_evaluations: list[dict[str, Any]] = []
    normalized_seed_count = max(int(seed_count), 1)

    for seed_offset in range(normalized_seed_count):
        evaluation_seed = base_seed + (seed_offset * 1000)
        evaluation = run_policy_evaluation(
            model,
            args,
            episodes=episodes_per_seed,
            seed=evaluation_seed,
            export_path=export_path if seed_offset == 0 else None,
            recording_path=recording_path if seed_offset == 0 else None,
            curriculum_stage=curriculum_stage,
        )
        per_seed_evaluations.append(evaluation)

    mean_reward, std_reward = _combine_population_stats(
        per_seed_evaluations, mean_key="mean_reward", std_key="std_reward"
    )
    total_episodes = sum(
        max(int(evaluation.get("episodes", 0)), 0) for evaluation in per_seed_evaluations
    )
    total_steps = sum(
        max(int(evaluation.get("total_steps", 0)), 0) for evaluation in per_seed_evaluations
    )
    mean_episode_steps = (
        sum(
            float(evaluation.get("mean_episode_steps", 0.0))
            * max(int(evaluation.get("episodes", 0)), 0)
            for evaluation in per_seed_evaluations
        )
        / max(total_episodes, 1)
    )
    success_count = sum(
        max(int(evaluation.get("success_count", 0)), 0) for evaluation in per_seed_evaluations
    )
    failure_count = sum(
        max(int(evaluation.get("failure_count", 0)), 0) for evaluation in per_seed_evaluations
    )
    truncated_count = sum(
        max(int(evaluation.get("truncated_count", 0)), 0) for evaluation in per_seed_evaluations
    )
    done_reason_distribution = {
        "success": success_count,
        "failure": failure_count,
        "truncated": truncated_count,
        "in_progress": sum(
            int(evaluation.get("done_reason_distribution", {}).get("in_progress", 0))
            for evaluation in per_seed_evaluations
        ),
    }

    representative = per_seed_evaluations[0] if per_seed_evaluations else {}
    success_rate = success_count / max(total_episodes, 1)
    failure_rate = failure_count / max(total_episodes, 1)
    truncated_rate = truncated_count / max(total_episodes, 1)
    seed_variability = _build_seed_variability_summary(per_seed_evaluations)
    return {
        "benchmark_seed_count": normalized_seed_count,
        "benchmark_seeds": [
            int(evaluation.get("evaluation_seed", base_seed))
            for evaluation in per_seed_evaluations
        ],
        "recording_seed": int(representative.get("evaluation_seed", base_seed))
        if per_seed_evaluations
        else int(base_seed),
        "mean_reward": float(mean_reward),
        "std_reward": float(std_reward),
        "episodes": int(total_episodes),
        "episodes_per_seed": int(episodes_per_seed),
        "total_steps": int(total_steps),
        "mean_episode_steps": float(mean_episode_steps),
        "success_count": int(success_count),
        "failure_count": int(failure_count),
        "truncated_count": int(truncated_count),
        "success_rate": float(success_rate),
        "failure_rate": float(failure_rate),
        "truncated_rate": float(truncated_rate),
        "win_rate": float(success_rate),
        "survivability": _combine_weighted_mean(per_seed_evaluations, "survivability"),
        "weapon_efficiency": _combine_weighted_mean(
            per_seed_evaluations, "weapon_efficiency"
        ),
        "time_to_ready": _combine_weighted_mean(per_seed_evaluations, "time_to_ready"),
        "tot_quality": _combine_weighted_mean(per_seed_evaluations, "tot_quality"),
        "done_reason_distribution": done_reason_distribution,
        "done_reason": representative.get("done_reason"),
        "done_reason_detail": representative.get("done_reason_detail"),
        "selected_target_id": representative.get("selected_target_id"),
        "selected_target_ids": representative.get("selected_target_ids", []),
        "selected_target_assignments": representative.get(
            "selected_target_assignments", {}
        ),
        "launch_count": representative.get("launch_count"),
        "reward_breakdown": representative.get("reward_breakdown", {}),
        "seed_variability": seed_variability,
        "seed_variability_warning": bool(seed_variability.get("warning", False)),
        "observation_version": OBSERVATION_VERSION,
        "reward_version": REWARD_VERSION,
        "curriculum_stage": curriculum_stage["key"] if curriculum_stage is not None else None,
        "per_seed_evaluations": per_seed_evaluations,
    }


def evaluation_score(evaluation: dict[str, Any]) -> tuple[float, float, float]:
    return (
        float(evaluation.get("success_rate", 0.0)),
        float(evaluation.get("mean_reward", float("-inf"))),
        -float(evaluation.get("mean_episode_steps", float("inf"))),
    )


def is_better_evaluation(
    candidate: dict[str, Any], incumbent: dict[str, Any] | None
) -> bool:
    if incumbent is None:
        return True
    return evaluation_score(candidate) > evaluation_score(incumbent)


def _normalize_metric_value(value: Any, fallback: float = 0.0) -> float:
    try:
        normalized = float(value)
    except (TypeError, ValueError):
        return fallback
    if not np.isfinite(normalized):
        return fallback
    return normalized


def _metric_sort_key(
    run_summary: dict[str, Any], metric_key: str | None, direction: str
) -> tuple[float, float, float, float]:
    evaluation = run_summary.get("evaluation", {})
    selection_score = evaluation_score(evaluation)
    if metric_key is None:
        return selection_score

    metric_value = _normalize_metric_value(evaluation.get(metric_key), 0.0)
    if direction == "min":
        metric_value = -metric_value
    return (
        metric_value,
        selection_score[0],
        selection_score[1],
        selection_score[2],
    )


def build_evaluation_snapshot(evaluation: dict[str, Any]) -> dict[str, Any]:
    return {
        "benchmark_seed_count": int(evaluation.get("benchmark_seed_count", 0) or 0),
        "success_rate": _normalize_metric_value(evaluation.get("success_rate"), 0.0),
        "mean_reward": _normalize_metric_value(evaluation.get("mean_reward"), 0.0),
        "mean_episode_steps": _normalize_metric_value(
            evaluation.get("mean_episode_steps"), 0.0
        ),
        "survivability": _normalize_metric_value(evaluation.get("survivability"), 0.0),
        "weapon_efficiency": _normalize_metric_value(
            evaluation.get("weapon_efficiency"), 0.0
        ),
        "time_to_ready": _normalize_metric_value(evaluation.get("time_to_ready"), 0.0),
        "tot_quality": _normalize_metric_value(evaluation.get("tot_quality"), 0.0),
        "seed_variability_warning": bool(
            evaluation.get("seed_variability_warning", False)
        ),
        "done_reason": evaluation.get("done_reason"),
        "done_reason_detail": evaluation.get("done_reason_detail"),
    }


def build_leaderboard(run_summaries: Sequence[dict[str, Any]]) -> list[dict[str, Any]]:
    ordered_runs = sorted(
        run_summaries,
        key=lambda run_summary: _metric_sort_key(run_summary, None, "max"),
        reverse=True,
    )
    leaderboard: list[dict[str, Any]] = []
    for rank, run_summary in enumerate(ordered_runs, start=1):
        evaluation = run_summary.get("evaluation", {})
        leaderboard.append(
            {
                "rank": rank,
                "algorithm": run_summary["algorithm"],
                "model_path": run_summary["model_path"],
                "selection_source": run_summary.get("selection_source"),
                "selected": rank == 1,
                "selection_score": {
                    "success_rate": _normalize_metric_value(
                        evaluation.get("success_rate"), 0.0
                    ),
                    "mean_reward": _normalize_metric_value(
                        evaluation.get("mean_reward"), 0.0
                    ),
                    "mean_episode_steps": _normalize_metric_value(
                        evaluation.get("mean_episode_steps"), 0.0
                    ),
                },
                "evaluation_summary": build_evaluation_snapshot(evaluation),
            }
        )
    return leaderboard


def build_metric_leaders(
    run_summaries: Sequence[dict[str, Any]],
) -> dict[str, dict[str, Any]]:
    metric_leaders: dict[str, dict[str, Any]] = {}
    for metric_name, metric_key, direction in RETAINED_METRICS:
        if not run_summaries:
            break
        winner = max(
            run_summaries,
            key=lambda run_summary: _metric_sort_key(run_summary, metric_key, direction),
        )
        winner_evaluation = winner.get("evaluation", {})
        metric_leaders[metric_name] = {
            "metric": metric_name,
            "metric_key": metric_key,
            "direction": direction,
            "algorithm": winner["algorithm"],
            "model_path": winner["model_path"],
            "model_metadata_path": winner.get("model_metadata_path"),
            "export_path": winner.get("export_path"),
            "eval_recording_path": winner.get("eval_recording_path"),
            "value": (
                {
                    "success_rate": _normalize_metric_value(
                        winner_evaluation.get("success_rate"), 0.0
                    ),
                    "mean_reward": _normalize_metric_value(
                        winner_evaluation.get("mean_reward"), 0.0
                    ),
                    "mean_episode_steps": _normalize_metric_value(
                        winner_evaluation.get("mean_episode_steps"), 0.0
                    ),
                }
                if metric_key is None
                else _normalize_metric_value(winner_evaluation.get(metric_key), 0.0)
            ),
            "evaluation_summary": build_evaluation_snapshot(winner_evaluation),
        }
    return metric_leaders


def build_retained_model_archive(
    args: argparse.Namespace,
    run_summaries: Sequence[dict[str, Any]],
    metric_leaders: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    archive_root = args.summary_path.parent / "retained_models"
    archive_entries_by_algorithm: dict[str, dict[str, Any]] = {}

    for metric_name, leader in metric_leaders.items():
        algorithm = str(leader.get("algorithm", "")).strip().lower()
        if not algorithm:
            continue

        run_summary = next(
            (
                candidate
                for candidate in run_summaries
                if str(candidate.get("algorithm", "")).strip().lower() == algorithm
            ),
            None,
        )
        if run_summary is None:
            continue

        archive_dir = archive_root / algorithm
        archive_model_path = archive_dir / "model"
        copy_model_zip(Path(run_summary["model_path"].removesuffix(".zip")), archive_model_path)
        retained_export_path = copy_optional_file(
            run_summary.get("export_path"),
            archive_dir / "eval_scenario.json",
        )
        retained_recording_path = copy_optional_file(
            run_summary.get("eval_recording_path"),
            archive_dir / "eval_recording.jsonl",
        )
        evaluation_path = archive_dir / "evaluation.json"
        write_json(evaluation_path, run_summary["evaluation"])

        archive_entry = archive_entries_by_algorithm.get(algorithm)
        if archive_entry is None:
            archive_entry = {
                "algorithm": algorithm,
                "metrics": [],
                "model_path": str(model_zip_path(archive_model_path)),
                "model_metadata_path": (
                    str(model_metadata_path(archive_model_path))
                    if model_metadata_path(archive_model_path).exists()
                    else None
                ),
                "export_path": retained_export_path,
                "eval_recording_path": retained_recording_path,
                "evaluation_path": str(evaluation_path),
                "source_model_path": run_summary["model_path"],
                "source_model_metadata_path": run_summary.get("model_metadata_path"),
                "source_export_path": run_summary.get("export_path"),
                "source_eval_recording_path": run_summary.get("eval_recording_path"),
                "evaluation_summary": build_evaluation_snapshot(run_summary["evaluation"]),
            }
            archive_entries_by_algorithm[algorithm] = archive_entry
        if metric_name not in archive_entry["metrics"]:
            archive_entry["metrics"].append(metric_name)

    metric_archive_index = {
        metric_name: {
            **leader,
            "retained_model_path": (
                archive_entries_by_algorithm[str(leader.get("algorithm", "")).strip().lower()][
                    "model_path"
                ]
                if str(leader.get("algorithm", "")).strip().lower()
                in archive_entries_by_algorithm
                else None
            ),
            "retained_model_metadata_path": (
                archive_entries_by_algorithm[str(leader.get("algorithm", "")).strip().lower()][
                    "model_metadata_path"
                ]
                if str(leader.get("algorithm", "")).strip().lower()
                in archive_entries_by_algorithm
                else None
            ),
        }
        for metric_name, leader in metric_leaders.items()
    }

    manifest = {
        "archive_schema_version": RETAINED_MODEL_ARCHIVE_VERSION,
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "archive_root": str(archive_root),
        "retention_rule": "retain_overall_best_and_unique_metric_leaders",
        "model_count": len(archive_entries_by_algorithm),
        "metric_leaders": metric_archive_index,
        "models": list(archive_entries_by_algorithm.values()),
    }
    manifest_path = archive_root / "retained_models.json"
    write_json(manifest_path, manifest)
    return {
        **manifest,
        "manifest_path": str(manifest_path),
    }


def build_run_paths(base_model_path: Path, algorithm: str) -> dict[str, Path]:
    run_dir = base_model_path.parent / "runs" / algorithm
    model_stem = base_model_path.name
    return {
        "run_dir": run_dir,
        "final_model_path": run_dir / f"{model_stem}_{algorithm}_final",
        "best_checkpoint_model_path": run_dir / f"{model_stem}_{algorithm}_checkpoint_best",
        "selected_model_path": run_dir / f"{model_stem}_{algorithm}",
        "export_path": run_dir / "eval_scenario.json",
        "recording_path": run_dir / "eval_recording.jsonl",
    }


def build_checkpoint_artifact_paths(run_dir: Path, timesteps: int) -> dict[str, Path]:
    checkpoint_dir = run_dir / "checkpoints" / f"{timesteps:07d}"
    return {
        "checkpoint_dir": checkpoint_dir,
        "export_path": checkpoint_dir / "eval_scenario.json",
        "recording_path": checkpoint_dir / "eval_recording.jsonl",
    }


def load_model(algorithm: str, model_path: Path) -> BaseAlgorithm:
    validate_model_metadata(model_path, algorithm)
    return ALGORITHM_CLASSES[algorithm].load(str(model_path), device="cpu")


def create_model(
    algorithm: str, env: Monitor, args: argparse.Namespace
) -> tuple[BaseAlgorithm, dict[str, Any]]:
    rollout_steps = choose_rollout_steps(args.timesteps)
    batch_size = choose_batch_size(rollout_steps)

    if algorithm == "ppo":
        model = PPO(
            "MultiInputPolicy",
            env,
            verbose=1,
            device="cpu",
            learning_rate=3e-4,
            n_steps=rollout_steps,
            batch_size=batch_size,
            gamma=0.99,
            gae_lambda=0.95,
            ent_coef=0.01,
            seed=args.seed,
        )
        return model, {
            "training_strategy": "on_policy",
            "rollout_steps": rollout_steps,
            "batch_size": batch_size,
            "buffer_size": None,
            "learning_starts": None,
        }

    if algorithm == "a2c":
        model = A2C(
            "MultiInputPolicy",
            env,
            verbose=1,
            device="cpu",
            learning_rate=7e-4,
            n_steps=rollout_steps,
            gamma=0.99,
            gae_lambda=1.0,
            ent_coef=0.01,
            seed=args.seed,
        )
        return model, {
            "training_strategy": "on_policy",
            "rollout_steps": rollout_steps,
            "batch_size": None,
            "buffer_size": None,
            "learning_starts": None,
        }

    if algorithm == "sac":
        sac_batch_size = choose_replay_batch_size(args.timesteps)
        buffer_size = max(2000, args.timesteps * 10)
        learning_starts = choose_learning_starts(args.timesteps)
        model = SAC(
            "MultiInputPolicy",
            env,
            verbose=1,
            device="cpu",
            learning_rate=3e-4,
            batch_size=sac_batch_size,
            buffer_size=buffer_size,
            learning_starts=learning_starts,
            train_freq=1,
            gradient_steps=1,
            gamma=0.99,
            tau=0.02,
            seed=args.seed,
        )
        return model, {
            "training_strategy": "off_policy",
            "rollout_steps": None,
            "batch_size": sac_batch_size,
            "buffer_size": buffer_size,
            "learning_starts": learning_starts,
        }

    if algorithm == "ddpg":
        ddpg_batch_size = choose_replay_batch_size(args.timesteps)
        buffer_size = max(2000, args.timesteps * 10)
        learning_starts = choose_learning_starts(args.timesteps)
        action_dim = int(np.prod(env.action_space.shape))
        action_noise = NormalActionNoise(
            mean=np.zeros(action_dim, dtype=np.float32),
            sigma=np.full(action_dim, 0.1, dtype=np.float32),
        )
        model = DDPG(
            "MultiInputPolicy",
            env,
            verbose=1,
            device="cpu",
            learning_rate=1e-3,
            batch_size=ddpg_batch_size,
            buffer_size=buffer_size,
            learning_starts=learning_starts,
            train_freq=1,
            gradient_steps=1,
            gamma=0.99,
            tau=0.005,
            action_noise=action_noise,
            seed=args.seed,
        )
        return model, {
            "training_strategy": "off_policy",
            "rollout_steps": None,
            "batch_size": ddpg_batch_size,
            "buffer_size": buffer_size,
            "learning_starts": learning_starts,
        }

    if algorithm == "td3":
        td3_batch_size = choose_replay_batch_size(args.timesteps)
        buffer_size = max(2000, args.timesteps * 10)
        learning_starts = choose_learning_starts(args.timesteps)
        action_dim = int(np.prod(env.action_space.shape))
        action_noise = NormalActionNoise(
            mean=np.zeros(action_dim, dtype=np.float32),
            sigma=np.full(action_dim, 0.1, dtype=np.float32),
        )
        model = TD3(
            "MultiInputPolicy",
            env,
            verbose=1,
            device="cpu",
            learning_rate=1e-3,
            batch_size=td3_batch_size,
            buffer_size=buffer_size,
            learning_starts=learning_starts,
            train_freq=1,
            gradient_steps=1,
            gamma=0.99,
            tau=0.005,
            action_noise=action_noise,
            seed=args.seed,
        )
        return model, {
            "training_strategy": "off_policy",
            "rollout_steps": None,
            "batch_size": td3_batch_size,
            "buffer_size": buffer_size,
            "learning_starts": learning_starts,
        }

    supported = ", ".join(SUPPORTED_ALGORITHMS)
    raise ValueError(f"Unsupported algorithm '{algorithm}'. Supported: {supported}")


class ProgressCallback(BaseCallback):
    def __init__(
        self,
        *,
        args: argparse.Namespace,
        algorithm_name: str,
        run_index: int,
        total_runs: int,
        progress_path: Path,
        progress_state: dict[str, Any],
        run_state: dict[str, Any],
        best_model_path: Path,
    ):
        super().__init__(verbose=0)
        self.args = args
        self.algorithm_name = algorithm_name
        self.run_index = run_index
        self.total_runs = total_runs
        self.progress_path = progress_path
        self.progress_state = progress_state
        self.run_state = run_state
        self.best_model_path = best_model_path
        self.best_checkpoint_evaluation: dict[str, Any] | None = None
        self.last_eval_timestep = 0
        self.last_write_timestep = 0
        self.write_interval = max(32, min(args.progress_eval_frequency, 128))
        self.eval_counter = 0
        self.training_started = False
        self.current_curriculum_stage: dict[str, Any] | None = None
        self.curriculum_stage_index = 0
        self.curriculum_stage_count = 0

    def set_curriculum_stage(
        self,
        curriculum_stage: dict[str, Any] | None,
        stage_index: int,
        stage_count: int,
    ) -> None:
        self.current_curriculum_stage = curriculum_stage
        self.curriculum_stage_index = stage_index
        self.curriculum_stage_count = stage_count

    def _sync_progress_state(self) -> None:
        self.run_state["current_timesteps"] = self.num_timesteps
        self.run_state["current_stage"] = (
            self.current_curriculum_stage["key"]
            if self.current_curriculum_stage is not None
            else None
        )
        self.progress_state["status"] = "running"
        self.progress_state["current_algorithm"] = self.algorithm_name
        self.progress_state["current_timesteps"] = self.num_timesteps
        self.progress_state["current_stage"] = self.run_state["current_stage"]
        self.progress_state["overall_timesteps"] = min(
            (self.run_index * self.args.timesteps) + self.num_timesteps,
            self.args.timesteps * self.total_runs,
        )
        self.progress_state["checkpoints"] = list(self.run_state["checkpoints"])
        self.progress_state["episodes"] = list(self.run_state["episodes"])

    def _write_progress(self) -> None:
        self._sync_progress_state()
        write_json(self.progress_path, self.progress_state)

    def _append_checkpoint(
        self,
        evaluation: dict[str, Any],
        checkpoint_artifacts: dict[str, Path] | None = None,
    ) -> None:
        checkpoint = {
            "algorithm": self.algorithm_name,
            "timesteps": self.num_timesteps,
            "eval_mean_reward": evaluation["mean_reward"],
            "eval_std_reward": evaluation["std_reward"],
            "eval_success_rate": evaluation["success_rate"],
            "eval_failure_rate": evaluation["failure_rate"],
            "eval_truncated_rate": evaluation["truncated_rate"],
            "survivability": evaluation.get("survivability"),
            "weapon_efficiency": evaluation.get("weapon_efficiency"),
            "time_to_ready": evaluation.get("time_to_ready"),
            "tot_quality": evaluation.get("tot_quality"),
            "mean_episode_steps": evaluation["mean_episode_steps"],
            "done_reason": evaluation.get("done_reason"),
            "done_reason_detail": evaluation.get("done_reason_detail"),
            "selected_target_id": evaluation.get("selected_target_id"),
            "selected_target_ids": evaluation.get("selected_target_ids", []),
            "selected_target_assignments": evaluation.get(
                "selected_target_assignments", {}
            ),
            "launch_count": evaluation.get("launch_count"),
            "reward_breakdown": evaluation.get("reward_breakdown", {}),
            "curriculum_stage": (
                self.current_curriculum_stage["key"]
                if self.current_curriculum_stage is not None
                else None
            ),
            "export_path": (
                str(checkpoint_artifacts["export_path"])
                if checkpoint_artifacts is not None
                else None
            ),
            "recording_path": (
                str(checkpoint_artifacts["recording_path"])
                if checkpoint_artifacts is not None
                else None
            ),
            "replay_available": bool(
                checkpoint_artifacts is not None
                and checkpoint_artifacts["recording_path"].exists()
            ),
        }
        self.run_state["checkpoints"].append(checkpoint)
        if is_better_evaluation(evaluation, self.best_checkpoint_evaluation):
            ensure_parent(self.best_model_path)
            self.model.save(str(self.best_model_path))
            write_model_metadata(
                self.best_model_path,
                build_model_metadata(
                    self.args,
                    algorithm=self.algorithm_name,
                    model_path=self.best_model_path,
                    curriculum_stage=self.current_curriculum_stage,
                ),
            )
            self.best_checkpoint_evaluation = evaluation
            self.run_state["best_checkpoint"] = {
                **checkpoint,
                "model_path": str(model_zip_path(self.best_model_path)),
            }
            self._write_progress()

    def _run_checkpoint(self) -> None:
        checkpoint_artifacts = build_checkpoint_artifact_paths(
            self.best_model_path.parent, self.num_timesteps
        )
        evaluation = run_policy_evaluation(
            self.model,
            self.args,
            episodes=self.args.progress_eval_episodes,
            seed=self.args.seed + (self.eval_counter * 97),
            export_path=checkpoint_artifacts["export_path"],
            recording_path=checkpoint_artifacts["recording_path"],
            curriculum_stage=self.current_curriculum_stage,
        )
        self.eval_counter += 1
        self._append_checkpoint(evaluation, checkpoint_artifacts)

    def _on_training_start(self) -> None:
        self.run_state["status"] = "running"
        self._write_progress()
        if not self.training_started:
            self.training_started = True
            self._run_checkpoint()

    def _on_step(self) -> bool:
        infos = self.locals.get("infos", [])
        dones = self.locals.get("dones", [])
        for info, done in zip(infos, dones):
            if not done:
                continue
            episode_info = info.get("episode")
            if not isinstance(episode_info, dict):
                continue
            self.run_state["episodes"].append(
                {
                    "algorithm": self.algorithm_name,
                    "timesteps": self.num_timesteps,
                    "reward": float(episode_info.get("r", 0.0)),
                    "length": int(episode_info.get("l", 0)),
                }
            )

        if self.num_timesteps - self.last_eval_timestep >= self.args.progress_eval_frequency:
            self.last_eval_timestep = self.num_timesteps
            self._run_checkpoint()
        elif self.num_timesteps - self.last_write_timestep >= self.write_interval:
            self.last_write_timestep = self.num_timesteps
            self._write_progress()

        return True


def run_curriculum_training(
    model: BaseAlgorithm,
    args: argparse.Namespace,
    callback: ProgressCallback,
) -> dict[str, Any]:
    curriculum_stages = build_curriculum_stages(args)
    if len(curriculum_stages) == 0:
        raise RuntimeError("Curriculum mode requires at least one curriculum stage.")

    stage_summaries = [
        {
            "key": stage["key"],
            "label": stage["label"],
            "target_ids": list(stage["target_ids"]),
            "threat_scale": float(stage["threat_scale"]),
            "start_distance_scale": float(stage["start_distance_scale"]),
            "max_episode_steps": int(stage["max_episode_steps"]),
            "success_threshold": float(stage["success_threshold"]),
            "timesteps_trained": 0,
            "attempts": 0,
            "passed": False,
            "last_evaluation": None,
            "completed_at_timesteps": None,
        }
        for stage in curriculum_stages
    ]

    stage_index = 0
    total_timesteps_done = 0
    segment_timesteps = max(
        128,
        min(
            args.progress_eval_frequency,
            max(args.timesteps // max(len(curriculum_stages) * 2, 1), 128),
        ),
    )

    while total_timesteps_done < args.timesteps:
        stage = curriculum_stages[min(stage_index, len(curriculum_stages) - 1)]
        stage_summary = stage_summaries[min(stage_index, len(stage_summaries) - 1)]
        segment = min(segment_timesteps, args.timesteps - total_timesteps_done)

        stage_env = Monitor(create_env(args, stage))
        model.set_env(stage_env)
        callback.set_curriculum_stage(stage, stage_index, len(curriculum_stages))
        try:
            model.learn(
                total_timesteps=segment,
                reset_num_timesteps=total_timesteps_done == 0,
                progress_bar=False,
                callback=callback,
            )
        finally:
            stage_env.close()

        total_timesteps_done += segment
        stage_summary["timesteps_trained"] += segment
        stage_summary["attempts"] += 1
        stage_evaluation = run_benchmark_evaluation(
            model,
            args,
            episodes_per_seed=max(1, args.progress_eval_episodes),
            base_seed=args.seed + 200000 + (stage_index * 1000) + total_timesteps_done,
            seed_count=max(1, min(args.eval_seed_count, 2)),
            curriculum_stage=stage,
        )
        stage_summary["last_evaluation"] = stage_evaluation
        passed = float(stage_evaluation.get("success_rate", 0.0)) >= float(
            stage["success_threshold"]
        )
        stage_summary["passed"] = bool(stage_summary["passed"] or passed)
        if passed and stage_summary["completed_at_timesteps"] is None:
            stage_summary["completed_at_timesteps"] = total_timesteps_done
        if passed and stage_index < len(curriculum_stages) - 1:
            stage_index += 1

    callback.set_curriculum_stage(
        curriculum_stages[min(stage_index, len(curriculum_stages) - 1)],
        min(stage_index, len(curriculum_stages) - 1),
        len(curriculum_stages),
    )
    return {
        "enabled": True,
        "segment_timesteps": segment_timesteps,
        "stage_count": len(curriculum_stages),
        "completed_stage_count": sum(int(stage["passed"]) for stage in stage_summaries),
        "stages": stage_summaries,
    }


def train_algorithm(
    algorithm: str,
    args: argparse.Namespace,
    *,
    run_index: int,
    total_runs: int,
    progress_path: Path,
    progress_state: dict[str, Any],
) -> dict[str, Any]:
    run_state = progress_state["algorithm_runs"][algorithm]
    run_paths = build_run_paths(args.model_path, algorithm)
    curriculum_stages = build_curriculum_stages(args) if args.curriculum_enabled else []
    initial_curriculum_stage = curriculum_stages[0] if curriculum_stages else None
    progress_state["current_algorithm"] = algorithm
    run_state["status"] = "running"
    write_json(progress_path, progress_state)

    env = Monitor(create_env(args, initial_curriculum_stage))
    callback = ProgressCallback(
        args=args,
        algorithm_name=algorithm,
        run_index=run_index,
        total_runs=total_runs,
        progress_path=progress_path,
        progress_state=progress_state,
        run_state=run_state,
        best_model_path=run_paths["best_checkpoint_model_path"],
    )
    callback.set_curriculum_stage(
        initial_curriculum_stage,
        0 if initial_curriculum_stage is not None else 0,
        len(curriculum_stages),
    )
    model, training_metadata = create_model(algorithm, env, args)
    curriculum_summary: dict[str, Any] | None = None

    try:
        if args.curriculum_enabled:
            curriculum_summary = run_curriculum_training(model, args, callback)
        else:
            model.learn(total_timesteps=args.timesteps, progress_bar=False, callback=callback)
    finally:
        env.close()

    ensure_parent(run_paths["final_model_path"])
    model.save(str(run_paths["final_model_path"]))
    write_model_metadata(
        run_paths["final_model_path"],
        build_model_metadata(
            args,
            algorithm=algorithm,
            model_path=run_paths["final_model_path"],
            curriculum_stage=callback.current_curriculum_stage,
        ),
    )

    evaluation_candidates: list[tuple[str, Path, dict[str, Any]]] = []
    final_model = load_model(algorithm, run_paths["final_model_path"])
    final_evaluation = run_benchmark_evaluation(
        final_model,
        args,
        episodes_per_seed=args.eval_episodes,
        base_seed=args.seed,
        seed_count=args.eval_seed_count,
    )
    evaluation_candidates.append(("final", run_paths["final_model_path"], final_evaluation))

    if model_zip_path(run_paths["best_checkpoint_model_path"]).exists():
        checkpoint_model = load_model(algorithm, run_paths["best_checkpoint_model_path"])
        checkpoint_evaluation = run_benchmark_evaluation(
            checkpoint_model,
            args,
            episodes_per_seed=args.eval_episodes,
            base_seed=args.seed,
            seed_count=args.eval_seed_count,
        )
        evaluation_candidates.append(
            (
                "checkpoint_best",
                run_paths["best_checkpoint_model_path"],
                checkpoint_evaluation,
            )
        )

    selection_source, selected_model_source_path, _ = max(
        evaluation_candidates,
        key=lambda candidate: evaluation_score(candidate[2]),
    )
    copy_model_zip(selected_model_source_path, run_paths["selected_model_path"])
    selected_model = load_model(algorithm, run_paths["selected_model_path"])
    selected_evaluation = run_benchmark_evaluation(
        selected_model,
        args,
        episodes_per_seed=args.eval_episodes,
        base_seed=args.seed,
        seed_count=args.eval_seed_count,
        export_path=run_paths["export_path"],
        recording_path=run_paths["recording_path"],
    )

    run_state["status"] = "completed"
    run_state["current_timesteps"] = args.timesteps
    run_state["current_stage"] = (
        callback.current_curriculum_stage["key"]
        if callback.current_curriculum_stage is not None
        else None
    )
    run_state["final_model_path"] = str(model_zip_path(run_paths["final_model_path"]))
    run_state["selected_model_path"] = str(model_zip_path(run_paths["selected_model_path"]))
    run_state["final_evaluation"] = selected_evaluation
    progress_state["current_algorithm"] = algorithm
    progress_state["current_timesteps"] = args.timesteps
    progress_state["overall_timesteps"] = min(
        (run_index + 1) * args.timesteps,
        args.timesteps * total_runs,
    )
    progress_state["checkpoints"] = list(run_state["checkpoints"])
    progress_state["episodes"] = list(run_state["episodes"])
    write_json(progress_path, progress_state)

    return {
        "algorithm": algorithm,
        "timesteps": args.timesteps,
        "training_strategy": training_metadata["training_strategy"],
        "rollout_steps": training_metadata["rollout_steps"],
        "batch_size": training_metadata["batch_size"],
        "buffer_size": training_metadata["buffer_size"],
        "learning_starts": training_metadata["learning_starts"],
        "selection_source": selection_source,
        "selection_eval_seed_count": args.eval_seed_count,
        "curriculum": curriculum_summary,
        "model_path": str(model_zip_path(run_paths["selected_model_path"])),
        "model_metadata_path": str(model_metadata_path(run_paths["selected_model_path"])),
        "final_model_path": str(model_zip_path(run_paths["final_model_path"])),
        "final_model_metadata_path": str(model_metadata_path(run_paths["final_model_path"])),
        "best_checkpoint_model_path": (
            str(model_zip_path(run_paths["best_checkpoint_model_path"]))
            if model_zip_path(run_paths["best_checkpoint_model_path"]).exists()
            else None
        ),
        "best_checkpoint_model_metadata_path": (
            str(model_metadata_path(run_paths["best_checkpoint_model_path"]))
            if model_metadata_path(run_paths["best_checkpoint_model_path"]).exists()
            else None
        ),
        "export_path": str(run_paths["export_path"]),
        "eval_recording_path": str(run_paths["recording_path"]),
        "evaluation": {
            **selected_evaluation,
            "export_path": str(run_paths["export_path"]),
        },
        "candidate_evaluations": [
            {
                "source": source,
                "model_path": str(model_zip_path(model_path)),
                **evaluation,
            }
            for source, model_path, evaluation in evaluation_candidates
        ],
    }


def train_model(args: argparse.Namespace) -> dict[str, Any]:
    np.random.seed(args.seed)
    run_preflight(args)

    algorithms = normalize_algorithm_list(args.algorithms)
    progress_state = create_progress_state(args)
    write_json(args.progress_path, progress_state)

    run_summaries: list[dict[str, Any]] = []
    best_run_summary: dict[str, Any] | None = None

    for run_index, algorithm in enumerate(algorithms):
        try:
            run_summary = train_algorithm(
                algorithm,
                args,
                run_index=run_index,
                total_runs=len(algorithms),
                progress_path=args.progress_path,
                progress_state=progress_state,
            )
        except Exception as exc:
            run_state = progress_state["algorithm_runs"][algorithm]
            run_state["status"] = "failed"
            run_state["error"] = str(exc)
            progress_state["current_algorithm"] = algorithm
            progress_state["error"] = str(exc)
            write_json(args.progress_path, progress_state)
            raise

        run_summaries.append(run_summary)
        if is_better_evaluation(
            run_summary["evaluation"],
            None if best_run_summary is None else best_run_summary["evaluation"],
        ):
            best_run_summary = run_summary
            progress_state["best_run"] = {
                "algorithm": best_run_summary["algorithm"],
                "evaluation": best_run_summary["evaluation"],
                "model_path": best_run_summary["model_path"],
            }
            write_json(args.progress_path, progress_state)

    if best_run_summary is None:
        raise RuntimeError("No algorithm run completed successfully.")

    best_algorithm = best_run_summary["algorithm"]
    best_export_path = Path(best_run_summary["export_path"])
    best_recording_path = Path(best_run_summary["eval_recording_path"])
    best_model_source_path = Path(best_run_summary["model_path"].removesuffix(".zip"))

    copy_model_zip(best_model_source_path, args.model_path)
    copy_file(best_export_path, args.export_path)
    copy_file(best_recording_path, args.eval_recording_path)

    leaderboard = build_leaderboard(run_summaries)
    metric_leaders = build_metric_leaders(run_summaries)
    retained_models = build_retained_model_archive(args, run_summaries, metric_leaders)
    top_level_evaluation = {
        **best_run_summary["evaluation"],
        "export_path": str(args.export_path),
    }
    summary = {
        "summary_schema_version": SUMMARY_SCHEMA_VERSION,
        "model_path": str(model_zip_path(args.model_path)),
        "model_metadata_path": str(model_metadata_path(args.model_path)),
        "scenario_path": str(args.scenario_path),
        "progress_path": str(args.progress_path),
        "eval_recording_path": str(args.eval_recording_path),
        "timesteps": args.timesteps,
        "timesteps_total": args.timesteps * len(algorithms),
        "max_episode_steps": args.max_episode_steps,
        "seed": args.seed,
        "eval_seed_count": args.eval_seed_count,
        "training_mode": "curriculum" if args.curriculum_enabled else "standard",
        "observation_version": OBSERVATION_VERSION,
        "reward_version": REWARD_VERSION,
        "checkpoint_compatibility": {
            "legacy_models_reusable": False,
            "load_policy": "block_on_version_mismatch_warn_on_missing_metadata",
        },
        "algorithms": algorithms,
        "selection_metric": SELECTION_METRIC,
        "selected_algorithm": best_algorithm,
        "ally_ids": normalize_id_list(args.ally_ids, DEFAULT_ALLY_IDS),
        "target_ids": normalize_id_list(args.target_ids, DEFAULT_TARGET_IDS),
        "high_value_target_ids": normalize_id_list(
            args.high_value_target_ids, DEFAULT_HIGH_VALUE_TARGET_IDS
        ),
        "reward_config": {
            "kill_base": args.kill_base,
            "high_value_target_bonus": args.high_value_target_bonus,
            "damage_progress_weight": args.damage_progress_weight,
            "tot_weight": args.tot_weight,
            "tot_tau_seconds": args.tot_tau_seconds,
            "eta_progress_weight": args.eta_progress_weight,
            "ready_to_fire_bonus": args.ready_to_fire_bonus,
            "stagnation_penalty_per_assignment": args.stagnation_penalty_per_assignment,
            "target_switch_penalty": args.target_switch_penalty,
            "threat_step_penalty": args.threat_step_penalty,
            "launch_cost_per_weapon": args.launch_cost_per_weapon,
            "time_cost_per_step": args.time_cost_per_step,
            "loss_penalty_per_ally": args.loss_penalty_per_ally,
            "success_bonus": args.success_bonus,
            "failure_penalty": args.failure_penalty,
        },
        "artifact_policy": {
            "top_level_model": "overall_best_selected_model",
            "per_algorithm_artifacts": ["final", "checkpoint_best", "selected"],
            "retained_models": retained_models["retention_rule"],
        },
        "evaluation": top_level_evaluation,
        "best_run": best_run_summary,
        "leaderboard": leaderboard,
        "metric_leaders": metric_leaders,
        "retained_models": retained_models,
        "runs": run_summaries,
    }
    write_json(args.summary_path, summary)

    best_run_progress = progress_state["algorithm_runs"][best_algorithm]
    progress_state["status"] = "completed"
    progress_state["error"] = None
    progress_state["current_algorithm"] = best_algorithm
    progress_state["current_timesteps"] = args.timesteps
    progress_state["overall_timesteps"] = args.timesteps * len(algorithms)
    progress_state["checkpoints"] = list(best_run_progress["checkpoints"])
    progress_state["episodes"] = list(best_run_progress["episodes"])
    progress_state["final_evaluation"] = top_level_evaluation
    progress_state["best_run"] = {
        "algorithm": best_algorithm,
        "evaluation": top_level_evaluation,
        "model_path": str(model_zip_path(args.model_path)),
    }
    write_json(args.progress_path, progress_state)

    return summary


def mark_failed_progress(args: argparse.Namespace, error_message: str) -> None:
    progress_state = create_progress_state(args)
    if args.progress_path.exists():
        try:
            with args.progress_path.open("r", encoding="utf-8") as progress_file:
                progress_state = json.load(progress_file)
        except Exception:
            progress_state = create_progress_state(args)
    progress_state["status"] = "failed"
    progress_state["error"] = error_message
    write_json(args.progress_path, progress_state)


def main(args: argparse.Namespace) -> None:
    ensure_parent(args.summary_path)
    ensure_parent(args.export_path)
    ensure_parent(args.progress_path)
    ensure_parent(args.eval_recording_path)
    ensure_parent(args.model_path)
    summary = train_model(args)
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    cli_args = parse_args()
    try:
        main(cli_args)
    except Exception as exc:
        mark_failed_progress(cli_args, str(exc))
        raise SystemExit(f"FixedTargetStrike training failed: {exc}") from exc

