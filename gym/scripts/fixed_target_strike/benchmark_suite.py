from __future__ import annotations

import argparse
import copy
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

BENCHMARK_SUITE_SCHEMA_VERSION = 1
DEFAULT_OUTPUT_ROOT = SCRIPT_DIR / "benchmarks"
BENCHMARK_PRESETS: dict[str, dict[str, Any]] = {
    "smoke": {
        "eval_episodes": 1,
        "eval_seed_count": 1,
        "include_curriculum_stages": False,
        "max_episode_steps_cap": 80,
    },
    "quick": {
        "eval_episodes": 1,
        "eval_seed_count": 3,
        "include_curriculum_stages": False,
    },
    "standard": {
        "eval_episodes": 1,
        "eval_seed_count": 3,
        "include_curriculum_stages": True,
    },
    "extended": {
        "eval_episodes": 2,
        "eval_seed_count": 5,
        "include_curriculum_stages": True,
    },
}


def slugify(value: str) -> str:
    normalized = re.sub(r"[^a-zA-Z0-9_-]+", "-", value.strip()).strip("-_")
    return normalized.lower() or "benchmark"


def parse_args(
    argv: Sequence[str] | None = None,
) -> tuple[argparse.Namespace, list[str]]:
    parser = argparse.ArgumentParser(
        description="Run regression-oriented benchmark suites for FixedTargetStrike-v0"
    )
    parser.add_argument(
        "--preset",
        choices=sorted(BENCHMARK_PRESETS),
        default="standard",
        help="Benchmark preset that controls seed count and whether curriculum stages are included.",
    )
    parser.add_argument("--run-label", type=str, default=None)
    parser.add_argument("--output-root", type=Path, default=DEFAULT_OUTPUT_ROOT)
    parser.add_argument(
        "--suite-summary-name",
        type=str,
        default="benchmark_suite.json",
    )
    parser.add_argument(
        "--model-path",
        action="append",
        default=[],
        help="Raw model path to benchmark. May be passed with or without the .zip suffix.",
    )
    parser.add_argument(
        "--source-path",
        action="append",
        default=[],
        help="Path to a train summary, comparison summary, or retained model manifest.",
    )
    parser.add_argument(
        "--algorithm",
        type=str,
        default=None,
        help="Fallback algorithm for raw model paths when metadata is missing.",
    )
    parser.add_argument("--suite-eval-episodes", type=int, default=None)
    parser.add_argument("--suite-eval-seed-count", type=int, default=None)
    parser.add_argument("--suite-max-episode-steps", type=int, default=None)
    parser.add_argument("--include-curriculum-stages", action="store_true")
    parser.add_argument("--skip-full-scenario", action="store_true")
    parser.add_argument(
        "--baseline-benchmark-path",
        type=Path,
        default=None,
        help="Previous benchmark_suite.json to compare against for regression checks.",
    )
    parser.add_argument("--min-success-rate", type=float, default=None)
    parser.add_argument("--min-survivability", type=float, default=None)
    parser.add_argument("--min-weapon-efficiency", type=float, default=None)
    parser.add_argument("--min-tot-quality", type=float, default=None)
    parser.add_argument("--min-mean-reward", type=float, default=None)
    parser.add_argument("--max-time-to-ready", type=float, default=None)
    parser.add_argument("--fail-on-seed-variability-warning", action="store_true")
    parser.add_argument("--max-success-rate-drop", type=float, default=None)
    parser.add_argument("--max-mean-reward-drop", type=float, default=None)
    parser.add_argument("--max-survivability-drop", type=float, default=None)
    parser.add_argument("--max-weapon-efficiency-drop", type=float, default=None)
    parser.add_argument("--max-tot-quality-drop", type=float, default=None)
    parser.add_argument("--max-time-to-ready-increase", type=float, default=None)
    parser.add_argument("--fail-on-regression", action="store_true")
    return parser.parse_known_args(argv)


def build_run_label(suite_args: argparse.Namespace) -> str:
    if suite_args.run_label:
        return slugify(suite_args.run_label)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    return f"{suite_args.preset}-{timestamp}"


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as input_file:
        return json.load(input_file)


def normalize_model_path(model_path: str | Path) -> Path:
    normalized = Path(model_path)
    if normalized.suffix.lower() == ".zip":
        return normalized.with_suffix("")
    return normalized


