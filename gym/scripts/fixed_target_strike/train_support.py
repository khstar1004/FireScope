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

try:
    from stable_baselines3 import A2C, DDPG, PPO, SAC, TD3
    from stable_baselines3.common.base_class import BaseAlgorithm
    from stable_baselines3.common.callbacks import BaseCallback
    from stable_baselines3.common.monitor import Monitor
    from stable_baselines3.common.noise import NormalActionNoise
except ImportError as exc:
    raise SystemExit(
        "stable-baselines3 is not installed. Run `pip install -e .[gym]` from the gym directory."
    ) from exc

DEFAULT_SCENARIO_PATH = SCRIPT_DIR / "scen.json"
DEFAULT_MODEL_PATH = SCRIPT_DIR / "fixed_target_strike_policy"
DEFAULT_EXPORT_PATH = SCRIPT_DIR / "fixed_target_strike_eval_scen.json"
DEFAULT_SUMMARY_PATH = SCRIPT_DIR / "fixed_target_strike_eval_summary.json"
DEFAULT_PROGRESS_PATH = SCRIPT_DIR / "fixed_target_strike_progress.json"
DEFAULT_EVAL_RECORDING_PATH = SCRIPT_DIR / "fixed_target_strike_eval_recording.jsonl"
DEFAULT_ALLY_IDS = ["blue-striker-1", "blue-striker-2"]
DEFAULT_TARGET_IDS = ["red-sam-site", "red-airbase"]
DEFAULT_HIGH_VALUE_TARGET_IDS = ["red-airbase"]
SUMMARY_SCHEMA_VERSION = 3
MODEL_METADATA_VERSION = 1
RETAINED_MODEL_ARCHIVE_VERSION = 1
SUPPORTED_ALGORITHMS = ("ppo", "a2c", "sac", "ddpg", "td3")
DEFAULT_ALGORITHMS = ("ppo",)
SELECTION_METRIC = (
    "success_rate_then_mean_reward_then_shorter_mean_episode_steps"
)
RETAINED_METRICS = (
    ("overall", None, "max"),
    ("success_rate", "success_rate", "max"),
    ("mean_reward", "mean_reward", "max"),
    ("survivability", "survivability", "max"),
    ("weapon_efficiency", "weapon_efficiency", "max"),
    ("tot_quality", "tot_quality", "max"),
    ("time_to_ready", "time_to_ready", "min"),
)
REQUIRED_REWARD_KEYS = {
    "kill_reward",
    "damage_progress_reward",
    "tot_bonus",
    "eta_progress_bonus",
    "ready_to_fire_bonus",
    "stagnation_penalty",
    "target_switch_penalty",
    "threat_penalty",
    "launch_cost",
    "time_cost",
    "loss_cost",
    "terminal_bonus",
}
ALGORITHM_CLASSES = {
    "ppo": PPO,
    "a2c": A2C,
    "sac": SAC,
    "ddpg": DDPG,
    "td3": TD3,
}


def normalize_id_list(values: Sequence[str] | None, fallback: list[str]) -> list[str]:
    normalized = [value.strip() for value in (values or fallback) if value.strip()]
    return normalized or list(fallback)


