from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import gymnasium as gym
import numpy as np
import blade
from blade.Game import Game
from blade.Scenario import Scenario
from blade.envs.fixed_target_strike_reward import (
    FixedTargetStrikeRewardConfig,
    compute_fixed_target_strike_reward,
)
from blade.envs.fixed_target_strike_types import FixedTargetStrikeConfig, LaunchEvent, StepContext

SCRIPT_DIR = Path(__file__).resolve().parent
SCENARIO_PATH = SCRIPT_DIR / "scen.json"
REQUIRED_REWARD_KEYS = {
    "kill_reward",
    "tot_bonus",
    "threat_penalty",
    "launch_cost",
    "time_cost",
    "loss_cost",
    "terminal_bonus",
}


def build_config(max_episode_steps: int = 240) -> FixedTargetStrikeConfig:
    reward_config = FixedTargetStrikeRewardConfig(
        high_value_target_ids=("red-airbase",),
    )
    return FixedTargetStrikeConfig(
        max_allies=2,
        max_targets=2,
        max_episode_steps=max_episode_steps,
        normalize_margin_nm=120.0,
        eta_clip_seconds=1800.0,
        threat_buffer_nm=5.0,
        reward_config=reward_config,
        controllable_side_name="BLUE",
        target_side_name="RED",
        target_ids=["red-sam-site", "red-airbase"],
        ally_ids=["blue-striker-1", "blue-striker-2"],
    )


def load_game(record_every_seconds: int | None = None) -> Game:
    game = Game(
        current_scenario=Scenario(),
        record_every_seconds=record_every_seconds,
        recording_export_path=str(SCRIPT_DIR),
    )
    with SCENARIO_PATH.open("r", encoding="utf-8") as scenario_file:
        game.load_scenario(scenario_file.read())
    return game


def create_env(max_episode_steps: int = 240):
    config = build_config(max_episode_steps=max_episode_steps)
    game = load_game()
    return gym.make("blade/FixedTargetStrike-v0", game=game, config=config)


def build_fire_action(config: FixedTargetStrikeConfig) -> np.ndarray:
    ally_action_block_size = config.max_targets + 3
    action = np.zeros((config.max_allies * ally_action_block_size,), dtype=np.float32)
    for ally_index in range(config.max_allies):
        base_index = ally_index * ally_action_block_size
        action[base_index + 1] = 1.0
        control_index = base_index + config.max_targets
        action[control_index] = 0.95
        action[control_index + 1] = 0.5
        action[control_index + 2] = 0.0
    return action


def build_hold_action(config: FixedTargetStrikeConfig) -> np.ndarray:
    ally_action_block_size = config.max_targets + 3
    return np.zeros((config.max_allies * ally_action_block_size,), dtype=np.float32)


def assert_observation_contract(observation: dict[str, np.ndarray], config: FixedTargetStrikeConfig) -> None:
    expected_shapes = {
        "allies": (config.max_allies, 8),
        "targets": (config.max_targets, 6),
        "launch_eta": (config.max_allies, config.max_targets),
        "impact_eta": (config.max_allies, config.max_targets),
        "ally_mask": (config.max_allies,),
        "target_mask": (config.max_targets,),
        "global": (6,),
    }

    if set(observation) != set(expected_shapes):
        raise AssertionError(f"Unexpected observation keys: {sorted(observation)}")

    for key, expected_shape in expected_shapes.items():
        value = observation[key]
        if value.shape != expected_shape:
            raise AssertionError(f"{key} has shape {value.shape}, expected {expected_shape}")
        if value.dtype != np.float32:
            raise AssertionError(f"{key} has dtype {value.dtype}, expected float32")

    for mask_key in ("ally_mask", "target_mask"):
        mask = observation[mask_key]
        if not np.all(np.logical_or(mask == 0.0, mask == 1.0)):
            raise AssertionError(f"{mask_key} must be binary, got {mask}")

    if int(np.sum(observation["ally_mask"])) != 2:
        raise AssertionError("Expected two live controllable aircraft at reset")
    if int(np.sum(observation["target_mask"])) != 2:
        raise AssertionError("Expected two live hostile fixed targets at reset")


