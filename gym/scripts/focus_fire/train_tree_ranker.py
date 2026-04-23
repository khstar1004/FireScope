from __future__ import annotations

import argparse
import json
import math
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    import lightgbm as lgb
except ImportError:
    lgb = None

FEATURE_NAMES = [
    "heuristicScore",
    "effectCoverage",
    "effectBalance",
    "expectedStrikeEffect",
    "weaponEfficiency",
    "shotDensity",
    "launcherDensity",
    "immediateReadyRatio",
    "repositionRatio",
    "blockedRatio",
    "distanceReadiness",
    "etaReadiness",
    "threatSafety",
    "responseTempo",
    "threatAdjustedCoverage",
]


@dataclass
class TrainingSample:
    label: str
    target: float
    sample_weight: float
    features: dict[str, float]


@dataclass
class TrainingQuery:
    record_id: str
    samples: list[TrainingSample]


def clamp(value: float, minimum: float, maximum: float) -> float:
    return min(max(value, minimum), maximum)


def round_to_digits(value: float, digits: int) -> float:
    multiplier = 10**digits
    return round(value * multiplier) / multiplier


def normalize_positive(value: Any, ceiling: float) -> float:
    if not isinstance(value, (int, float)) or not math.isfinite(value) or ceiling <= 0:
        return 0.0
    return clamp(value / ceiling, 0.0, 1.0)


def compute_effect_coverage(
    expected_strike_effect: float, desired_effect: float | None
) -> float:
    if desired_effect and desired_effect > 0:
        return clamp(expected_strike_effect / desired_effect, 0.0, 1.0)
    return 0.5


def compute_effect_balance(
    expected_strike_effect: float, desired_effect: float | None
) -> float:
    if not desired_effect or desired_effect <= 0:
        return 0.5

    coverage_ratio = expected_strike_effect / desired_effect
    if coverage_ratio <= 1:
        return clamp(coverage_ratio, 0.0, 1.0)

    return 1 - clamp((coverage_ratio - 1) / 1.25, 0.0, 1.0) * 0.85


def build_feature_vector(
    option: dict[str, Any], desired_effect: float | None
) -> dict[str, float]:
    launcher_count = max(int(option.get("launcherCount", 0) or 0), 0)
    ready_denominator = max(launcher_count, 1)
    expected_strike_effect = float(option.get("expectedStrikeEffect", 0) or 0)
    shot_count = max(int(option.get("shotCount", 0) or 0), 0)
    immediate_launch_ready_count = max(
        int(option.get("immediateLaunchReadyCount", 0) or 0), 0
    )
    reposition_required_count = max(
        int(option.get("repositionRequiredCount", 0) or 0), 0
    )
    blocked_launcher_count = max(int(option.get("blockedLauncherCount", 0) or 0), 0)
    threat_exposure_score = float(option.get("threatExposureScore", 0) or 0)
    effect_coverage = compute_effect_coverage(expected_strike_effect, desired_effect)
    effect_balance = compute_effect_balance(expected_strike_effect, desired_effect)
    immediate_ready_ratio = clamp(
        immediate_launch_ready_count / ready_denominator, 0.0, 1.0
    )
    reposition_ratio = clamp(
        reposition_required_count / ready_denominator, 0.0, 1.0
    )
    blocked_ratio = clamp(
        blocked_launcher_count / max(launcher_count + blocked_launcher_count, 1),
        0.0,
        1.0,
    )
    distance_readiness = 1 - normalize_positive(option.get("averageDistanceKm", 0), 250)
    eta_readiness = 1 - normalize_positive(
        option.get("averageTimeToFireSeconds", 0), 900
    )
    threat_safety = 1 - normalize_positive(threat_exposure_score, 8)
    weapon_efficiency = normalize_positive(
        expected_strike_effect / max(shot_count, 1), 1.5
    )

    return {
        "heuristicScore": normalize_positive(option.get("suitabilityScore", 0), 120),
        "effectCoverage": effect_coverage,
        "effectBalance": effect_balance,
        "expectedStrikeEffect": normalize_positive(expected_strike_effect, 12),
        "weaponEfficiency": weapon_efficiency,
        "shotDensity": normalize_positive(shot_count, 24),
        "launcherDensity": normalize_positive(launcher_count, 6),
        "immediateReadyRatio": immediate_ready_ratio,
        "repositionRatio": reposition_ratio,
        "blockedRatio": blocked_ratio,
        "distanceReadiness": distance_readiness,
        "etaReadiness": eta_readiness,
        "threatSafety": threat_safety,
        "responseTempo": clamp(
            immediate_ready_ratio * 0.6 + eta_readiness * 0.4 - blocked_ratio * 0.2,
            0.0,
            1.0,
        ),
        "threatAdjustedCoverage": clamp(
            effect_coverage * 0.55 + effect_balance * 0.25 + threat_safety * 0.2,
            0.0,
            1.0,
        ),
    }