def normalize_algorithm_list(values: Sequence[str] | None) -> list[str]:
    normalized: list[str] = []
    seen: set[str] = set()
    for value in values or DEFAULT_ALGORITHMS:
        candidate = value.strip().lower()
        if not candidate:
            continue
        if candidate not in SUPPORTED_ALGORITHMS:
            supported = ", ".join(SUPPORTED_ALGORITHMS)
            raise ValueError(
                f"Unsupported algorithm '{value}'. Supported algorithms: {supported}"
            )
        if candidate in seen:
            continue
        seen.add(candidate)
        normalized.append(candidate)
    return normalized or list(DEFAULT_ALGORITHMS)


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Train Stable-Baselines3 policies on vista/FixedTargetStrike-v0"
    )
    parser.add_argument(
        "--algorithms",
        nargs="+",
        default=list(DEFAULT_ALGORITHMS),
        help="Algorithms to compare. Supported: ppo, a2c, sac, ddpg, td3.",
    )
    parser.add_argument(
        "--timesteps",
        type=int,
        default=4096,
        help="Training timesteps per algorithm.",
    )
    parser.add_argument(
        "--max-episode-steps",
        type=int,
        default=240,
        help="Episode cap for the environment.",
    )
    parser.add_argument(
        "--eval-episodes",
        type=int,
        default=1,
        help="Number of deterministic evaluation episodes per candidate model.",
    )
    parser.add_argument(
        "--eval-seed-count",
        type=int,
        default=3,
        help="Number of evaluation seeds to aggregate per candidate model.",
    )
    parser.add_argument("--seed", type=int, default=7, help="Random seed.")
    parser.add_argument(
        "--progress-eval-frequency",
        type=int,
        default=512,
        help="How often to run an evaluation checkpoint during training.",
    )
    parser.add_argument(
        "--progress-eval-episodes",
        type=int,
        default=1,
        help="Episodes per progress checkpoint evaluation.",
    )
    parser.add_argument(
        "--curriculum-enabled",
        action="store_true",
        help="Train with staged curriculum mutations before the full scenario.",
    )
    parser.add_argument(
        "--guided-launch-bootstrap-steps",
        type=int,
        default=0,
        help="Apply a launch bootstrap heuristic for the first N steps until the first launch.",
    )
    parser.add_argument(
        "--scenario-path",
        type=Path,
        default=DEFAULT_SCENARIO_PATH,
        help="Scenario JSON to train on.",
    )
    parser.add_argument(
        "--model-path",
        type=Path,
        default=DEFAULT_MODEL_PATH,
        help="Top-level selected model output path without the .zip suffix.",
    )
    parser.add_argument(
        "--export-path",
        type=Path,
        default=DEFAULT_EXPORT_PATH,
        help="Top-level selected evaluation scenario export path.",
    )
    parser.add_argument(
        "--summary-path",
        type=Path,
        default=DEFAULT_SUMMARY_PATH,
        help="Final evaluation summary path.",
    )
    parser.add_argument(
        "--progress-path",
        type=Path,
        default=DEFAULT_PROGRESS_PATH,
        help="Live training progress JSON path.",
    )
    parser.add_argument(
        "--eval-recording-path",
        type=Path,
        default=DEFAULT_EVAL_RECORDING_PATH,
        help="Top-level selected evaluation replay JSONL output path.",
    )
    parser.add_argument(
        "--controllable-side-name",
        type=str,
        default="BLUE",
        help="Name of the RL-controlled side.",
    )
    parser.add_argument(
        "--target-side-name",
        type=str,
        default="RED",
        help="Name of the hostile target side.",
    )
    parser.add_argument(
        "--ally-ids",
        nargs="+",
        default=list(DEFAULT_ALLY_IDS),
        help="Ordered controllable aircraft ids.",
    )
    parser.add_argument(
        "--target-ids",
        nargs="+",
        default=list(DEFAULT_TARGET_IDS),
        help="Ordered hostile fixed target ids.",
    )
    parser.add_argument(
        "--high-value-target-ids",
        nargs="*",
        default=list(DEFAULT_HIGH_VALUE_TARGET_IDS),
        help="Targets that should receive the high-value reward bonus.",
    )
    parser.add_argument("--kill-base", type=float, default=100.0)
    parser.add_argument("--high-value-target-bonus", type=float, default=50.0)
    parser.add_argument("--damage-progress-weight", type=float, default=30.0)
    parser.add_argument("--tot-weight", type=float, default=40.0)
    parser.add_argument("--tot-tau-seconds", type=float, default=8.0)
    parser.add_argument("--eta-progress-weight", type=float, default=6.0)
    parser.add_argument("--ready-to-fire-bonus", type=float, default=2.5)
    parser.add_argument(
        "--stagnation-penalty-per-assignment", type=float, default=-0.15
    )
    parser.add_argument("--target-switch-penalty", type=float, default=-0.3)
    parser.add_argument("--threat-step-penalty", type=float, default=-2.0)
    parser.add_argument("--launch-cost-per-weapon", type=float, default=-1.0)
    parser.add_argument("--time-cost-per-step", type=float, default=-0.05)
    parser.add_argument("--loss-penalty-per-ally", type=float, default=-80.0)
    parser.add_argument("--success-bonus", type=float, default=150.0)
    parser.add_argument("--failure-penalty", type=float, default=-150.0)
    args = parser.parse_args(argv)
    args.algorithms = normalize_algorithm_list(args.algorithms)
    return args


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def write_json(path: Path, payload: Any) -> None:
    ensure_parent(path)
    with path.open("w", encoding="utf-8") as output_file:
        json.dump(payload, output_file, indent=2)


def model_zip_path(model_path: Path) -> Path:
    return Path(f"{model_path}.zip")


def model_metadata_path(model_path: Path) -> Path:
    return Path(f"{model_path}.metadata.json")


def copy_file(source_path: Path, destination_path: Path) -> None:
    ensure_parent(destination_path)
    shutil.copyfile(source_path, destination_path)


