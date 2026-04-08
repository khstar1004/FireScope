from __future__ import annotations

import argparse
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
from blade.envs.fixed_target_strike_types import FixedTargetStrikeConfig

try:
    from stable_baselines3 import A2C, PPO, SAC
    from stable_baselines3.common.base_class import BaseAlgorithm
    from stable_baselines3.common.callbacks import BaseCallback
    from stable_baselines3.common.monitor import Monitor
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
SUPPORTED_ALGORITHMS = ("ppo", "a2c", "sac")
DEFAULT_ALGORITHMS = ("ppo",)
REQUIRED_REWARD_KEYS = {
    "kill_reward",
    "tot_bonus",
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


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Train Stable-Baselines3 policies on blade/FixedTargetStrike-v0"
    )
    parser.add_argument(
        "--algorithms",
        nargs="+",
        default=list(DEFAULT_ALGORITHMS),
        help="Algorithms to compare. Supported: ppo, a2c, sac.",
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
    parser.add_argument("--tot-weight", type=float, default=40.0)
    parser.add_argument("--tot-tau-seconds", type=float, default=8.0)
    parser.add_argument("--threat-step-penalty", type=float, default=-2.0)
    parser.add_argument("--launch-cost-per-weapon", type=float, default=-1.0)
    parser.add_argument("--time-cost-per-step", type=float, default=-0.05)
    parser.add_argument("--loss-penalty-per-ally", type=float, default=-80.0)
    parser.add_argument("--success-bonus", type=float, default=150.0)
    parser.add_argument("--failure-penalty", type=float, default=-150.0)
    args = parser.parse_args()
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


def copy_file(source_path: Path, destination_path: Path) -> None:
    ensure_parent(destination_path)
    shutil.copyfile(source_path, destination_path)


def copy_model_zip(source_model_path: Path, destination_model_path: Path) -> None:
    copy_file(model_zip_path(source_model_path), model_zip_path(destination_model_path))


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


def choose_sac_batch_size(total_timesteps: int) -> int:
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
        tot_weight=args.tot_weight,
        tot_tau_seconds=args.tot_tau_seconds,
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


def build_config(args: argparse.Namespace) -> FixedTargetStrikeConfig:
    ally_ids = normalize_id_list(args.ally_ids, DEFAULT_ALLY_IDS)
    target_ids = normalize_id_list(args.target_ids, DEFAULT_TARGET_IDS)
    return FixedTargetStrikeConfig(
        max_allies=len(ally_ids),
        max_targets=len(target_ids),
        max_episode_steps=args.max_episode_steps,
        normalize_margin_nm=120.0,
        eta_clip_seconds=1800.0,
        threat_buffer_nm=5.0,
        reward_config=build_reward_config(args),
        controllable_side_name=args.controllable_side_name,
        target_side_name=args.target_side_name,
        target_ids=target_ids,
        ally_ids=ally_ids,
    )


def load_game(scenario_path: Path) -> Game:
    game = Game(
        current_scenario=Scenario(),
        record_every_seconds=1,
        recording_export_path=str(scenario_path.parent),
    )
    with scenario_path.open("r", encoding="utf-8") as scenario_file:
        game.load_scenario(scenario_file.read())
    return game


def create_env(args: argparse.Namespace):
    config = build_config(args)
    game = load_game(args.scenario_path)
    return gym.make("blade/FixedTargetStrike-v0", game=game, config=config)


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
    env = create_env(args)
    observation, _ = env.reset(seed=args.seed)
    required_obs_keys = {
        "allies",
        "targets",
        "launch_eta",
        "impact_eta",
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
    return {
        "status": "running",
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
        "checkpoints": [],
        "episodes": [],
        "algorithm_runs": {
            algorithm: create_algorithm_progress_state(args, algorithm)
            for algorithm in algorithms
        },
        "best_run": None,
        "error": None,
    }


def run_policy_evaluation(
    model: BaseAlgorithm,
    args: argparse.Namespace,
    *,
    episodes: int,
    seed: int,
    export_path: Path | None = None,
    recording_path: Path | None = None,
) -> dict[str, Any]:
    env = create_env(args)
    totals: list[float] = []
    episode_steps_list: list[int] = []
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
            if recording_path is not None and episode_index == 0:
                recording_steps.append(json.dumps(env.unwrapped.game.export_scenario()))

        if episode_done_reason not in outcome_counts:
            episode_done_reason = "in_progress"
        outcome_counts[episode_done_reason] += 1
        totals.append(episode_reward)
        episode_steps_list.append(episode_steps)
        total_steps += episode_steps

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
        "done_reason_distribution": outcome_counts,
        "done_reason": last_info.get("done_reason"),
        "done_reason_detail": last_info.get("done_reason_detail"),
        "selected_target_id": last_info.get("selected_target_id"),
        "selected_target_ids": last_info.get("selected_target_ids", []),
        "selected_target_assignments": last_info.get("selected_target_assignments", {}),
        "launch_count": last_info.get("launch_count"),
        "reward_breakdown": last_info.get("reward_breakdown", {}),
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


def load_model(algorithm: str, model_path: Path) -> BaseAlgorithm:
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
        sac_batch_size = choose_sac_batch_size(args.timesteps)
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

    def _sync_progress_state(self) -> None:
        self.run_state["current_timesteps"] = self.num_timesteps
        self.progress_state["status"] = "running"
        self.progress_state["current_algorithm"] = self.algorithm_name
        self.progress_state["current_timesteps"] = self.num_timesteps
        self.progress_state["overall_timesteps"] = min(
            (self.run_index * self.args.timesteps) + self.num_timesteps,
            self.args.timesteps * self.total_runs,
        )
        self.progress_state["checkpoints"] = list(self.run_state["checkpoints"])
        self.progress_state["episodes"] = list(self.run_state["episodes"])

    def _write_progress(self) -> None:
        self._sync_progress_state()
        write_json(self.progress_path, self.progress_state)

    def _append_checkpoint(self, evaluation: dict[str, Any]) -> None:
        checkpoint = {
            "algorithm": self.algorithm_name,
            "timesteps": self.num_timesteps,
            "eval_mean_reward": evaluation["mean_reward"],
            "eval_std_reward": evaluation["std_reward"],
            "eval_success_rate": evaluation["success_rate"],
            "eval_failure_rate": evaluation["failure_rate"],
            "eval_truncated_rate": evaluation["truncated_rate"],
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
        }
        self.run_state["checkpoints"].append(checkpoint)
        if is_better_evaluation(evaluation, self.best_checkpoint_evaluation):
            ensure_parent(self.best_model_path)
            self.model.save(str(self.best_model_path))
            self.best_checkpoint_evaluation = evaluation
            self.run_state["best_checkpoint"] = {
                **checkpoint,
                "model_path": str(model_zip_path(self.best_model_path)),
            }
        self._write_progress()

    def _run_checkpoint(self) -> None:
        evaluation = run_policy_evaluation(
            self.model,
            self.args,
            episodes=self.args.progress_eval_episodes,
            seed=self.args.seed + (self.eval_counter * 97),
        )
        self.eval_counter += 1
        self._append_checkpoint(evaluation)

    def _on_training_start(self) -> None:
        self.run_state["status"] = "running"
        self._write_progress()
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
    progress_state["current_algorithm"] = algorithm
    run_state["status"] = "running"
    write_json(progress_path, progress_state)

    env = Monitor(create_env(args))
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
    model, training_metadata = create_model(algorithm, env, args)

    try:
        model.learn(total_timesteps=args.timesteps, progress_bar=False, callback=callback)
    finally:
        env.close()

    ensure_parent(run_paths["final_model_path"])
    model.save(str(run_paths["final_model_path"]))

    evaluation_candidates: list[tuple[str, Path, dict[str, Any]]] = []
    final_model = load_model(algorithm, run_paths["final_model_path"])
    final_evaluation = run_policy_evaluation(
        final_model,
        args,
        episodes=args.eval_episodes,
        seed=args.seed,
    )
    evaluation_candidates.append(("final", run_paths["final_model_path"], final_evaluation))

    if model_zip_path(run_paths["best_checkpoint_model_path"]).exists():
        checkpoint_model = load_model(algorithm, run_paths["best_checkpoint_model_path"])
        checkpoint_evaluation = run_policy_evaluation(
            checkpoint_model,
            args,
            episodes=args.eval_episodes,
            seed=args.seed,
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
    selected_evaluation = run_policy_evaluation(
        selected_model,
        args,
        episodes=args.eval_episodes,
        seed=args.seed,
        export_path=run_paths["export_path"],
        recording_path=run_paths["recording_path"],
    )

    run_state["status"] = "completed"
    run_state["current_timesteps"] = args.timesteps
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
        "model_path": str(model_zip_path(run_paths["selected_model_path"])),
        "final_model_path": str(model_zip_path(run_paths["final_model_path"])),
        "best_checkpoint_model_path": (
            str(model_zip_path(run_paths["best_checkpoint_model_path"]))
            if model_zip_path(run_paths["best_checkpoint_model_path"]).exists()
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

    top_level_evaluation = {
        **best_run_summary["evaluation"],
        "export_path": str(args.export_path),
    }
    summary = {
        "model_path": str(model_zip_path(args.model_path)),
        "scenario_path": str(args.scenario_path),
        "progress_path": str(args.progress_path),
        "eval_recording_path": str(args.eval_recording_path),
        "timesteps": args.timesteps,
        "timesteps_total": args.timesteps * len(algorithms),
        "max_episode_steps": args.max_episode_steps,
        "seed": args.seed,
        "algorithms": algorithms,
        "selection_metric": "success_rate_then_mean_reward_then_shorter_mean_episode_steps",
        "selected_algorithm": best_algorithm,
        "ally_ids": normalize_id_list(args.ally_ids, DEFAULT_ALLY_IDS),
        "target_ids": normalize_id_list(args.target_ids, DEFAULT_TARGET_IDS),
        "high_value_target_ids": normalize_id_list(
            args.high_value_target_ids, DEFAULT_HIGH_VALUE_TARGET_IDS
        ),
        "reward_config": {
            "kill_base": args.kill_base,
            "high_value_target_bonus": args.high_value_target_bonus,
            "tot_weight": args.tot_weight,
            "tot_tau_seconds": args.tot_tau_seconds,
            "threat_step_penalty": args.threat_step_penalty,
            "launch_cost_per_weapon": args.launch_cost_per_weapon,
            "time_cost_per_step": args.time_cost_per_step,
            "loss_penalty_per_ally": args.loss_penalty_per_ally,
            "success_bonus": args.success_bonus,
            "failure_penalty": args.failure_penalty,
        },
        "evaluation": top_level_evaluation,
        "best_run": best_run_summary,
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