def choose_preferred_option_label(record: dict[str, Any]) -> str | None:
    feedback_option_label = record.get("feedbackOptionLabel")
    if isinstance(feedback_option_label, str) and feedback_option_label.strip():
        return feedback_option_label

    recommended_option_label = record.get("recommendedOptionLabel")
    if (
        record.get("rerankerApplied") is False
        and isinstance(recommended_option_label, str)
        and recommended_option_label.strip()
    ):
        return recommended_option_label

    return None


def load_training_queries(
    input_path: Path,
    operator_feedback_weight: float,
    rule_seed_weight: float,
) -> tuple[list[TrainingQuery], dict[str, int]]:
    queries: list[TrainingQuery] = []
    operator_feedback_records = 0
    rule_seed_records = 0
    skipped_records = 0

    with input_path.open("r", encoding="utf-8") as handle:
        for line_number, raw_line in enumerate(handle, start=1):
            line = raw_line.strip()
            if not line:
                continue

            payload = json.loads(line)
            if not isinstance(payload, dict):
                skipped_records += 1
                continue

            options = payload.get("options")
            preferred_option_label = choose_preferred_option_label(payload)
            if (
                not isinstance(options, list)
                or len(options) < 2
                or not preferred_option_label
            ):
                skipped_records += 1
                continue

            desired_effect = payload.get("desiredEffect")
            if not isinstance(desired_effect, (int, float)) or not math.isfinite(
                desired_effect
            ):
                desired_effect = None
            else:
                desired_effect = float(desired_effect)

            sample_weight = (
                operator_feedback_weight
                if payload.get("feedbackOptionLabel")
                else rule_seed_weight
            )
            query_samples: list[TrainingSample] = []
            has_preferred_option = False

            for option in options:
                if not isinstance(option, dict):
                    continue
                label = option.get("label")
                if not isinstance(label, str) or not label.strip():
                    continue

                target = 1.0 if label == preferred_option_label else 0.0
                has_preferred_option = has_preferred_option or target == 1.0
                query_samples.append(
                    TrainingSample(
                        label=label,
                        target=target,
                        sample_weight=sample_weight,
                        features=build_feature_vector(option, desired_effect),
                    )
                )

            if len(query_samples) < 2 or not has_preferred_option:
                skipped_records += 1
                continue

            if payload.get("feedbackOptionLabel"):
                operator_feedback_records += 1
            else:
                rule_seed_records += 1

            queries.append(
                TrainingQuery(
                    record_id=str(payload.get("id") or f"line-{line_number}"),
                    samples=query_samples,
                )
            )

    return queries, {
        "operatorFeedbackRecords": operator_feedback_records,
        "ruleSeedRecords": rule_seed_records,
        "skippedRecords": skipped_records,
    }


def sigmoid(value: float) -> float:
    if value >= 0:
        exponent = math.exp(-value)
        return 1 / (1 + exponent)
    exponent = math.exp(value)
    return exponent / (1 + exponent)


def build_threshold_candidates(values: list[float], max_thresholds: int) -> list[float]:
    unique_values = sorted({round_to_digits(value, 6) for value in values})
    if len(unique_values) <= 1:
        return []

    midpoints = [
        round_to_digits((left + right) / 2, 6)
        for left, right in zip(unique_values, unique_values[1:])
    ]
    if len(midpoints) <= max_thresholds:
        return midpoints

    selected: list[float] = []
    for index in range(max_thresholds):
        midpoint_index = round(index * (len(midpoints) - 1) / (max_thresholds - 1))
        candidate = midpoints[midpoint_index]
        if not selected or selected[-1] != candidate:
            selected.append(candidate)
    return selected


def fit_regression_stump(
    samples: list[TrainingSample], residuals: list[float], max_thresholds: int
) -> dict[str, float | str] | None:
    best_split: dict[str, float | str] | None = None
    best_error = float("inf")

    for feature_name in FEATURE_NAMES:
        feature_values = [sample.features[feature_name] for sample in samples]
        for threshold in build_threshold_candidates(feature_values, max_thresholds):
            left_targets = [
                residual
                for value, residual in zip(feature_values, residuals)
                if value <= threshold
            ]
            right_targets = [
                residual
                for value, residual in zip(feature_values, residuals)
                if value > threshold
            ]
            if not left_targets or not right_targets:
                continue

            left_value = sum(left_targets) / len(left_targets)
            right_value = sum(right_targets) / len(right_targets)
            error = sum((target - left_value) ** 2 for target in left_targets) + sum(
                (target - right_value) ** 2 for target in right_targets
            )

            if error < best_error:
                best_error = error
                best_split = {
                    "feature": feature_name,
                    "threshold": threshold,
                    "leftValue": left_value,
                    "rightValue": right_value,
                }

    return best_split


