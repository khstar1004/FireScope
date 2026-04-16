from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Sequence

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

import train as train_module

COMPARISON_SUMMARY_SCHEMA_VERSION = 1
DEFAULT_OUTPUT_ROOT = SCRIPT_DIR / "comparisons"
COMPARE_PRESETS: dict[str, dict[str, Any]] = {
    "full": {
        "algorithms": ["ppo", "sac", "td3", "ddpg"],
    },
    "baseline": {
        "algorithms": ["ppo", "sac"],
    },
    "deterministic": {
        "algorithms": ["td3", "ddpg"],
    },
    "curriculum": {
        "algorithms": ["ppo", "sac", "td3"],
        "curriculum_enabled": True,
    },
    "smoke": {
        "algorithms": ["ppo", "td3"],
        "timesteps": 128,
        "eval_episodes": 1,
        "eval_seed_count": 1,
        "progress_eval_frequency": 64,
        "progress_eval_episodes": 1,
    },
}


def slugify(value: str) -> str:
    normalized = re.sub(r"[^a-zA-Z0-9_-]+", "-", value.strip()).strip("-_")
    return normalized.lower() or "comparison"


def parse_args(
    argv: Sequence[str] | None = None,
) -> tuple[argparse.Namespace, list[str]]:
    parser = argparse.ArgumentParser(
        description="Run standardized multi-algorithm comparisons for FixedTargetStrike-v0"
    )
    parser.add_argument(
        "--preset",
        choices=sorted(COMPARE_PRESETS),
        default="full",
        help="Comparison preset with default algorithm sets and smoke shortcuts.",
    )
    parser.add_argument(
        "--run-label",
        type=str,
        default=None,
        help="Optional label for the comparison output folder.",
    )
    parser.add_argument(
        "--output-root",
        type=Path,
        default=DEFAULT_OUTPUT_ROOT,
        help="Directory where comparison outputs should be stored.",
    )
    parser.add_argument(
        "--comparison-summary-name",
        type=str,
        default="comparison_summary.json",
        help="Filename for the standardized comparison report.",
    )
    parser.add_argument(
        "--leaderboard-csv-name",
        type=str,
        default="leaderboard.csv",
        help="Filename for the flattened leaderboard CSV export.",
    )
    return parser.parse_known_args(argv)


def build_run_label(compare_args: argparse.Namespace) -> str:
    if compare_args.run_label:
        return slugify(compare_args.run_label)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    return f"{compare_args.preset}-{timestamp}"


def build_default_train_argv(
    compare_args: argparse.Namespace, run_dir: Path
) -> list[str]:
    preset = COMPARE_PRESETS[compare_args.preset]
    train_argv = [
        "--model-path",
        str(run_dir / "selected_model"),
        "--export-path",
        str(run_dir / "eval_scenario.json"),
        "--summary-path",
        str(run_dir / "train_summary.json"),
        "--progress-path",
        str(run_dir / "progress.json"),
        "--eval-recording-path",
        str(run_dir / "eval_recording.jsonl"),
        "--algorithms",
        *preset["algorithms"],
    ]

    option_mappings = (
        ("timesteps", "--timesteps"),
        ("eval_episodes", "--eval-episodes"),
        ("eval_seed_count", "--eval-seed-count"),
        ("progress_eval_frequency", "--progress-eval-frequency"),
        ("progress_eval_episodes", "--progress-eval-episodes"),
    )
    for preset_key, flag in option_mappings:
        if preset_key in preset:
            train_argv.extend([flag, str(preset[preset_key])])

    if preset.get("curriculum_enabled"):
        train_argv.append("--curriculum-enabled")
    return train_argv


def write_leaderboard_csv(path: Path, leaderboard: Sequence[dict[str, Any]]) -> None:
    train_module.ensure_parent(path)
    with path.open("w", encoding="utf-8", newline="") as csv_file:
        writer = csv.DictWriter(
            csv_file,
            fieldnames=[
                "rank",
                "algorithm",
                "selected",
                "success_rate",
                "mean_reward",
                "mean_episode_steps",
                "survivability",
                "weapon_efficiency",
                "time_to_ready",
                "tot_quality",
                "model_path",
            ],
        )
        writer.writeheader()
        for row in leaderboard:
            evaluation = row.get("evaluation_summary", {})
            writer.writerow(
                {
                    "rank": row.get("rank"),
                    "algorithm": row.get("algorithm"),
                    "selected": row.get("selected"),
                    "success_rate": evaluation.get("success_rate"),
                    "mean_reward": evaluation.get("mean_reward"),
                    "mean_episode_steps": evaluation.get("mean_episode_steps"),
                    "survivability": evaluation.get("survivability"),
                    "weapon_efficiency": evaluation.get("weapon_efficiency"),
                    "time_to_ready": evaluation.get("time_to_ready"),
                    "tot_quality": evaluation.get("tot_quality"),
                    "model_path": row.get("model_path"),
                }
            )