def resolve_path_from_source(path_value: str | Path, source_path: Path) -> Path:
    candidate_path = Path(path_value)
    if candidate_path.is_absolute():
        return candidate_path
    if candidate_path.exists():
        return candidate_path
    return source_path.parent / candidate_path


def infer_algorithm_from_path(model_path: Path) -> str | None:
    model_name = model_path.name.lower()
    for algorithm in train_module.SUPPORTED_ALGORITHMS:
        if re.search(rf"(^|[_-]){re.escape(algorithm)}($|[_-])", model_name):
            return algorithm
    return None


def resolve_candidate_algorithm(
    model_path: Path, explicit_algorithm: str | None = None
) -> tuple[str, dict[str, Any] | None]:
    metadata = train_module.read_model_metadata(model_path)
    if metadata is not None:
        metadata_algorithm = str(metadata.get("algorithm", "")).strip().lower()
        if metadata_algorithm:
            return metadata_algorithm, metadata

    if explicit_algorithm:
        return explicit_algorithm.strip().lower(), metadata

    inferred_algorithm = infer_algorithm_from_path(model_path)
    if inferred_algorithm is not None:
        return inferred_algorithm, metadata

    raise RuntimeError(
        f"Unable to infer algorithm for model {train_module.model_zip_path(model_path)}. "
        "Pass --algorithm or use a model with metadata."
    )