def copy_model_zip(source_model_path: Path, destination_model_path: Path) -> None:
    copy_file(model_zip_path(source_model_path), model_zip_path(destination_model_path))
    source_metadata_path = model_metadata_path(source_model_path)
    if source_metadata_path.exists():
        copy_file(source_metadata_path, model_metadata_path(destination_model_path))


def copy_optional_file(source_path: str | Path | None, destination_path: Path) -> str | None:
    if source_path is None:
        return None
    source = Path(source_path)
    if not source.exists():
        return None
    copy_file(source, destination_path)
    return str(destination_path)


def write_model_metadata(model_path: Path, payload: Any) -> None:
    write_json(model_metadata_path(model_path), payload)


def read_model_metadata(model_path: Path) -> dict[str, Any] | None:
    metadata_path = model_metadata_path(model_path)
    if not metadata_path.exists():
        return None
    with metadata_path.open("r", encoding="utf-8") as metadata_file:
        return json.load(metadata_file)


def build_model_metadata(
    args: argparse.Namespace,
    *,
    algorithm: str,
    model_path: Path,
    curriculum_stage: dict[str, Any] | None = None,
) -> dict[str, Any]:
    return {
        "metadata_version": MODEL_METADATA_VERSION,
        "algorithm": algorithm,
        "model_path": str(model_zip_path(model_path)),
        "scenario_path": str(args.scenario_path),
        "training_mode": "curriculum" if args.curriculum_enabled else "standard",
        "observation_version": OBSERVATION_VERSION,
        "reward_version": REWARD_VERSION,
        "curriculum_stage": curriculum_stage["key"] if curriculum_stage is not None else None,
    }


def validate_model_metadata(model_path: Path, algorithm: str) -> dict[str, Any] | None:
    metadata = read_model_metadata(model_path)
    if metadata is None:
        print(
            f"Warning: model metadata missing for {model_zip_path(model_path)}. "
            "Legacy checkpoints may be incompatible with the current observation/reward contract.",
            file=sys.stderr,
        )
        return None

    metadata_algorithm = str(metadata.get("algorithm", "")).strip().lower()
    if metadata_algorithm and metadata_algorithm != algorithm:
        raise RuntimeError(
            f"Model algorithm mismatch for {model_zip_path(model_path)}: "
            f"expected {algorithm}, found {metadata_algorithm}."
        )

    observation_version = int(metadata.get("observation_version", -1))
    reward_version = int(metadata.get("reward_version", -1))
    if observation_version != OBSERVATION_VERSION or reward_version != REWARD_VERSION:
        raise RuntimeError(
            "Model version mismatch: "
            f"observation v{observation_version}/reward v{reward_version} "
            f"cannot be loaded with current observation v{OBSERVATION_VERSION}/"
            f"reward v{REWARD_VERSION}."
        )
    return metadata


def choose_rollout_steps(total_timesteps: int) -> int:
    if total_timesteps <= 64:
        return 64
    if total_timesteps <= 128:
        return 128
    return 256


def choose_batch_size(rollout_steps: int) -> int:
    for batch_size in (64, 32, 16, 8):
        if rollout_steps % batch_size == 0:
            return batch_size
    return rollout_steps


def choose_replay_batch_size(total_timesteps: int) -> int:
    if total_timesteps <= 128:
        return 16
    if total_timesteps <= 512:
        return 32
    return 64


def choose_learning_starts(total_timesteps: int) -> int:
    if total_timesteps <= 64:
        return max(4, total_timesteps // 4)
    return min(256, max(16, total_timesteps // 8))


def build_reward_config(args: argparse.Namespace) -> FixedTargetStrikeRewardConfig:
    return FixedTargetStrikeRewardConfig(
        kill_base=args.kill_base,
        high_value_target_bonus=args.high_value_target_bonus,
        damage_progress_weight=args.damage_progress_weight,
        tot_weight=args.tot_weight,
        tot_tau_seconds=args.tot_tau_seconds,
        eta_progress_weight=args.eta_progress_weight,
        ready_to_fire_bonus=args.ready_to_fire_bonus,
        stagnation_penalty_per_assignment=args.stagnation_penalty_per_assignment,
        target_switch_penalty=args.target_switch_penalty,
        threat_step_penalty=args.threat_step_penalty,
        launch_cost_per_weapon=args.launch_cost_per_weapon,
        time_cost_per_step=args.time_cost_per_step,
        loss_penalty_per_ally=args.loss_penalty_per_ally,
        success_bonus=args.success_bonus,
        failure_penalty=args.failure_penalty,
        high_value_target_ids=tuple(
            normalize_id_list(args.high_value_target_ids, DEFAULT_HIGH_VALUE_TARGET_IDS)
        ),
    )