def train_portable_stump_ranker(
    queries: list[TrainingQuery],
    rounds: int,
    learning_rate: float,
    max_thresholds: int,
) -> tuple[list[dict[str, float | str]], dict[str, float | int]]:
    flat_samples = [sample for query in queries for sample in query.samples]
    if not flat_samples:
        return [], {
            "roundsCompleted": 0,
            "pairComparisons": 0,
            "pairwiseAccuracy": 0.0,
        }

    query_ranges: list[tuple[int, int]] = []
    cursor = 0
    for query in queries:
        start = cursor
        cursor += len(query.samples)
        query_ranges.append((start, cursor))

    scores = [0.0 for _ in flat_samples]
    trees: list[dict[str, float | str]] = []
    pair_comparisons = 0

    for _ in range(rounds):
        lambdas = [0.0 for _ in flat_samples]

        for start, end in query_ranges:
            preferred_indices = [
                index for index in range(start, end) if flat_samples[index].target >= 1.0
            ]
            other_indices = [
                index for index in range(start, end) if flat_samples[index].target < 1.0
            ]

            for preferred_index in preferred_indices:
                for other_index in other_indices:
                    margin = scores[preferred_index] - scores[other_index]
                    pair_weight = (
                        flat_samples[preferred_index].sample_weight
                        + flat_samples[other_index].sample_weight
                    ) / 2
                    update = sigmoid(-margin) * pair_weight
                    lambdas[preferred_index] += update
                    lambdas[other_index] -= update
                    pair_comparisons += 1

        if max(abs(value) for value in lambdas) < 1e-9:
            break

        stump = fit_regression_stump(flat_samples, lambdas, max_thresholds)
        if stump is None:
            break

        left_value = float(stump["leftValue"]) * learning_rate
        right_value = float(stump["rightValue"]) * learning_rate
        threshold = float(stump["threshold"])
        feature_name = str(stump["feature"])
        tree = {
            "feature": feature_name,
            "threshold": round_to_digits(threshold, 6),
            "leftValue": round_to_digits(left_value, 6),
            "rightValue": round_to_digits(right_value, 6),
        }
        trees.append(tree)

        for index, sample in enumerate(flat_samples):
            scores[index] += (
                left_value
                if sample.features[feature_name] <= threshold
                else right_value
            )

    pairwise_accuracy = compute_pairwise_accuracy(scores, query_ranges, flat_samples)

    return trees, {
        "roundsCompleted": len(trees),
        "pairComparisons": pair_comparisons,
        "pairwiseAccuracy": pairwise_accuracy,
    }


def flatten_queries(
    queries: list[TrainingQuery],
) -> tuple[list[list[float]], list[float], list[float], list[int]]:
    feature_matrix: list[list[float]] = []
    labels: list[float] = []
    weights: list[float] = []
    group_sizes: list[int] = []

    for query in queries:
        group_sizes.append(len(query.samples))
        for sample in query.samples:
            feature_matrix.append(
                [sample.features[feature_name] for feature_name in FEATURE_NAMES]
            )
            labels.append(sample.target)
            weights.append(sample.sample_weight)

    return feature_matrix, labels, weights, group_sizes


def convert_lightgbm_tree_node(
    node: dict[str, Any], apply_shrinkage: float = 1.0
) -> dict[str, Any]:
    if "leaf_index" in node:
        return {
            "value": round_to_digits(float(node["leaf_value"]) * apply_shrinkage, 6)
        }

    split_feature = int(node["split_feature"])
    feature_name = FEATURE_NAMES[split_feature]
    threshold = float(node["threshold"])
    return {
        "feature": feature_name,
        "threshold": round_to_digits(threshold, 6),
        "left": convert_lightgbm_tree_node(node["left_child"], apply_shrinkage),
        "right": convert_lightgbm_tree_node(node["right_child"], apply_shrinkage),
    }


def score_portable_tree_node(features: dict[str, float], node: dict[str, Any]) -> float:
    if "value" in node:
        return float(node["value"])

    feature_name = str(node["feature"])
    threshold = float(node["threshold"])
    child = node["left"] if features[feature_name] <= threshold else node["right"]
    return score_portable_tree_node(features, child)