def assert_reward_breakdown(info: dict[str, Any]) -> None:
    breakdown = info.get("reward_breakdown")
    if not isinstance(breakdown, dict):
        raise AssertionError("info['reward_breakdown'] must be a dict")
    missing_keys = REQUIRED_REWARD_KEYS.difference(breakdown)
    if missing_keys:
        raise AssertionError(f"reward_breakdown missing keys: {sorted(missing_keys)}")


def run_live_env_checks() -> dict[str, str]:
    env = create_env(max_episode_steps=12)
    observation, info = env.reset(seed=7)
    config = env.unwrapped.config
    assert_observation_contract(observation, config)
    if info.get("done_reason") != "reset":
        raise AssertionError(f"Unexpected reset done_reason: {info.get('done_reason')}")
    if info.get("done_reason_detail") != "reset":
        raise AssertionError(f"Unexpected reset done_reason_detail: {info.get('done_reason_detail')}")

    action = build_fire_action(config)
    observation, _, terminated, truncated, info = env.step(action)
    assert_observation_contract(observation, config)
    assert_reward_breakdown(info)
    if terminated or truncated:
        raise AssertionError("Initial fallback step should not immediately end the episode")
    if info.get("launch_count") != 0:
        raise AssertionError("Out-of-range fire action should fall back instead of firing")
    if info.get("selected_target_id") != "red-airbase":
        raise AssertionError(f"Expected red-airbase to be selected, got {info.get('selected_target_id')}")
    if info.get("selected_target_ids") != ["red-airbase", "red-airbase"]:
        raise AssertionError(
            f"Expected both allies to target red-airbase, got {info.get('selected_target_ids')}"
        )
    if not any(env.unwrapped.game.current_scenario.get_aircraft(ally_id).route for ally_id in config.ally_ids or []):
        raise AssertionError("Out-of-range fire action did not assign reposition routes")

    for _ in range(4):
        _, _, terminated, truncated, info = env.step(action)
        assert_reward_breakdown(info)
        if terminated or truncated:
            break
    env.close()

    launch_env = create_env(max_episode_steps=6)
    launch_env.reset(seed=7)
    launch_env.unwrapped.game.current_scenario.get_facility("red-sam-site").weapons = []
    launch_positions = [(34.44, 127.40), (34.46, 127.38)]
    for ally_id, (latitude, longitude) in zip(config.ally_ids or [], launch_positions):
        aircraft = launch_env.unwrapped.game.current_scenario.get_aircraft(ally_id)
        aircraft.latitude = latitude
        aircraft.longitude = longitude
        aircraft.route = []
    _, _, _, _, launch_info = launch_env.step(build_fire_action(launch_env.unwrapped.config))
    launch_env.close()
    assert_reward_breakdown(launch_info)
    if launch_info.get("launch_count", 0) < 2:
        raise AssertionError(f"Expected paired launch in-range, got {launch_info.get('launch_count')}")
    if launch_info.get("selected_target_id") != "red-airbase":
        raise AssertionError("In-range fire step changed the selected target unexpectedly")
    if launch_info.get("selected_target_ids") != ["red-airbase", "red-airbase"]:
        raise AssertionError("Expected both in-range allies to keep the same assigned target")
    launch_breakdown = launch_info["reward_breakdown"]
    if launch_breakdown["launch_cost"] >= 0:
        raise AssertionError("In-range launch should produce a negative launch_cost")
    if launch_breakdown["tot_bonus"] <= 0:
        raise AssertionError("Paired in-range launch should produce a positive tot_bonus")
    if launch_breakdown.get("tot_group_count", 0) < 1:
        raise AssertionError("Expected TOT debug groups for paired launch")

    truncated_env = create_env(max_episode_steps=3)
    truncated_env.reset(seed=7)
    truncated_info: dict[str, Any] = {}
    for _ in range(3):
        _, _, terminated, truncated, truncated_info = truncated_env.step(
            build_hold_action(truncated_env.unwrapped.config)
        )
        if terminated or truncated:
            break
    truncated_env.close()
    if truncated_info.get("done_reason") != "truncated":
        raise AssertionError(
            f"Expected truncated done_reason category, got {truncated_info.get('done_reason')}"
        )
    if truncated_info.get("done_reason_detail") != "max_episode_steps":
        raise AssertionError(
            "Expected max_episode_steps done_reason_detail for truncated episode"
        )

    failure_env = create_env(max_episode_steps=6)
    failure_env.reset(seed=7)
    for aircraft in failure_env.unwrapped.game.current_scenario.aircraft:
        aircraft.weapons = []
    _, _, terminated, truncated, failure_info = failure_env.step(
        build_hold_action(failure_env.unwrapped.config)
    )
    failure_env.close()
    if not terminated or truncated:
        raise AssertionError("Expected immediate failure when allies have no attack capability")
    if failure_info.get("done_reason") != "failure":
        raise AssertionError(
            f"Expected failure done_reason category, got {failure_info.get('done_reason')}"
        )
    if failure_info.get("done_reason_detail") != "no_attack_capability":
        raise AssertionError(
            "Expected no_attack_capability done_reason_detail for capability failure"
        )

    success_env = create_env(max_episode_steps=6)
    success_env.reset(seed=7)
    success_env.unwrapped.game.current_scenario.facilities = []
    success_env.unwrapped.game.current_scenario.airbases = []
    _, _, terminated, truncated, success_info = success_env.step(
        build_hold_action(success_env.unwrapped.config)
    )
    success_env.close()
    if not terminated or truncated:
        raise AssertionError("Expected immediate success when all hostile targets are gone")
    if success_info.get("done_reason") != "success":
        raise AssertionError(
            f"Expected success done_reason category, got {success_info.get('done_reason')}"
        )
    if success_info.get("done_reason_detail") != "all_targets_destroyed":
        raise AssertionError(
            "Expected all_targets_destroyed done_reason_detail for success case"
        )

    return {
        "launch": str(launch_info.get("done_reason")),
        "truncated": str(truncated_info.get("done_reason")),
        "failure": str(failure_info.get("done_reason")),
        "success": str(success_info.get("done_reason")),
        "launch_detail": str(launch_info.get("done_reason_detail")),
        "truncated_detail": str(truncated_info.get("done_reason_detail")),
        "failure_detail": str(failure_info.get("done_reason_detail")),
        "success_detail": str(success_info.get("done_reason_detail")),
    }