def build_comparison_report(
    compare_args: argparse.Namespace,
    run_dir: Path,
    train_args: argparse.Namespace,
    train_summary: dict[str, Any],
    leaderboard_csv_path: Path,
) -> dict[str, Any]:
    return {
        "comparison_schema_version": COMPARISON_SUMMARY_SCHEMA_VERSION,
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "preset": compare_args.preset,
        "run_label": run_dir.name,
        "run_dir": str(run_dir),
        "train_summary_path": str(train_args.summary_path),
        "train_progress_path": str(train_args.progress_path),
        "leaderboard_csv_path": str(leaderboard_csv_path),
        "selected_algorithm": train_summary.get("selected_algorithm"),
        "selection_metric": train_summary.get("selection_metric"),
        "training_mode": train_summary.get("training_mode"),
        "observation_version": train_summary.get("observation_version"),
        "reward_version": train_summary.get("reward_version"),
        "train_summary_schema_version": train_summary.get("summary_schema_version"),
        "algorithms": train_summary.get("algorithms", []),
        "timesteps": train_summary.get("timesteps"),
        "timesteps_total": train_summary.get("timesteps_total"),
        "reward_config": train_summary.get("reward_config", {}),
        "evaluation_summary": train_module.build_evaluation_snapshot(
            train_summary.get("evaluation", {})
        ),
        "best_run": {
            "algorithm": train_summary.get("best_run", {}).get("algorithm"),
            "model_path": train_summary.get("best_run", {}).get("model_path"),
            "evaluation_summary": train_module.build_evaluation_snapshot(
                train_summary.get("best_run", {}).get("evaluation", {})
            ),
        }
        if train_summary.get("best_run")
        else None,
        "leaderboard": train_summary.get("leaderboard", []),
        "metric_leaders": train_summary.get("metric_leaders", {}),
        "retained_models": train_summary.get("retained_models"),
    }


def main(argv: Sequence[str] | None = None) -> dict[str, Any]:
    compare_args, forwarded_train_argv = parse_args(argv)
    run_label = build_run_label(compare_args)
    run_dir = compare_args.output_root / run_label
    default_train_argv = build_default_train_argv(compare_args, run_dir)
    train_args = train_module.parse_args(default_train_argv + forwarded_train_argv)

    try:
        train_module.ensure_parent(train_args.summary_path)
        train_module.ensure_parent(train_args.export_path)
        train_module.ensure_parent(train_args.progress_path)
        train_module.ensure_parent(train_args.eval_recording_path)
        train_module.ensure_parent(train_args.model_path)
        train_summary = train_module.train_model(train_args)
    except Exception as exc:
        train_module.mark_failed_progress(train_args, str(exc))
        raise SystemExit(f"FixedTargetStrike comparison failed: {exc}") from exc

    leaderboard_csv_path = run_dir / compare_args.leaderboard_csv_name
    write_leaderboard_csv(
        leaderboard_csv_path,
        train_summary.get("leaderboard", []),
    )
    comparison_report = build_comparison_report(
        compare_args,
        run_dir,
        train_args,
        train_summary,
        leaderboard_csv_path,
    )
    comparison_summary_path = run_dir / compare_args.comparison_summary_name
    train_module.write_json(comparison_summary_path, comparison_report)
    print(
        json.dumps(
            {
                "comparison_summary_path": str(comparison_summary_path),
                "leaderboard_csv_path": str(leaderboard_csv_path),
                "selected_algorithm": comparison_report.get("selected_algorithm"),
                "retained_model_manifest_path": (
                    comparison_report.get("retained_models", {}) or {}
                ).get("manifest_path"),
            },
            indent=2,
        )
    )
    return comparison_report


if __name__ == "__main__":
    main()