def score_portable_model(features: dict[str, float], trees: list[dict[str, Any]]) -> float:
    score = 0.0
    for tree in trees:
        if "root" in tree:
            score += score_portable_tree_node(features, tree["root"])
        else:
            score += (
                float(tree["leftValue"])
                if features[str(tree["feature"])] <= float(tree["threshold"])
                else float(tree["rightValue"])
            )
    return score


def build_lightgbm_portable_trees(
    booster: "lgb.Booster", feature_matrix: list[list[float]]
) -> list[dict[str, Any]]:
    model_dump = booster.dump_model()
    tree_infos = model_dump.get("tree_info", [])
    feature_rows = [
        {
            feature_name: feature_values[index]
            for index, feature_name in enumerate(FEATURE_NAMES)
        }
        for feature_values in feature_matrix
    ]
    booster_predictions = list(booster.predict(feature_matrix))

    portable_without_shrinkage = [
        {"root": convert_lightgbm_tree_node(tree_info["tree_structure"])}
        for tree_info in tree_infos
    ]
    portable_with_shrinkage = [
        {
            "root": convert_lightgbm_tree_node(
                tree_info["tree_structure"],
                float(tree_info.get("shrinkage", 1.0)),
            )
        }
        for tree_info in tree_infos
    ]

    error_without_shrinkage = sum(
        abs(
            score_portable_model(feature_row, portable_without_shrinkage)
            - prediction
        )
        for feature_row, prediction in zip(feature_rows, booster_predictions)
    )
    error_with_shrinkage = sum(
        abs(score_portable_model(feature_row, portable_with_shrinkage) - prediction)
        for feature_row, prediction in zip(feature_rows, booster_predictions)
    )

    return (
        portable_with_shrinkage
        if error_with_shrinkage < error_without_shrinkage
        else portable_without_shrinkage
    )


def compute_pairwise_accuracy(
    scores: list[float],
    query_ranges: list[tuple[int, int]],
    flat_samples: list[TrainingSample],
) -> float:
    correct_pairs = 0
    evaluated_pairs = 0
    for start, end in query_ranges:
        preferred_indices = [
            index for index in range(start, end) if flat_samples[index].target >= 1.0
        ]
        other_indices = [
            index for index in range(start, end) if flat_samples[index].target < 1.0
        ]
        for preferred_index in preferred_indices:
            for other_index in other_indices:
                evaluated_pairs += 1
                if scores[preferred_index] > scores[other_index]:
                    correct_pairs += 1

    return round_to_digits(
        correct_pairs / evaluated_pairs if evaluated_pairs else 0.0,
        4,
    )


def train_lightgbm_ranker(
    queries: list[TrainingQuery],
    rounds: int,
    learning_rate: float,
    num_leaves: int,
    min_data_in_leaf: int,
) -> tuple[list[dict[str, Any]], dict[str, float | int]]:
    if lgb is None:
        raise RuntimeError("LightGBM is not installed in the current environment.")

    feature_matrix, labels, weights, group_sizes = flatten_queries(queries)
    if not feature_matrix:
        return [], {
            "roundsCompleted": 0,
            "pairComparisons": 0,
            "pairwiseAccuracy": 0.0,
        }

    training_dataset = lgb.Dataset(
        feature_matrix,
        label=labels,
        group=group_sizes,
        weight=weights,
        feature_name=FEATURE_NAMES,
        free_raw_data=False,
    )
    booster = lgb.train(
        {
            "objective": "lambdarank",
            "metric": "ndcg",
            "ndcg_eval_at": [1, 3],
            "learning_rate": learning_rate,
            "num_leaves": num_leaves,
            "min_data_in_leaf": min_data_in_leaf,
            "feature_fraction": 1.0,
            "bagging_fraction": 1.0,
            "bagging_freq": 0,
            "force_col_wise": True,
            "verbosity": -1,
            "seed": 42,
        },
        training_dataset,
        num_boost_round=rounds,
    )
    portable_trees = build_lightgbm_portable_trees(booster, feature_matrix)
    predictions = list(booster.predict(feature_matrix))

    query_ranges: list[tuple[int, int]] = []
    cursor = 0
    flat_samples = [sample for query in queries for sample in query.samples]
    for query in queries:
        start = cursor
        cursor += len(query.samples)
        query_ranges.append((start, cursor))

    pair_comparisons = sum(
        sum(1 for sample in query.samples if sample.target >= 1.0)
        * sum(1 for sample in query.samples if sample.target < 1.0)
        for query in queries
    )

    return portable_trees, {
        "roundsCompleted": booster.current_iteration(),
        "pairComparisons": pair_comparisons,
        "pairwiseAccuracy": compute_pairwise_accuracy(
            predictions, query_ranges, flat_samples
        ),
    }