def build_reward_context(
    scenario: Scenario,
    observation: dict[str, np.ndarray],
    config: FixedTargetStrikeConfig,
    *,
    launch_events: list[LaunchEvent] | None = None,
    threat_exposure_count: int = 0,
    destroyed_target_ids: list[str] | None = None,
    lost_ally_ids: list[str] | None = None,
    success: bool = False,
    failure: bool = False,
    done_reason: str | None = None,
) -> StepContext:
    return StepContext(
        step_index=1,
        current_time_s=scenario.current_time,
        config=config,
        scenario=scenario,
        observation=observation,
        selected_target_id="red-airbase",
        selected_target_name="Red Airbase",
        selected_target_slot=1,
        target_priorities=[0.0, 1.0],
        selected_target_ids=["red-airbase", "red-airbase"],
        selected_target_slots=[1, 1],
        ally_target_assignments={
            "blue-striker-1": "red-airbase",
            "blue-striker-2": "red-airbase",
        },
        ally_target_priority_vectors={
            "blue-striker-1": [0.0, 1.0],
            "blue-striker-2": [0.0, 1.0],
        },
        launch_events=launch_events or [],
        destroyed_target_ids=destroyed_target_ids or [],
        lost_ally_ids=lost_ally_ids or [],
        remaining_target_ids=["red-sam-site", "red-airbase"],
        remaining_ally_ids=["blue-striker-1", "blue-striker-2"],
        threat_exposure_count=threat_exposure_count,
        success=success,
        failure=failure,
        truncated=False,
        terminated=success or failure,
        done_reason=done_reason,
    )