def build_candidate_entry(
    *,
    algorithm: str,
    model_path: Path,
    source_kind: str,
    source_path: Path | None,
    label: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    return {
        "candidate_id": f"{algorithm}:{train_module.model_zip_path(model_path)}",
        "label": label or f"{algorithm}:{model_path.name}",
        "algorithm": algorithm,
        "model_path": str(train_module.model_zip_path(model_path)),
        "model_metadata_path": (
            str(train_module.model_metadata_path(model_path))
            if train_module.model_metadata_path(model_path).exists()
            else None
        ),
        "source_kind": source_kind,
        "source_path": str(source_path) if source_path is not None else None,
        "training_mode": metadata.get("training_mode") if isinstance(metadata, dict) else None,
        "observation_version": (
            int(metadata.get("observation_version"))
            if isinstance(metadata, dict) and metadata.get("observation_version") is not None
            else None
        ),
        "reward_version": (
            int(metadata.get("reward_version"))
            if isinstance(metadata, dict) and metadata.get("reward_version") is not None
            else None
        ),
    }


def collect_candidates_from_model_paths(
    model_paths: Sequence[str], fallback_algorithm: str | None
) -> list[dict[str, Any]]:
    candidates: list[dict[str, Any]] = []
    for raw_model_path in model_paths:
        model_path = normalize_model_path(raw_model_path)
        algorithm, metadata = resolve_candidate_algorithm(model_path, fallback_algorithm)
        candidates.append(
            build_candidate_entry(
                algorithm=algorithm,
                model_path=model_path,
                source_kind="model_path",
                source_path=Path(raw_model_path),
                metadata=metadata,
            )
        )
    return candidates


def collect_candidates_from_train_summary(
    summary: dict[str, Any], source_path: Path
) -> list[dict[str, Any]]:
    candidates: list[dict[str, Any]] = []
    for run in summary.get("runs", []):
        model_path = normalize_model_path(
            resolve_path_from_source(run["model_path"], source_path)
        )
        metadata = train_module.read_model_metadata(model_path)
        candidates.append(
            build_candidate_entry(
                algorithm=str(run["algorithm"]).strip().lower(),
                model_path=model_path,
                source_kind="train_summary",
                source_path=source_path,
                label=f"{run['algorithm']}:selected",
                metadata=metadata,
            )
        )

    if not candidates and summary.get("model_path") and summary.get("selected_algorithm"):
        model_path = normalize_model_path(
            resolve_path_from_source(summary["model_path"], source_path)
        )
        metadata = train_module.read_model_metadata(model_path)
        candidates.append(
            build_candidate_entry(
                algorithm=str(summary["selected_algorithm"]).strip().lower(),
                model_path=model_path,
                source_kind="train_summary",
                source_path=source_path,
                label=f"{summary['selected_algorithm']}:top-level",
                metadata=metadata,
            )
        )
    return candidates


def collect_candidates_from_comparison_summary(
    summary: dict[str, Any], source_path: Path
) -> list[dict[str, Any]]:
    candidates: list[dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()
    for entry in summary.get("leaderboard", []):
        algorithm = str(entry.get("algorithm", "")).strip().lower()
        model_path_raw = entry.get("model_path")
        if not algorithm or not model_path_raw:
            continue
        model_path = normalize_model_path(
            resolve_path_from_source(model_path_raw, source_path)
        )
        dedupe_key = (algorithm, str(train_module.model_zip_path(model_path)))
        if dedupe_key in seen:
            continue
        seen.add(dedupe_key)
        metadata = train_module.read_model_metadata(model_path)
        candidates.append(
            build_candidate_entry(
                algorithm=algorithm,
                model_path=model_path,
                source_kind="comparison_summary",
                source_path=source_path,
                label=f"{algorithm}:leaderboard",
                metadata=metadata,
            )
        )
    return candidates


def collect_candidates_from_retained_manifest(
    manifest: dict[str, Any], source_path: Path
) -> list[dict[str, Any]]:
    candidates: list[dict[str, Any]] = []
    for model_entry in manifest.get("models", []):
        algorithm = str(model_entry.get("algorithm", "")).strip().lower()
        model_path_raw = model_entry.get("model_path")
        if not algorithm or not model_path_raw:
            continue
        model_path = normalize_model_path(
            resolve_path_from_source(model_path_raw, source_path)
        )
        metadata = train_module.read_model_metadata(model_path)
        candidates.append(
            build_candidate_entry(
                algorithm=algorithm,
                model_path=model_path,
                source_kind="retained_manifest",
                source_path=source_path,
                label=f"{algorithm}:retained",
                metadata=metadata,
            )
        )
    return candidates


def collect_candidates_from_source_path(source_path: Path) -> list[dict[str, Any]]:
    payload = load_json(source_path)
    if payload.get("archive_schema_version") and isinstance(payload.get("models"), list):
        return collect_candidates_from_retained_manifest(payload, source_path)
    if payload.get("comparison_schema_version"):
        return collect_candidates_from_comparison_summary(payload, source_path)
    if payload.get("summary_schema_version"):
        return collect_candidates_from_train_summary(payload, source_path)
    raise RuntimeError(
        f"Unsupported benchmark source payload: {source_path}. "
        "Expected a train summary, comparison summary, or retained manifest."
    )


def dedupe_candidates(candidates: Sequence[dict[str, Any]]) -> list[dict[str, Any]]:
    deduped: list[dict[str, Any]] = []
    seen: set[str] = set()
    for candidate in candidates:
        candidate_id = str(candidate.get("candidate_id", "")).strip()
        if not candidate_id or candidate_id in seen:
            continue
        seen.add(candidate_id)
        deduped.append(candidate)
    return deduped


def build_suite_cases(
    suite_args: argparse.Namespace, base_train_args: argparse.Namespace
) -> list[dict[str, Any]]:
    preset = BENCHMARK_PRESETS[suite_args.preset]
    eval_episodes = max(
        int(
            suite_args.suite_eval_episodes
            or preset.get("eval_episodes")
            or base_train_args.eval_episodes
            or 1
        ),
        1,
    )
    eval_seed_count = max(
        int(
            suite_args.suite_eval_seed_count
            or preset.get("eval_seed_count")
            or base_train_args.eval_seed_count
            or 1
        ),
        1,
    )
    include_curriculum_stages = bool(
        suite_args.include_curriculum_stages
        or preset.get("include_curriculum_stages", False)
    )
    full_max_episode_steps = max(
        int(
            suite_args.suite_max_episode_steps
            or min(
                int(base_train_args.max_episode_steps),
                int(
                    preset.get(
                        "max_episode_steps_cap", base_train_args.max_episode_steps
                    )
                ),
            )
        ),
        1,
    )

    cases: list[dict[str, Any]] = []
    case_seed_offset = 0
    if not suite_args.skip_full_scenario:
        cases.append(
            {
                "key": "full",
                "label": "Full Scenario",
                "eval_episodes": eval_episodes,
                "eval_seed_count": eval_seed_count,
                "max_episode_steps": full_max_episode_steps,
                "curriculum_stage": None,
                "base_seed": int(base_train_args.seed) + (case_seed_offset * 10000),
            }
        )
        case_seed_offset += 1

    if include_curriculum_stages:
        for stage in train_module.build_curriculum_stages(base_train_args):
            cases.append(
                {
                    "key": stage["key"],
                    "label": f"Curriculum {stage['key']}",
                    "eval_episodes": eval_episodes,
                    "eval_seed_count": eval_seed_count,
                    "max_episode_steps": int(stage["max_episode_steps"]),
                    "curriculum_stage": stage,
                    "base_seed": int(base_train_args.seed) + (case_seed_offset * 10000),
                }
            )
            case_seed_offset += 1

    if not cases:
        raise RuntimeError("Benchmark suite must contain at least one case.")
    return cases


def load_baseline_index(
    baseline_path: Path | None,
) -> dict[tuple[str, str], dict[str, Any]]:
    if baseline_path is None:
        return {}
    payload = load_json(baseline_path)
    if int(payload.get("benchmark_suite_schema_version", -1)) != BENCHMARK_SUITE_SCHEMA_VERSION:
        raise RuntimeError(
            f"Unsupported baseline benchmark schema at {baseline_path}: "
            f"{payload.get('benchmark_suite_schema_version')}"
        )

    index: dict[tuple[str, str], dict[str, Any]] = {}
    for candidate in payload.get("candidates", []):
        algorithm = str(candidate.get("algorithm", "")).strip().lower()
        if not algorithm:
            continue
        for case_result in candidate.get("cases", []):
            case_key = str(case_result.get("case_key", "")).strip()
            if not case_key:
                continue
            index[(algorithm, case_key)] = case_result
    return index


def build_threshold_result(
    suite_args: argparse.Namespace,
    evaluation: dict[str, Any],
    evaluation_summary: dict[str, Any],
) -> dict[str, Any]:
    failures: list[str] = []
    threshold_values = {
        "min_success_rate": suite_args.min_success_rate,
        "min_survivability": suite_args.min_survivability,
        "min_weapon_efficiency": suite_args.min_weapon_efficiency,
        "min_tot_quality": suite_args.min_tot_quality,
        "min_mean_reward": suite_args.min_mean_reward,
        "max_time_to_ready": suite_args.max_time_to_ready,
        "fail_on_seed_variability_warning": suite_args.fail_on_seed_variability_warning,
    }

    if (
        suite_args.min_success_rate is not None
        and evaluation_summary["success_rate"] < suite_args.min_success_rate
    ):
        failures.append(
            f"success_rate<{suite_args.min_success_rate:.3f} "
            f"({evaluation_summary['success_rate']:.3f})"
        )
    if (
        suite_args.min_survivability is not None
        and evaluation_summary["survivability"] < suite_args.min_survivability
    ):
        failures.append(
            f"survivability<{suite_args.min_survivability:.3f} "
            f"({evaluation_summary['survivability']:.3f})"
        )
    if (
        suite_args.min_weapon_efficiency is not None
        and evaluation_summary["weapon_efficiency"] < suite_args.min_weapon_efficiency
    ):
        failures.append(
            f"weapon_efficiency<{suite_args.min_weapon_efficiency:.3f} "
            f"({evaluation_summary['weapon_efficiency']:.3f})"
        )
    if (
        suite_args.min_tot_quality is not None
        and evaluation_summary["tot_quality"] < suite_args.min_tot_quality
    ):
        failures.append(
            f"tot_quality<{suite_args.min_tot_quality:.3f} "
            f"({evaluation_summary['tot_quality']:.3f})"
        )
    if (
        suite_args.min_mean_reward is not None
        and evaluation_summary["mean_reward"] < suite_args.min_mean_reward
    ):
        failures.append(
            f"mean_reward<{suite_args.min_mean_reward:.3f} "
            f"({evaluation_summary['mean_reward']:.3f})"
        )
    if (
        suite_args.max_time_to_ready is not None
        and evaluation_summary["time_to_ready"] > suite_args.max_time_to_ready
    ):
        failures.append(
            f"time_to_ready>{suite_args.max_time_to_ready:.3f} "
            f"({evaluation_summary['time_to_ready']:.3f})"
        )
    if (
        suite_args.fail_on_seed_variability_warning
        and bool(evaluation.get("seed_variability_warning", False))
    ):
        failures.append("seed_variability_warning")

    return {
        "checked": threshold_values,
        "passed": len(failures) == 0,
        "failures": failures,
    }


def build_regression_result(
    suite_args: argparse.Namespace,
    baseline_case: dict[str, Any] | None,
    evaluation_summary: dict[str, Any],
) -> dict[str, Any]:
    if baseline_case is None:
        return {
            "baseline_found": False,
            "passed": True,
            "failures": [],
            "deltas": {},
        }

    baseline_summary = baseline_case.get("evaluation_summary", {})
    deltas = {
        "success_rate": float(evaluation_summary.get("success_rate", 0.0))
        - float(baseline_summary.get("success_rate", 0.0)),
        "mean_reward": float(evaluation_summary.get("mean_reward", 0.0))
        - float(baseline_summary.get("mean_reward", 0.0)),
        "survivability": float(evaluation_summary.get("survivability", 0.0))
        - float(baseline_summary.get("survivability", 0.0)),
        "weapon_efficiency": float(evaluation_summary.get("weapon_efficiency", 0.0))
        - float(baseline_summary.get("weapon_efficiency", 0.0)),
        "tot_quality": float(evaluation_summary.get("tot_quality", 0.0))
        - float(baseline_summary.get("tot_quality", 0.0)),
        "time_to_ready": float(evaluation_summary.get("time_to_ready", 0.0))
        - float(baseline_summary.get("time_to_ready", 0.0)),
    }

    failures: list[str] = []
    if (
        suite_args.max_success_rate_drop is not None
        and deltas["success_rate"] < -suite_args.max_success_rate_drop
    ):
        failures.append(
            f"success_rate_drop>{suite_args.max_success_rate_drop:.3f} "
            f"({-deltas['success_rate']:.3f})"
        )
    if (
        suite_args.max_mean_reward_drop is not None
        and deltas["mean_reward"] < -suite_args.max_mean_reward_drop
    ):
        failures.append(
            f"mean_reward_drop>{suite_args.max_mean_reward_drop:.3f} "
            f"({-deltas['mean_reward']:.3f})"
        )
    if (
        suite_args.max_survivability_drop is not None
        and deltas["survivability"] < -suite_args.max_survivability_drop
    ):
        failures.append(
            f"survivability_drop>{suite_args.max_survivability_drop:.3f} "
            f"({-deltas['survivability']:.3f})"
        )
    if (
        suite_args.max_weapon_efficiency_drop is not None
        and deltas["weapon_efficiency"] < -suite_args.max_weapon_efficiency_drop
    ):
        failures.append(
            f"weapon_efficiency_drop>{suite_args.max_weapon_efficiency_drop:.3f} "
            f"({-deltas['weapon_efficiency']:.3f})"
        )
    if (
        suite_args.max_tot_quality_drop is not None
        and deltas["tot_quality"] < -suite_args.max_tot_quality_drop
    ):
        failures.append(
            f"tot_quality_drop>{suite_args.max_tot_quality_drop:.3f} "
            f"({-deltas['tot_quality']:.3f})"
        )
    if (
        suite_args.max_time_to_ready_increase is not None
        and deltas["time_to_ready"] > suite_args.max_time_to_ready_increase
    ):
        failures.append(
            f"time_to_ready_increase>{suite_args.max_time_to_ready_increase:.3f} "
            f"({deltas['time_to_ready']:.3f})"
        )

    return {
        "baseline_found": True,
        "baseline_candidate_id": baseline_case.get("candidate_id"),
        "passed": len(failures) == 0,
        "failures": failures,
        "deltas": deltas,
        "baseline_evaluation_summary": baseline_summary,
    }


def summarize_candidate_cases(case_results: Sequence[dict[str, Any]]) -> dict[str, Any]:
    total_cases = len(case_results)
    passed_cases = sum(1 for case_result in case_results if case_result.get("passed"))
    if total_cases <= 0:
        return {
            "total_cases": 0,
            "passed_cases": 0,
            "failed_cases": 0,
            "overall_pass": True,
        }

    def average_metric(metric_key: str) -> float:
        return float(
            sum(
                float(
                    case_result.get("evaluation_summary", {}).get(metric_key, 0.0)
                )
                for case_result in case_results
            )
            / total_cases
        )

    return {
        "total_cases": total_cases,
        "passed_cases": passed_cases,
        "failed_cases": total_cases - passed_cases,
        "overall_pass": passed_cases == total_cases,
        "average_success_rate": average_metric("success_rate"),
        "average_mean_reward": average_metric("mean_reward"),
        "average_survivability": average_metric("survivability"),
        "average_weapon_efficiency": average_metric("weapon_efficiency"),
        "average_time_to_ready": average_metric("time_to_ready"),
        "average_tot_quality": average_metric("tot_quality"),
    }


def build_suite_leaderboard(candidate_results: Sequence[dict[str, Any]]) -> list[dict[str, Any]]:
    ordered_results = sorted(
        candidate_results,
        key=lambda result: (
            float(
                next(
                    (
                        case_result.get("evaluation_summary", {}).get("success_rate", 0.0)
                        for case_result in result.get("cases", [])
                        if case_result.get("case_key") == "full"
                    ),
                    result.get("aggregate", {}).get("average_success_rate", 0.0),
                )
            ),
            float(
                next(
                    (
                        case_result.get("evaluation_summary", {}).get("mean_reward", 0.0)
                        for case_result in result.get("cases", [])
                        if case_result.get("case_key") == "full"
                    ),
                    result.get("aggregate", {}).get("average_mean_reward", 0.0),
                )
            ),
        ),
        reverse=True,
    )
    leaderboard: list[dict[str, Any]] = []
    for rank, candidate_result in enumerate(ordered_results, start=1):
        leaderboard.append(
            {
                "rank": rank,
                "candidate_id": candidate_result["candidate_id"],
                "algorithm": candidate_result["algorithm"],
                "label": candidate_result["label"],
                "overall_pass": candidate_result["aggregate"]["overall_pass"],
                "passed_cases": candidate_result["aggregate"]["passed_cases"],
                "total_cases": candidate_result["aggregate"]["total_cases"],
                "average_success_rate": candidate_result["aggregate"].get(
                    "average_success_rate"
                ),
                "average_mean_reward": candidate_result["aggregate"].get(
                    "average_mean_reward"
                ),
                "model_path": candidate_result["model_path"],
            }
        )
    return leaderboard


def main(argv: Sequence[str] | None = None) -> dict[str, Any]:
    suite_args, forwarded_train_argv = parse_args(argv)
    base_train_args = train_module.parse_args(forwarded_train_argv)
    run_label = build_run_label(suite_args)
    run_dir = suite_args.output_root / run_label
    train_module.ensure_parent(run_dir / suite_args.suite_summary_name)

    candidates = collect_candidates_from_model_paths(
        suite_args.model_path, suite_args.algorithm
    )
    for raw_source_path in suite_args.source_path:
        candidates.extend(collect_candidates_from_source_path(Path(raw_source_path)))
    candidates = dedupe_candidates(candidates)
    if not candidates:
        raise SystemExit(
            "Benchmark suite requires at least one candidate. "
            "Pass --model-path or --source-path."
        )

    suite_cases = build_suite_cases(suite_args, base_train_args)
    baseline_index = load_baseline_index(suite_args.baseline_benchmark_path)
    candidate_results: list[dict[str, Any]] = []

    for candidate in candidates:
        model_path = normalize_model_path(candidate["model_path"])
        model = train_module.load_model(candidate["algorithm"], model_path)
        case_results: list[dict[str, Any]] = []
        candidate_dir = run_dir / slugify(candidate["label"])
        for case in suite_cases:
            case_train_args = copy.deepcopy(base_train_args)
            case_train_args.max_episode_steps = int(case["max_episode_steps"])
            evaluation = train_module.run_benchmark_evaluation(
                model,
                case_train_args,
                episodes_per_seed=int(case["eval_episodes"]),
                base_seed=int(case["base_seed"]),
                seed_count=int(case["eval_seed_count"]),
                curriculum_stage=case["curriculum_stage"],
            )
            evaluation_summary = train_module.build_evaluation_snapshot(evaluation)
            threshold_result = build_threshold_result(
                suite_args,
                evaluation,
                evaluation_summary,
            )
            baseline_case = baseline_index.get((candidate["algorithm"], case["key"]))
            regression_result = build_regression_result(
                suite_args,
                baseline_case,
                evaluation_summary,
            )
            case_pass = bool(
                threshold_result.get("passed", True)
                and regression_result.get("passed", True)
            )
            evaluation_path = candidate_dir / f"{case['key']}_evaluation.json"
            train_module.write_json(evaluation_path, evaluation)
            case_results.append(
                {
                    "case_key": case["key"],
                    "label": case["label"],
                    "candidate_id": candidate["candidate_id"],
                    "eval_episodes": int(case["eval_episodes"]),
                    "eval_seed_count": int(case["eval_seed_count"]),
                    "base_seed": int(case["base_seed"]),
                    "max_episode_steps": int(case["max_episode_steps"]),
                    "curriculum_stage": (
                        case["curriculum_stage"]["key"]
                        if case["curriculum_stage"] is not None
                        else None
                    ),
                    "passed": case_pass,
                    "thresholds": threshold_result,
                    "regression": regression_result,
                    "evaluation_summary": evaluation_summary,
                    "evaluation_path": str(evaluation_path),
                }
            )

        candidate_results.append(
            {
                **candidate,
                "cases": case_results,
                "aggregate": summarize_candidate_cases(case_results),
            }
        )

    leaderboard = build_suite_leaderboard(candidate_results)
    suite_report = {
        "benchmark_suite_schema_version": BENCHMARK_SUITE_SCHEMA_VERSION,
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "preset": suite_args.preset,
        "run_label": run_label,
        "run_dir": str(run_dir),
        "source_paths": [str(Path(source_path)) for source_path in suite_args.source_path],
        "raw_model_paths": [str(Path(model_path)) for model_path in suite_args.model_path],
        "baseline_benchmark_path": (
            str(suite_args.baseline_benchmark_path)
            if suite_args.baseline_benchmark_path is not None
            else None
        ),
        "scenario_path": str(base_train_args.scenario_path),
        "observation_version": train_module.OBSERVATION_VERSION,
        "reward_version": train_module.REWARD_VERSION,
        "suite_cases": [
            {
                "key": case["key"],
                "label": case["label"],
                "eval_episodes": int(case["eval_episodes"]),
                "eval_seed_count": int(case["eval_seed_count"]),
                "base_seed": int(case["base_seed"]),
                "max_episode_steps": int(case["max_episode_steps"]),
                "curriculum_stage": (
                    case["curriculum_stage"]["key"]
                    if case["curriculum_stage"] is not None
                    else None
                ),
            }
            for case in suite_cases
        ],
        "thresholds": {
            "min_success_rate": suite_args.min_success_rate,
            "min_survivability": suite_args.min_survivability,
            "min_weapon_efficiency": suite_args.min_weapon_efficiency,
            "min_tot_quality": suite_args.min_tot_quality,
            "min_mean_reward": suite_args.min_mean_reward,
            "max_time_to_ready": suite_args.max_time_to_ready,
            "fail_on_seed_variability_warning": suite_args.fail_on_seed_variability_warning,
        },
        "regression_policy": {
            "max_success_rate_drop": suite_args.max_success_rate_drop,
            "max_mean_reward_drop": suite_args.max_mean_reward_drop,
            "max_survivability_drop": suite_args.max_survivability_drop,
            "max_weapon_efficiency_drop": suite_args.max_weapon_efficiency_drop,
            "max_tot_quality_drop": suite_args.max_tot_quality_drop,
            "max_time_to_ready_increase": suite_args.max_time_to_ready_increase,
            "fail_on_regression": suite_args.fail_on_regression,
        },
        "leaderboard": leaderboard,
        "candidates": candidate_results,
    }
    summary_path = run_dir / suite_args.suite_summary_name
    train_module.write_json(summary_path, suite_report)

    if suite_args.fail_on_regression and any(
        not candidate_result.get("aggregate", {}).get("overall_pass", True)
        for candidate_result in candidate_results
    ):
        raise SystemExit(
            "FixedTargetStrike benchmark suite failed one or more regression checks. "
            f"See {summary_path}."
        )

    print(
        json.dumps(
            {
                "benchmark_suite_path": str(summary_path),
                "candidate_count": len(candidate_results),
                "leaderboard": leaderboard,
            },
            indent=2,
        )
    )
    return suite_report


if __name__ == "__main__":
    main()