def build_model_payload(
    trees: list[dict[str, Any]],
    sample_count: int,
    operator_feedback_count: int,
    rule_seed_count: int,
    learning_rate: float,
    version: int,
    trainer: str,
) -> dict[str, Any]:
    zero_weights = {feature_name: 0 for feature_name in FEATURE_NAMES}
    model = {
        "version": version,
        "trainedAt": datetime.now(timezone.utc).isoformat(),
        "source": "telemetry-tree-ensemble",
        "modelFamily": "tree-ensemble",
        "sampleCount": sample_count,
        "operatorFeedbackCount": operator_feedback_count,
        "ruleSeedCount": rule_seed_count,
        "epochCount": len(trees),
        "learningRate": learning_rate,
        "intercept": 0,
        "weights": zero_weights,
        "treeEnsemble": {
            "trainer": trainer,
            "trees": trees,
        },
    }
    return {
        "focusFireRerankerEnabled": True,
        "focusFireRerankerModel": model,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Train a portable focus-fire tree ranker from exported telemetry JSONL."
    )
    parser.add_argument(
        "--input",
        required=True,
        type=Path,
        help="Path to the telemetry JSONL exported from VISTA.",
    )
    parser.add_argument(
        "--output",
        required=True,
        type=Path,
        help="Path to write the portable reranker model JSON.",
    )
    parser.add_argument(
        "--trainer",
        choices=["auto", "lightgbm", "fallback"],
        default="auto",
        help="Training backend. 'auto' prefers LightGBM LambdaMART when available.",
    )
    parser.add_argument(
        "--rounds",
        type=int,
        default=32,
        help="Number of boosting rounds for the tree ensemble.",
    )
    parser.add_argument(
        "--learning-rate",
        type=float,
        default=0.12,
        help="Shrinkage applied during training.",
    )
    parser.add_argument(
        "--num-leaves",
        type=int,
        default=15,
        help="LightGBM num_leaves value.",
    )
    parser.add_argument(
        "--min-data-in-leaf",
        type=int,
        default=1,
        help="LightGBM min_data_in_leaf value.",
    )
    parser.add_argument(
        "--max-thresholds",
        type=int,
        default=10,
        help="Fallback trainer only: maximum thresholds to test per feature.",
    )
    parser.add_argument(
        "--version",
        type=int,
        default=10,
        help="Version number stored in the exported model metadata.",
    )
    parser.add_argument(
        "--operator-feedback-weight",
        type=float,
        default=1.35,
        help="Additional weight applied to operator-confirmed records.",
    )
    parser.add_argument(
        "--rule-seed-weight",
        type=float,
        default=1.0,
        help="Weight applied to rule-seeded recommendations.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    queries, stats = load_training_queries(
        args.input,
        operator_feedback_weight=args.operator_feedback_weight,
        rule_seed_weight=args.rule_seed_weight,
    )

    if args.trainer == "lightgbm" and lgb is None:
        raise SystemExit(
            "LightGBM이 설치되어 있지 않습니다. `pip install lightgbm` 또는 auto/fallback 모드를 사용하세요."
        )

    if args.trainer != "fallback" and lgb is not None:
        trees, training_summary = train_lightgbm_ranker(
            queries,
            rounds=args.rounds,
            learning_rate=args.learning_rate,
            num_leaves=args.num_leaves,
            min_data_in_leaf=args.min_data_in_leaf,
        )
        trainer_name = "LightGBM LambdaMART"
    else:
        trees, training_summary = train_portable_stump_ranker(
            queries,
            rounds=args.rounds,
            learning_rate=args.learning_rate,
            max_thresholds=args.max_thresholds,
        )
        trainer_name = "Portable TreeRank (fallback)"

    payload = build_model_payload(
        trees,
        sample_count=len(queries),
        operator_feedback_count=stats["operatorFeedbackRecords"],
        rule_seed_count=stats["ruleSeedRecords"],
        learning_rate=args.learning_rate,
        version=args.version,
        trainer=trainer_name,
    )
    payload["trainingSummary"] = {
        **stats,
        **training_summary,
        "trainer": trainer_name,
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(
        json.dumps(
            {
                "output": str(args.output),
                "queries": len(queries),
                "trees": len(trees),
                **payload["trainingSummary"],
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