def run_reward_checks() -> dict[str, float]:
    env = create_env(max_episode_steps=12)
    observation, _ = env.reset(seed=11)
    scenario = env.unwrapped.game.current_scenario
    config = env.unwrapped.config

    tight_context = build_reward_context(
        scenario,
        observation,
        config,
        launch_events=[
            LaunchEvent(
                aircraft_id="blue-striker-1",
                aircraft_name="Blue Striker 1",
                target_id="red-airbase",
                target_name="Red Airbase",
                weapon_id="blue-striker-1-maverick",
                weapon_name="AGM-65D Maverick",
                launch_time_s=scenario.current_time,
                launch_distance_nm=40.0,
                weapon_speed_kts=540.0,
                estimated_impact_time_s=100.0,
            ),
            LaunchEvent(
                aircraft_id="blue-striker-2",
                aircraft_name="Blue Striker 2",
                target_id="red-airbase",
                target_name="Red Airbase",
                weapon_id="blue-striker-2-maverick",
                weapon_name="AGM-65D Maverick",
                launch_time_s=scenario.current_time,
                launch_distance_nm=41.0,
                weapon_speed_kts=540.0,
                estimated_impact_time_s=103.0,
            ),
        ],
    )
    loose_context = build_reward_context(
        scenario,
        observation,
        config,
        launch_events=[
            LaunchEvent(
                aircraft_id="blue-striker-1",
                aircraft_name="Blue Striker 1",
                target_id="red-airbase",
                target_name="Red Airbase",
                weapon_id="blue-striker-1-maverick",
                weapon_name="AGM-65D Maverick",
                launch_time_s=scenario.current_time,
                launch_distance_nm=40.0,
                weapon_speed_kts=540.0,
                estimated_impact_time_s=100.0,
            ),
            LaunchEvent(
                aircraft_id="blue-striker-2",
                aircraft_name="Blue Striker 2",
                target_id="red-airbase",
                target_name="Red Airbase",
                weapon_id="blue-striker-2-maverick",
                weapon_name="AGM-65D Maverick",
                launch_time_s=scenario.current_time,
                launch_distance_nm=41.0,
                weapon_speed_kts=540.0,
                estimated_impact_time_s=132.0,
            ),
        ],
    )
    tight_reward, tight_breakdown = compute_fixed_target_strike_reward(tight_context, config)
    loose_reward, loose_breakdown = compute_fixed_target_strike_reward(loose_context, config)
    if tight_breakdown["tot_bonus"] <= loose_breakdown["tot_bonus"]:
        raise AssertionError("Tighter TOT synchronization should produce a larger tot_bonus")

    safe_context = build_reward_context(scenario, observation, config, threat_exposure_count=0)
    unsafe_context = build_reward_context(scenario, observation, config, threat_exposure_count=3)
    safe_reward, _ = compute_fixed_target_strike_reward(safe_context, config)
    unsafe_reward, unsafe_breakdown = compute_fixed_target_strike_reward(unsafe_context, config)
    if unsafe_reward >= safe_reward:
        raise AssertionError("Higher threat exposure should reduce reward")
    if unsafe_breakdown["threat_penalty"] >= 0:
        raise AssertionError("Threat penalty must be negative when threat exposure exists")

    success_context = build_reward_context(
        scenario,
        observation,
        config,
        destroyed_target_ids=["red-airbase"],
        success=True,
        done_reason="success",
    )
    _, success_breakdown = compute_fixed_target_strike_reward(success_context, config)
    if success_breakdown["kill_reward"] <= 100.0:
        raise AssertionError("High-value target destruction should exceed the base kill reward")
    if success_breakdown["terminal_bonus"] <= 0:
        raise AssertionError("Success terminal bonus must be positive")

    failure_context = build_reward_context(
        scenario,
        observation,
        config,
        lost_ally_ids=["blue-striker-1"],
        failure=True,
        done_reason="failure",
    )
    _, failure_breakdown = compute_fixed_target_strike_reward(failure_context, config)
    if failure_breakdown["loss_cost"] >= 0:
        raise AssertionError("Lost allies must incur a negative loss_cost")
    if failure_breakdown["terminal_bonus"] >= 0:
        raise AssertionError("Failure terminal bonus must be negative")

    env.close()
    return {
        "tight_tot_bonus": float(tight_breakdown["tot_bonus"]),
        "loose_tot_bonus": float(loose_breakdown["tot_bonus"]),
        "unsafe_threat_penalty": float(unsafe_breakdown["threat_penalty"]),
        "success_reward": float(success_breakdown["total_reward"]),
        "failure_reward": float(failure_breakdown["total_reward"]),
        "tight_reward": float(tight_reward),
        "loose_reward": float(loose_reward),
        "tight_tot_group_count": float(tight_breakdown["tot_group_count"]),
    }


def main() -> None:
    summary = {
        "status": "ok",
        "env_done_reasons": run_live_env_checks(),
        "reward_checks": run_reward_checks(),
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        raise SystemExit(f"FixedTargetStrike smoke check failed: {exc}") from exc
