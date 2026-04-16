from __future__ import annotations

import argparse
import copy
import importlib
import itertools
import json
import math
import re
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Sequence

ROOT_DIR = Path(__file__).resolve().parents[2]
SCRIPT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

COMMANDER_SUMMARY_SCHEMA_VERSION = 1
COMMANDER_SELECTION_METRIC = (
    "success_rate_then_survivability_then_faster_time_to_ready_"
    "then_weapon_efficiency_then_mean_reward_then_shorter_mean_episode_steps"
)
DEFAULT_OUTPUT_ROOT = SCRIPT_DIR / "commander_runs"
COMMANDER_PRESETS: dict[str, dict[str, Any]] = {
    "smoke": {
        "timesteps": 128,
        "eval_episodes": 1,
        "eval_seed_count": 1,
        "progress_eval_frequency": 64,
        "progress_eval_episodes": 1,
        "distance_scales": [0.7, 1.0],
        "bearing_offsets_deg": [-30.0, 0.0, 30.0],
        "formation_spreads_nm": [0.0],
        "candidate_limit": 6,
        "max_resource_combinations": 3,
    },
    "quick": {
        "timesteps": 512,
        "eval_episodes": 1,
        "eval_seed_count": 2,
        "progress_eval_frequency": 128,
        "progress_eval_episodes": 1,
        "distance_scales": [0.6, 0.85, 1.0],
        "bearing_offsets_deg": [-45.0, 0.0, 45.0],
        "formation_spreads_nm": [0.0, 8.0],
        "candidate_limit": 12,
        "max_resource_combinations": 4,
    },
    "standard": {
        "timesteps": 2048,
        "eval_episodes": 1,
        "eval_seed_count": 3,
        "progress_eval_frequency": 256,
        "progress_eval_episodes": 1,
        "distance_scales": [0.55, 0.75, 1.0],
        "bearing_offsets_deg": [-60.0, -20.0, 0.0, 20.0, 60.0],
        "formation_spreads_nm": [0.0, 6.0, 12.0],
        "candidate_limit": 18,
        "max_resource_combinations": 6,
    },
}
FEATURE_CATALOG = [
    {
        "key": "tactical_execution_policy_learning",
        "name": "전술 실행 정책 학습",
        "description": "주어진 자산과 초기 배치에서 표적 할당, 접근, 발사 타이밍을 학습하는 전술 레벨 RL.",
    },
    {
        "key": "commander_resource_deployment_optimization",
        "name": "지휘관 자원·배치 최적화 시뮬레이션",
        "description": "주어진 자원 제약 안에서 자산 선택과 초기 배치를 바꿔가며 승률이 높은 COA를 찾는 작전 레벨 탐색기.",
    },
]

TrainModule = Any
EARTH_RADIUS_KM = 6371.0
KILOMETERS_TO_NAUTICAL_MILES = 0.539957


def to_radians(degrees: float) -> float:
    return math.radians(degrees)


def to_degrees(radians: float) -> float:
    return math.degrees(radians)


def get_bearing_between_two_points(
    start_latitude: float,
    start_longitude: float,
    destination_latitude: float,
    destination_longitude: float,
) -> float:
    start_latitude_rad = to_radians(start_latitude)
    start_longitude_rad = to_radians(start_longitude)
    destination_latitude_rad = to_radians(destination_latitude)
    destination_longitude_rad = to_radians(destination_longitude)

    y = math.sin(destination_longitude_rad - start_longitude_rad) * math.cos(
        destination_latitude_rad
    )
    x = math.cos(start_latitude_rad) * math.sin(destination_latitude_rad) - math.sin(
        start_latitude_rad
    ) * math.cos(destination_latitude_rad) * math.cos(
        destination_longitude_rad - start_longitude_rad
    )
    return (to_degrees(math.atan2(y, x)) + 360.0) % 360.0


def get_distance_between_two_points(
    start_latitude: float,
    start_longitude: float,
    destination_latitude: float,
    destination_longitude: float,
) -> float:
    phi_1 = to_radians(start_latitude)
    phi_2 = to_radians(destination_latitude)
    delta_phi = to_radians(destination_latitude - start_latitude)
    delta_lambda = to_radians(destination_longitude - start_longitude)

    a = math.sin(delta_phi / 2) * math.sin(delta_phi / 2) + math.cos(phi_1) * math.cos(
        phi_2
    ) * math.sin(delta_lambda / 2) * math.sin(delta_lambda / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return EARTH_RADIUS_KM * c


def get_terminal_coordinates_from_distance_and_bearing(
    start_latitude: float, start_longitude: float, distance: float, bearing: float
) -> list[float]:
    bearing_rad = to_radians(bearing)
    initial_latitude = to_radians(start_latitude)
    initial_longitude = to_radians(start_longitude)

    final_latitude = math.asin(
        math.sin(initial_latitude) * math.cos(distance / EARTH_RADIUS_KM)
        + math.cos(initial_latitude)
        * math.sin(distance / EARTH_RADIUS_KM)
        * math.cos(bearing_rad)
    )
    final_longitude = initial_longitude + math.atan2(
        math.sin(bearing_rad)
        * math.sin(distance / EARTH_RADIUS_KM)
        * math.cos(initial_latitude),
        math.cos(distance / EARTH_RADIUS_KM)
        - math.sin(initial_latitude) * math.sin(final_latitude),
    )

    return [to_degrees(final_latitude), to_degrees(final_longitude)]


def slugify(value: str) -> str:
    normalized = re.sub(r"[^a-zA-Z0-9_-]+", "-", value.strip()).strip("-_")
    return normalized.lower() or "commander-run"


def read_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as input_file:
        return json.load(input_file)


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as output_file:
        json.dump(payload, output_file, indent=2)


def get_train_module() -> TrainModule:
    try:
        return importlib.import_module("train")
    except ModuleNotFoundError as exc:
        missing_package = exc.name or "required RL dependency"
        raise RuntimeError(
            "Commander evaluation mode requires the RL Python dependencies. "
            f"Missing package: {missing_package}. "
            "Install them with `cd gym && pip install -e .[gym]`, "
            "or rerun with `--dry-run` to generate candidates without training."
        ) from exc


def parse_args(
    argv: Sequence[str] | None = None,
) -> tuple[argparse.Namespace, list[str]]:
    parser = argparse.ArgumentParser(
        description=(
            "Search commander-level resource and deployment candidates for "
            "FixedTargetStrike-v0 using the existing tactical RL trainer as the evaluator."
        )
    )
    parser.add_argument(
        "--preset",
        choices=sorted(COMMANDER_PRESETS),
        default="quick",
        help="Preset for candidate search breadth and default RL budget.",
    )
    parser.add_argument("--run-label", type=str, default=None)
    parser.add_argument("--output-root", type=Path, default=DEFAULT_OUTPUT_ROOT)
    parser.add_argument(
        "--summary-name",
        type=str,
        default="commander_summary.json",
    )
    parser.add_argument(
        "--commander-progress-path",
        type=Path,
        default=None,
        help="Path to write commander-level progress snapshots during candidate search.",
    )
    parser.add_argument(
        "--candidate-limit",
        type=int,
        default=None,
        help="Maximum number of commander candidates to evaluate.",
    )
    parser.add_argument(
        "--retain-top-k",
        type=int,
        default=3,
        help="How many top commander candidates to keep in the summary spotlight.",
    )
    parser.add_argument(
        "--candidate-ally-ids",
        nargs="*",
        default=None,
        help="Optional aircraft pool to search over. Defaults to ally-ids if provided, otherwise all armed aircraft on the controllable side.",
    )
    parser.add_argument(
        "--min-allies",
        type=int,
        default=1,
        help="Minimum number of aircraft to include in a commander candidate.",
    )
    parser.add_argument(
        "--max-allies",
        type=int,
        default=None,
        help="Maximum number of aircraft to include in a commander candidate.",
    )
    parser.add_argument(
        "--max-resource-combinations",
        type=int,
        default=None,
        help="Cap the number of ally subset combinations before deployment variants are expanded.",
    )
    parser.add_argument(
        "--distance-scales",
        nargs="+",
        type=float,
        default=None,
        help="Relative starting-distance scales for candidate deployment rings.",
    )
    parser.add_argument(
        "--bearing-offsets-deg",
        nargs="+",
        type=float,
        default=None,
        help="Bearing offsets in degrees applied to the ally approach axis.",
    )
    parser.add_argument(
        "--formation-spreads-nm",
        nargs="+",
        type=float,
        default=None,
        help="Lateral formation spread on the deployment ring in nautical miles.",
    )
    parser.add_argument(
        "--high-value-target-search-mode",
        choices=("fixed", "single", "pair"),
        default="fixed",
        help="How to vary commander target priority candidates.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Only generate commander candidates and mutated scenarios. Do not launch RL training.",
    )
    return parser.parse_known_args(argv)


def build_run_label(args: argparse.Namespace) -> str:
    if args.run_label:
        return slugify(args.run_label)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    return f"commander-{args.preset}-{timestamp}"


def normalize_id_list(values: Sequence[str] | None) -> list[str]:
    if values is None:
        return []
    return [value.strip() for value in values if value.strip()]


def build_default_train_argv(args: argparse.Namespace, run_dir: Path) -> list[str]:
    preset = COMMANDER_PRESETS[args.preset]
    return [
        "--model-path",
        str(run_dir / "selected_model"),
        "--export-path",
        str(run_dir / "selected_eval_scenario.json"),
        "--summary-path",
        str(run_dir / "selected_train_summary.json"),
        "--progress-path",
        str(run_dir / "selected_progress.json"),
        "--eval-recording-path",
        str(run_dir / "selected_eval_recording.jsonl"),
        "--timesteps",
        str(preset["timesteps"]),
        "--eval-episodes",
        str(preset["eval_episodes"]),
        "--eval-seed-count",
        str(preset["eval_seed_count"]),
        "--progress-eval-frequency",
        str(preset["progress_eval_frequency"]),
        "--progress-eval-episodes",
        str(preset["progress_eval_episodes"]),
    ]


def build_lightweight_train_args(
    args: argparse.Namespace, argv: Sequence[str]
) -> argparse.Namespace:
    preset = COMMANDER_PRESETS[args.preset]
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument(
        "--scenario-path",
        type=Path,
        default=SCRIPT_DIR / "scen.json",
    )
    parser.add_argument("--algorithms", nargs="+", default=["ppo"])
    parser.add_argument("--timesteps", type=int, default=int(preset["timesteps"]))
    parser.add_argument(
        "--eval-episodes", type=int, default=int(preset["eval_episodes"])
    )
    parser.add_argument(
        "--eval-seed-count", type=int, default=int(preset["eval_seed_count"])
    )
    parser.add_argument("--curriculum-enabled", action="store_true")
    parser.add_argument("--controllable-side-name", type=str, default="BLUE")
    parser.add_argument("--target-side-name", type=str, default="RED")
    parser.add_argument(
        "--ally-ids",
        nargs="+",
        default=["blue-striker-1", "blue-striker-2"],
    )
    parser.add_argument(
        "--target-ids",
        nargs="+",
        default=["red-sam-site", "red-airbase"],
    )
    parser.add_argument(
        "--high-value-target-ids",
        nargs="*",
        default=["red-airbase"],
    )
    parsed, _ = parser.parse_known_args(list(argv))
    return parsed


def get_scenario_root(payload: dict[str, Any]) -> dict[str, Any]:
    current_scenario = payload.get("currentScenario")
    if isinstance(current_scenario, dict):
        return current_scenario
    return payload


def build_side_name_map(scenario: dict[str, Any]) -> dict[str, str]:
    side_name_map: dict[str, str] = {}
    for side in scenario.get("sides", []):
        if not isinstance(side, dict):
            continue
        side_id = str(side.get("id", "")).strip()
        if not side_id:
            continue
        side_name = str(side.get("name", side_id)).strip() or side_id
        side_name_map[side_id] = side_name
    return side_name_map


def resolve_side_id(scenario: dict[str, Any], side_name: str) -> str:
    requested_name = side_name.strip()
    for side in scenario.get("sides", []):
        if not isinstance(side, dict):
            continue
        if str(side.get("name", "")).strip() == requested_name:
            return str(side.get("id", "")).strip()
    raise RuntimeError(f"Unable to find side named '{side_name}' in the scenario.")


def count_weapon_quantity(record: dict[str, Any]) -> int:
    weapons = record.get("weapons")
    if not isinstance(weapons, list):
        return 0
    total = 0
    for weapon in weapons:
        if not isinstance(weapon, dict):
            continue
        quantity = weapon.get("currentQuantity", weapon.get("maxQuantity", 1))
        try:
            total += max(int(quantity), 0)
        except (TypeError, ValueError):
            total += 1
    return total


def collect_aircraft_options(
    scenario: dict[str, Any], side_id: str, side_name_map: dict[str, str]
) -> list[dict[str, Any]]:
    aircraft_options: list[dict[str, Any]] = []
    for aircraft in scenario.get("aircraft", []):
        if not isinstance(aircraft, dict):
            continue
        if str(aircraft.get("sideId", "")).strip() != side_id:
            continue
        aircraft_id = str(aircraft.get("id", "")).strip()
        if not aircraft_id:
            continue
        aircraft_options.append(
            {
                "id": aircraft_id,
                "name": str(aircraft.get("name", aircraft_id)).strip() or aircraft_id,
                "class_name": str(aircraft.get("className", "")).strip(),
                "side_id": side_id,
                "side_name": side_name_map.get(side_id, side_id),
                "latitude": float(aircraft.get("latitude", 0.0)),
                "longitude": float(aircraft.get("longitude", 0.0)),
                "weapon_count": count_weapon_quantity(aircraft),
            }
        )
    aircraft_options.sort(
        key=lambda item: (-int(item["weapon_count"]), str(item["name"]), str(item["id"]))
    )
    return aircraft_options


def is_stationary_ship(record: dict[str, Any]) -> bool:
    try:
        return float(record.get("speed", 0.0)) == 0.0
    except (TypeError, ValueError):
        return False


def collect_fixed_targets(
    scenario: dict[str, Any], side_id: str, side_name_map: dict[str, str]
) -> list[dict[str, Any]]:
    targets: list[dict[str, Any]] = []
    for group_name, kind in (
        ("facilities", "facility"),
        ("airbases", "airbase"),
        ("ships", "ship"),
    ):
        for target in scenario.get(group_name, []):
            if not isinstance(target, dict):
                continue
            if str(target.get("sideId", "")).strip() != side_id:
                continue
            if group_name == "ships" and not is_stationary_ship(target):
                continue
            target_id = str(target.get("id", "")).strip()
            if not target_id:
                continue
            targets.append(
                {
                    "id": target_id,
                    "name": str(target.get("name", target_id)).strip() or target_id,
                    "class_name": str(target.get("className", "")).strip(),
                    "side_id": side_id,
                    "side_name": side_name_map.get(side_id, side_id),
                    "kind": kind,
                    "latitude": float(target.get("latitude", 0.0)),
                    "longitude": float(target.get("longitude", 0.0)),
                }
            )
    targets.sort(key=lambda item: (str(item["name"]), str(item["id"])))
    return targets


def select_candidate_pool(
    all_allies: list[dict[str, Any]],
    explicit_candidate_ids: list[str],
    fallback_ids: list[str],
) -> list[dict[str, Any]]:
    requested_ids = explicit_candidate_ids or fallback_ids
    if requested_ids:
        requested_set = set(requested_ids)
        filtered = [ally for ally in all_allies if str(ally["id"]) in requested_set]
        if not filtered:
            raise RuntimeError(
                "None of the requested commander candidate ally ids were found in the scenario."
            )
        return filtered

    armed_allies = [ally for ally in all_allies if int(ally["weapon_count"]) > 0]
    return armed_allies if armed_allies else all_allies


def select_target_ids(
    available_targets: list[dict[str, Any]], requested_target_ids: list[str]
) -> list[str]:
    if requested_target_ids:
        available_target_id_set = {str(target["id"]) for target in available_targets}
        selected = [
            target_id
            for target_id in requested_target_ids
            if target_id in available_target_id_set
        ]
        if not selected:
            raise RuntimeError("None of the requested target ids were found in the scenario.")
        return selected
    return [str(target["id"]) for target in available_targets]


def select_high_value_target_variants(
    target_ids: list[str],
    base_high_value_target_ids: list[str],
    mode: str,
) -> list[list[str]]:
    base_filtered = [target_id for target_id in base_high_value_target_ids if target_id in target_ids]
    fallback = [target_ids[0]] if target_ids else []
    if mode == "fixed":
        return [base_filtered or fallback]

    if mode == "single":
        variants = [[target_id] for target_id in target_ids]
        if base_filtered and base_filtered not in variants:
            variants.insert(0, base_filtered)
        return variants or [fallback]

    pair_variants: list[list[str]] = []
    if base_filtered:
        pair_variants.append(base_filtered)
    pair_variants.extend([[target_id] for target_id in target_ids])
    pair_variants.extend(
        [list(pair) for pair in itertools.combinations(target_ids, 2)]
    )

    deduped: list[list[str]] = []
    seen: set[tuple[str, ...]] = set()
    for variant in pair_variants:
        signature = tuple(sorted(variant))
        if signature in seen:
            continue
        seen.add(signature)
        deduped.append(list(signature))
    return deduped or [fallback]


def build_resource_combinations(
    candidate_pool: list[dict[str, Any]],
    min_allies: int,
    max_allies: int,
    max_resource_combinations: int | None,
) -> list[tuple[dict[str, Any], ...]]:
    normalized_min = max(1, min_allies)
    normalized_max = max(normalized_min, min(max_allies, len(candidate_pool)))
    combinations: list[tuple[dict[str, Any], ...]] = []
    for ally_count in range(normalized_min, normalized_max + 1):
        combinations.extend(itertools.combinations(candidate_pool, ally_count))
    combinations.sort(
        key=lambda combo: (
            -sum(int(ally["weapon_count"]) for ally in combo),
            len(combo),
            ",".join(str(ally["id"]) for ally in combo),
        )
    )
    if max_resource_combinations is not None and max_resource_combinations > 0:
        return combinations[:max_resource_combinations]
    return combinations


def build_deployment_variants(
    distance_scales: Sequence[float],
    bearing_offsets_deg: Sequence[float],
    formation_spreads_nm: Sequence[float],
) -> list[dict[str, Any]]:
    variants: list[dict[str, Any]] = []
    for distance_scale, bearing_offset_deg, formation_spread_nm in itertools.product(
        distance_scales,
        bearing_offsets_deg,
        formation_spreads_nm,
    ):
        variants.append(
            {
                "distance_scale": float(distance_scale),
                "bearing_offset_deg": float(bearing_offset_deg),
                "formation_spread_nm": float(formation_spread_nm),
                "key": (
                    f"d{float(distance_scale):.2f}_"
                    f"b{float(bearing_offset_deg):+.0f}_"
                    f"s{float(formation_spread_nm):.1f}"
                ),
            }
        )
    variants.sort(
        key=lambda variant: (
            abs(float(variant["distance_scale"]) - 1.0),
            abs(float(variant["bearing_offset_deg"])),
            abs(float(variant["formation_spread_nm"])),
        )
    )
    return variants


def compute_target_centroid(
    scenario: dict[str, Any], target_ids: list[str]
) -> tuple[float, float]:
    target_lookup = {
        str(target.get("id", "")).strip(): target
        for group_name in ("facilities", "airbases", "ships")
        for target in scenario.get(group_name, [])
        if isinstance(target, dict)
    }
    selected_targets = [target_lookup[target_id] for target_id in target_ids if target_id in target_lookup]
    if not selected_targets:
        raise RuntimeError("Cannot compute commander deployment centroid without targets.")

    centroid_latitude = sum(float(target.get("latitude", 0.0)) for target in selected_targets) / len(
        selected_targets
    )
    centroid_longitude = sum(
        float(target.get("longitude", 0.0)) for target in selected_targets
    ) / len(selected_targets)
    return centroid_latitude, centroid_longitude


def compute_ally_centroid(selected_aircraft: Sequence[dict[str, Any]]) -> tuple[float, float]:
    if not selected_aircraft:
        raise RuntimeError("Cannot compute ally centroid for an empty aircraft set.")
    centroid_latitude = sum(float(aircraft.get("latitude", 0.0)) for aircraft in selected_aircraft) / len(
        selected_aircraft
    )
    centroid_longitude = sum(
        float(aircraft.get("longitude", 0.0)) for aircraft in selected_aircraft
    ) / len(selected_aircraft)
    return centroid_latitude, centroid_longitude


def build_formation_angle_offsets(
    ally_count: int, formation_spread_nm: float, ring_radius_nm: float
) -> list[float]:
    if ally_count <= 1 or formation_spread_nm <= 0.0:
        return [0.0 for _ in range(ally_count)]
    arc_degrees = min(
        90.0,
        (formation_spread_nm / max(ring_radius_nm, 1.0)) * (180.0 / 3.141592653589793),
    )
    if ally_count == 2:
        return [-arc_degrees / 2.0, arc_degrees / 2.0]
    step = arc_degrees / max(ally_count - 1, 1)
    return [(-arc_degrees / 2.0) + (step * index) for index in range(ally_count)]


def mutate_candidate_scenario(
    scenario_payload: dict[str, Any],
    *,
    controllable_side_id: str,
    selected_ally_ids: list[str],
    target_ids: list[str],
    deployment: dict[str, Any],
) -> dict[str, Any]:
    mutated_payload = copy.deepcopy(scenario_payload)
    current_scenario = get_scenario_root(mutated_payload)
    selected_ally_id_set = set(selected_ally_ids)
    current_scenario["aircraft"] = [
        aircraft
        for aircraft in current_scenario.get("aircraft", [])
        if not isinstance(aircraft, dict)
        or str(aircraft.get("sideId", "")).strip() != controllable_side_id
        or str(aircraft.get("id", "")).strip() in selected_ally_id_set
    ]

    selected_aircraft = [
        aircraft
        for aircraft in current_scenario.get("aircraft", [])
        if isinstance(aircraft, dict)
        and str(aircraft.get("sideId", "")).strip() == controllable_side_id
        and str(aircraft.get("id", "")).strip() in selected_ally_id_set
    ]
    if len(selected_aircraft) != len(selected_ally_ids):
        missing_ids = [
            ally_id
            for ally_id in selected_ally_ids
            if ally_id not in {str(aircraft.get("id", "")).strip() for aircraft in selected_aircraft}
        ]
        raise RuntimeError(f"Unable to find selected ally aircraft in scenario: {missing_ids}")

    selected_aircraft.sort(
        key=lambda aircraft: selected_ally_ids.index(str(aircraft.get("id", "")).strip())
    )
    target_centroid_latitude, target_centroid_longitude = compute_target_centroid(
        current_scenario,
        target_ids,
    )
    ally_centroid_latitude, ally_centroid_longitude = compute_ally_centroid(selected_aircraft)
    base_bearing = get_bearing_between_two_points(
        target_centroid_latitude,
        target_centroid_longitude,
        ally_centroid_latitude,
        ally_centroid_longitude,
    )
    base_distance_nm = max(
        1.0,
        float(
            get_distance_between_two_points(
                target_centroid_latitude,
                target_centroid_longitude,
                ally_centroid_latitude,
                ally_centroid_longitude,
            )
        )
        * KILOMETERS_TO_NAUTICAL_MILES,
    )
    ring_radius_nm = max(1.0, base_distance_nm * float(deployment["distance_scale"]))
    formation_offsets = build_formation_angle_offsets(
        len(selected_aircraft),
        float(deployment["formation_spread_nm"]),
        ring_radius_nm,
    )

    for index, aircraft in enumerate(selected_aircraft):
        final_bearing = (
            base_bearing
            + float(deployment["bearing_offset_deg"])
            + formation_offsets[index]
        )
        target_distance_km = ring_radius_nm / KILOMETERS_TO_NAUTICAL_MILES
        next_latitude, next_longitude = get_terminal_coordinates_from_distance_and_bearing(
            target_centroid_latitude,
            target_centroid_longitude,
            target_distance_km,
            final_bearing,
        )
        aircraft["latitude"] = next_latitude
        aircraft["longitude"] = next_longitude
        aircraft["heading"] = get_bearing_between_two_points(
            next_latitude,
            next_longitude,
            target_centroid_latitude,
            target_centroid_longitude,
        )
        aircraft["route"] = []
        aircraft["desiredRoute"] = []

    return mutated_payload


def build_candidate_label(
    ally_ids: list[str], deployment: dict[str, Any], high_value_target_ids: list[str]
) -> str:
    ally_label = "-".join(ally_ids)
    high_value_label = "-".join(high_value_target_ids) if high_value_target_ids else "none"
    return (
        f"{ally_label}__{deployment['key']}__hvt-{slugify(high_value_label)}"
    )[:120]


def build_candidate_search_space(
    candidate_pool: list[dict[str, Any]],
    resource_combinations: list[tuple[dict[str, Any], ...]],
    deployment_variants: list[dict[str, Any]],
    high_value_variants: list[list[str]],
    target_ids: list[str],
    candidate_limit: int,
) -> list[dict[str, Any]]:
    candidates: list[dict[str, Any]] = []
    for resource_combination in resource_combinations:
        ally_ids = [str(ally["id"]) for ally in resource_combination]
        ally_names = [str(ally["name"]) for ally in resource_combination]
        total_weapon_count = sum(int(ally["weapon_count"]) for ally in resource_combination)
        for deployment_variant in deployment_variants:
            for high_value_target_ids in high_value_variants:
                candidates.append(
                    {
                        "candidate_id": f"candidate-{len(candidates) + 1:03d}",
                        "label": build_candidate_label(
                            ally_ids,
                            deployment_variant,
                            high_value_target_ids,
                        ),
                        "decision": {
                            "ally_ids": ally_ids,
                            "target_ids": list(target_ids),
                            "high_value_target_ids": list(high_value_target_ids),
                            "deployment": deployment_variant,
                        },
                        "resource_summary": {
                            "ally_count": len(ally_ids),
                            "ally_names": ally_names,
                            "total_weapon_count": total_weapon_count,
                            "candidate_pool_size": len(candidate_pool),
                        },
                    }
                )

    candidates.sort(
        key=lambda candidate: (
            -int(candidate["resource_summary"]["total_weapon_count"]),
            abs(
                float(candidate["decision"]["deployment"]["distance_scale"]) - 1.0
            ),
            abs(float(candidate["decision"]["deployment"]["bearing_offset_deg"])),
            abs(float(candidate["decision"]["deployment"]["formation_spread_nm"])),
            int(candidate["resource_summary"]["ally_count"]),
            str(candidate["label"]),
        )
    )
    trimmed = candidates[: max(candidate_limit, 1)]
    for index, candidate in enumerate(trimmed, start=1):
        candidate["candidate_id"] = f"candidate-{index:03d}"
    return trimmed


def clone_train_args(train_args: argparse.Namespace) -> argparse.Namespace:
    return argparse.Namespace(**vars(train_args))


def commander_evaluation_score(
    evaluation: dict[str, Any]
) -> tuple[float, float, float, float, float, float]:
    return (
        float(evaluation.get("success_rate", 0.0)),
        float(evaluation.get("survivability", 0.0)),
        -float(evaluation.get("time_to_ready", float("inf"))),
        float(evaluation.get("weapon_efficiency", 0.0)),
        float(evaluation.get("mean_reward", float("-inf"))),
        -float(evaluation.get("mean_episode_steps", float("inf"))),
    )


def build_candidate_metric_leaders(
    candidate_results: Sequence[dict[str, Any]],
) -> dict[str, dict[str, Any] | None]:
    successful_results = [
        result for result in candidate_results if result.get("status") == "completed"
    ]
    if not successful_results:
        return {
            "overall": None,
            "success_rate": None,
            "survivability": None,
            "weapon_efficiency": None,
            "time_to_ready": None,
        }

    def summarize(result: dict[str, Any]) -> dict[str, Any]:
        evaluation = result.get("evaluation", {})
        return {
            "candidate_id": result.get("candidate_id"),
            "label": result.get("label"),
            "evaluation_summary": {
                "success_rate": evaluation.get("success_rate"),
                "survivability": evaluation.get("survivability"),
                "weapon_efficiency": evaluation.get("weapon_efficiency"),
                "time_to_ready": evaluation.get("time_to_ready"),
                "mean_reward": evaluation.get("mean_reward"),
            },
        }

    return {
        "overall": summarize(
            max(
                successful_results,
                key=lambda result: commander_evaluation_score(result["evaluation"]),
            )
        ),
        "success_rate": summarize(
            max(
                successful_results,
                key=lambda result: float(result["evaluation"].get("success_rate", 0.0)),
            )
        ),
        "survivability": summarize(
            max(
                successful_results,
                key=lambda result: float(result["evaluation"].get("survivability", 0.0)),
            )
        ),
        "weapon_efficiency": summarize(
            max(
                successful_results,
                key=lambda result: float(result["evaluation"].get("weapon_efficiency", 0.0)),
            )
        ),
        "time_to_ready": summarize(
            min(
                successful_results,
                key=lambda result: float(
                    result["evaluation"].get("time_to_ready", float("inf"))
                ),
            )
        ),
    }


def run_candidate(
    train_module: TrainModule,
    base_train_args: argparse.Namespace,
    base_payload: dict[str, Any],
    *,
    controllable_side_id: str,
    candidate: dict[str, Any],
    candidate_dir: Path,
) -> dict[str, Any]:
    candidate_dir.mkdir(parents=True, exist_ok=True)
    candidate_scenario_path = candidate_dir / "scenario.json"
    mutated_payload = mutate_candidate_scenario(
        base_payload,
        controllable_side_id=controllable_side_id,
        selected_ally_ids=list(candidate["decision"]["ally_ids"]),
        target_ids=list(candidate["decision"]["target_ids"]),
        deployment=candidate["decision"]["deployment"],
    )
    write_json(candidate_scenario_path, mutated_payload)

    candidate_args = clone_train_args(base_train_args)
    candidate_args.scenario_path = candidate_scenario_path
    candidate_args.model_path = candidate_dir / "selected_model"
    candidate_args.export_path = candidate_dir / "eval_scenario.json"
    candidate_args.summary_path = candidate_dir / "train_summary.json"
    candidate_args.progress_path = candidate_dir / "progress.json"
    candidate_args.eval_recording_path = candidate_dir / "eval_recording.jsonl"
    candidate_args.ally_ids = list(candidate["decision"]["ally_ids"])
    candidate_args.target_ids = list(candidate["decision"]["target_ids"])
    candidate_args.high_value_target_ids = list(
        candidate["decision"]["high_value_target_ids"]
    )

    train_summary = train_module.train_model(candidate_args)
    return {
        "candidate_id": candidate["candidate_id"],
        "label": candidate["label"],
        "status": "completed",
        "decision": candidate["decision"],
        "resource_summary": candidate["resource_summary"],
        "training_mode": train_summary.get("training_mode"),
        "selected_algorithm": train_summary.get("selected_algorithm"),
        "selection_metric": train_summary.get("selection_metric"),
        "evaluation": train_summary.get("evaluation", {}),
        "best_run": train_summary.get("best_run"),
        "leaderboard": train_summary.get("leaderboard", []),
        "metric_leaders": train_summary.get("metric_leaders", {}),
        "artifacts": {
            "candidate_dir": str(candidate_dir),
            "scenario_path": str(candidate_scenario_path),
            "train_summary_path": str(candidate_args.summary_path),
            "progress_path": str(candidate_args.progress_path),
            "model_path": str(train_module.model_zip_path(candidate_args.model_path)),
            "model_metadata_path": str(
                train_module.model_metadata_path(candidate_args.model_path)
            ),
            "eval_scenario_path": str(candidate_args.export_path),
            "eval_recording_path": str(candidate_args.eval_recording_path),
        },
    }


def copy_file_if_exists(source_path: Path, destination_path: Path) -> str | None:
    if not source_path.exists():
        return None
    destination_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source_path, destination_path)
    return str(destination_path)


def build_evaluation_snapshot(
    train_module: TrainModule | None, evaluation: dict[str, Any]
) -> dict[str, Any]:
    if train_module is not None:
        return train_module.build_evaluation_snapshot(evaluation)
    return {
        "success_rate": evaluation.get("success_rate"),
        "mean_reward": evaluation.get("mean_reward"),
        "mean_episode_steps": evaluation.get("mean_episode_steps"),
        "survivability": evaluation.get("survivability"),
        "weapon_efficiency": evaluation.get("weapon_efficiency"),
        "time_to_ready": evaluation.get("time_to_ready"),
    }


def build_progress(
    *,
    args: argparse.Namespace,
    run_dir: Path,
    train_module: TrainModule | None,
    commander_candidates: Sequence[dict[str, Any]],
    candidate_results: Sequence[dict[str, Any]],
    current_candidate: dict[str, Any] | None,
    status: str,
) -> dict[str, Any]:
    successful_results = [
        result for result in candidate_results if result.get("status") == "completed"
    ]
    leaderboard = [
        {
            "rank": index + 1,
            "candidate_id": result.get("candidate_id"),
            "label": result.get("label"),
            "selected_algorithm": result.get("selected_algorithm"),
            "evaluation_summary": build_evaluation_snapshot(
                train_module,
                result.get("evaluation", {}),
            ),
        }
        for index, result in enumerate(
            sorted(
                successful_results,
                key=lambda result: commander_evaluation_score(
                    result.get("evaluation", {})
                ),
                reverse=True,
            )
        )
    ]
    return {
        "commander_progress_schema_version": 1,
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "run_label": run_dir.name,
        "run_dir": str(run_dir),
        "status": status,
        "dry_run": bool(args.dry_run),
        "candidate_count": len(commander_candidates),
        "finished_candidate_count": len(candidate_results),
        "completed_candidate_count": len(successful_results),
        "planned_candidate_count": len(
            [result for result in candidate_results if result.get("status") == "planned"]
        ),
        "failed_candidate_count": len(
            [result for result in candidate_results if result.get("status") == "failed"]
        ),
        "current_candidate_id": (
            current_candidate.get("candidate_id") if current_candidate else None
        ),
        "current_candidate_label": (
            current_candidate.get("label") if current_candidate else None
        ),
        "top_candidate": leaderboard[0] if leaderboard else None,
        "leaderboard": leaderboard[:10],
        "candidates": [
            {
                "candidate_id": result.get("candidate_id"),
                "label": result.get("label"),
                "status": result.get("status"),
                "selected_algorithm": result.get("selected_algorithm"),
                "evaluation_summary": build_evaluation_snapshot(
                    train_module,
                    result.get("evaluation", {}),
                )
                if isinstance(result.get("evaluation"), dict)
                else None,
                "error": result.get("error"),
            }
            for result in candidate_results
        ],
    }


def build_summary(
    *,
    args: argparse.Namespace,
    run_dir: Path,
    train_module: TrainModule | None,
    base_train_args: argparse.Namespace,
    candidate_pool: list[dict[str, Any]],
    target_ids: list[str],
    commander_candidates: list[dict[str, Any]],
    candidate_results: list[dict[str, Any]],
    selected_candidate: dict[str, Any] | None,
    selected_artifacts: dict[str, str | None],
) -> dict[str, Any]:
    successful_results = [
        result for result in candidate_results if result.get("status") == "completed"
    ]
    leaderboard = [
        {
            "rank": index + 1,
            "candidate_id": result.get("candidate_id"),
            "label": result.get("label"),
            "decision": result.get("decision"),
            "resource_summary": result.get("resource_summary"),
            "evaluation_summary": train_module.build_evaluation_snapshot(
                result.get("evaluation", {})
            ),
            "selected_algorithm": result.get("selected_algorithm"),
        }
        for index, result in enumerate(
            sorted(
                successful_results,
                key=lambda result: commander_evaluation_score(
                    result.get("evaluation", {})
                ),
                reverse=True,
            )
        )
    ]

    top_candidates = leaderboard[: max(int(args.retain_top_k), 1)]
    return {
        "commander_summary_schema_version": COMMANDER_SUMMARY_SCHEMA_VERSION,
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "feature_catalog": FEATURE_CATALOG,
        "run_label": run_dir.name,
        "run_dir": str(run_dir),
        "dry_run": bool(args.dry_run),
        "implemented_scope": {
            "resource_search": True,
            "deployment_search": True,
            "commander_priority_search": True,
            "environment_search": False,
            "notes": "현재는 자산 조합, 초기 배치, 고가치 표적 우선순위를 바꾸며 탐색합니다. 날씨·센서·전자전 변동 탐색은 아직 포함되지 않습니다.",
        },
        "selection_metric": COMMANDER_SELECTION_METRIC,
        "base_training_request": {
            "scenario_path": str(base_train_args.scenario_path),
            "algorithms": list(base_train_args.algorithms),
            "timesteps": int(base_train_args.timesteps),
            "eval_episodes": int(base_train_args.eval_episodes),
            "eval_seed_count": int(base_train_args.eval_seed_count),
            "curriculum_enabled": bool(base_train_args.curriculum_enabled),
            "controllable_side_name": str(base_train_args.controllable_side_name),
            "target_side_name": str(base_train_args.target_side_name),
            "target_ids": list(target_ids),
            "high_value_target_ids": list(base_train_args.high_value_target_ids),
        },
        "search_space": {
            "candidate_ally_pool": [
                {
                    "id": ally["id"],
                    "name": ally["name"],
                    "class_name": ally["class_name"],
                    "weapon_count": ally["weapon_count"],
                }
                for ally in candidate_pool
            ],
            "candidate_count": len(commander_candidates),
            "high_value_target_search_mode": args.high_value_target_search_mode,
            "distance_scales": list(
                args.distance_scales
                if args.distance_scales is not None
                else COMMANDER_PRESETS[args.preset]["distance_scales"]
            ),
            "bearing_offsets_deg": list(
                args.bearing_offsets_deg
                if args.bearing_offsets_deg is not None
                else COMMANDER_PRESETS[args.preset]["bearing_offsets_deg"]
            ),
            "formation_spreads_nm": list(
                args.formation_spreads_nm
                if args.formation_spreads_nm is not None
                else COMMANDER_PRESETS[args.preset]["formation_spreads_nm"]
            ),
        },
        "selected_candidate_id": (
            selected_candidate.get("candidate_id") if selected_candidate else None
        ),
        "selected_candidate_label": (
            selected_candidate.get("label") if selected_candidate else None
        ),
        "selected_candidate_artifacts": selected_artifacts,
        "top_candidates": top_candidates,
        "leaderboard": leaderboard,
        "metric_leaders": build_candidate_metric_leaders(candidate_results),
        "candidates": candidate_results,
    }


def main(argv: Sequence[str] | None = None) -> dict[str, Any]:
    args, forwarded_train_argv = parse_args(argv)
    run_label = build_run_label(args)
    run_dir = args.output_root / run_label
    run_dir.mkdir(parents=True, exist_ok=True)

    default_train_argv = build_default_train_argv(args, run_dir)
    train_module: TrainModule | None = None
    if args.dry_run:
        base_train_args = build_lightweight_train_args(
            args, default_train_argv + list(forwarded_train_argv)
        )
    else:
        train_module = get_train_module()
        base_train_args = train_module.parse_args(
            default_train_argv + list(forwarded_train_argv)
        )
    base_payload = read_json(Path(base_train_args.scenario_path))
    scenario = get_scenario_root(base_payload)
    side_name_map = build_side_name_map(scenario)
    controllable_side_id = resolve_side_id(
        scenario, str(base_train_args.controllable_side_name)
    )
    target_side_id = resolve_side_id(scenario, str(base_train_args.target_side_name))

    all_allies = collect_aircraft_options(scenario, controllable_side_id, side_name_map)
    if not all_allies:
        raise RuntimeError(
            "No controllable-side aircraft available for commander optimization."
        )
    available_targets = collect_fixed_targets(scenario, target_side_id, side_name_map)
    if not available_targets:
        raise RuntimeError("No fixed targets available for commander optimization.")

    use_explicit_ally_ids = "--ally-ids" in forwarded_train_argv
    candidate_pool = select_candidate_pool(
        all_allies,
        normalize_id_list(args.candidate_ally_ids),
        list(base_train_args.ally_ids) if use_explicit_ally_ids else [],
    )
    target_ids = select_target_ids(
        available_targets,
        list(base_train_args.target_ids)
        if "--target-ids" in forwarded_train_argv
        else [],
    )
    high_value_variants = select_high_value_target_variants(
        target_ids,
        list(base_train_args.high_value_target_ids)
        if "--high-value-target-ids" in forwarded_train_argv
        else [],
        args.high_value_target_search_mode,
    )

    preset = COMMANDER_PRESETS[args.preset]
    distance_scales = (
        list(args.distance_scales)
        if args.distance_scales is not None
        else list(preset["distance_scales"])
    )
    bearing_offsets_deg = (
        list(args.bearing_offsets_deg)
        if args.bearing_offsets_deg is not None
        else list(preset["bearing_offsets_deg"])
    )
    formation_spreads_nm = (
        list(args.formation_spreads_nm)
        if args.formation_spreads_nm is not None
        else list(preset["formation_spreads_nm"])
    )
    candidate_limit = (
        int(args.candidate_limit)
        if args.candidate_limit is not None
        else int(preset["candidate_limit"])
    )
    resource_combinations = build_resource_combinations(
        candidate_pool,
        min_allies=int(args.min_allies),
        max_allies=(
            int(args.max_allies) if args.max_allies is not None else len(candidate_pool)
        ),
        max_resource_combinations=(
            int(args.max_resource_combinations)
            if args.max_resource_combinations is not None
            else int(preset["max_resource_combinations"])
        ),
    )
    deployment_variants = build_deployment_variants(
        distance_scales,
        bearing_offsets_deg,
        formation_spreads_nm,
    )
    commander_candidates = build_candidate_search_space(
        candidate_pool,
        resource_combinations,
        deployment_variants,
        high_value_variants,
        target_ids,
        candidate_limit,
    )
    commander_progress_path = (
        args.commander_progress_path
        if args.commander_progress_path is not None
        else run_dir / "commander_progress.json"
    )

    candidate_results: list[dict[str, Any]] = []
    write_json(
        commander_progress_path,
        build_progress(
            args=args,
            run_dir=run_dir,
            train_module=train_module,
            commander_candidates=commander_candidates,
            candidate_results=candidate_results,
            current_candidate=None,
            status="planning",
        ),
    )
    for candidate in commander_candidates:
        candidate_dir = run_dir / candidate["candidate_id"]
        candidate_scenario_path = candidate_dir / "scenario.json"
        write_json(
            commander_progress_path,
            build_progress(
                args=args,
                run_dir=run_dir,
                train_module=train_module,
                commander_candidates=commander_candidates,
                candidate_results=candidate_results,
                current_candidate=candidate,
                status="running",
            ),
        )
        try:
            mutated_payload = mutate_candidate_scenario(
                base_payload,
                controllable_side_id=controllable_side_id,
                selected_ally_ids=list(candidate["decision"]["ally_ids"]),
                target_ids=list(candidate["decision"]["target_ids"]),
                deployment=candidate["decision"]["deployment"],
            )
            write_json(candidate_scenario_path, mutated_payload)

            if args.dry_run:
                candidate_results.append(
                    {
                        "candidate_id": candidate["candidate_id"],
                        "label": candidate["label"],
                        "status": "planned",
                        "decision": candidate["decision"],
                        "resource_summary": candidate["resource_summary"],
                        "artifacts": {
                            "candidate_dir": str(candidate_dir),
                            "scenario_path": str(candidate_scenario_path),
                        },
                    }
                )
                continue

            if train_module is None:
                raise RuntimeError("Train module is required for commander evaluation runs.")

            candidate_results.append(
                run_candidate(
                    train_module,
                    base_train_args,
                    base_payload,
                    controllable_side_id=controllable_side_id,
                    candidate=candidate,
                    candidate_dir=candidate_dir,
                )
            )
        except Exception as exc:
            candidate_results.append(
                {
                    "candidate_id": candidate["candidate_id"],
                    "label": candidate["label"],
                    "status": "failed",
                    "decision": candidate["decision"],
                    "resource_summary": candidate["resource_summary"],
                    "error": str(exc),
                    "artifacts": {
                        "candidate_dir": str(candidate_dir),
                        "scenario_path": str(candidate_scenario_path),
                    },
                }
            )
        write_json(
            commander_progress_path,
            build_progress(
                args=args,
                run_dir=run_dir,
                train_module=train_module,
                commander_candidates=commander_candidates,
                candidate_results=candidate_results,
                current_candidate=None,
                status="running",
            ),
        )

    successful_results = [
        result for result in candidate_results if result.get("status") == "completed"
    ]
    selected_candidate = (
        max(
            successful_results,
            key=lambda result: commander_evaluation_score(result["evaluation"]),
        )
        if successful_results
        else None
    )
    selected_artifacts: dict[str, str | None] = {
        "scenario_path": None,
        "model_path": None,
        "model_metadata_path": None,
        "eval_scenario_path": None,
        "eval_recording_path": None,
    }

    if selected_candidate is not None:
        selected_artifacts["scenario_path"] = copy_file_if_exists(
            Path(selected_candidate["artifacts"]["scenario_path"]),
            run_dir / "selected_candidate_scenario.json",
        )
        selected_artifacts["model_path"] = copy_file_if_exists(
            Path(selected_candidate["artifacts"]["model_path"]),
            run_dir / "selected_candidate_model.zip",
        )
        selected_artifacts["model_metadata_path"] = copy_file_if_exists(
            Path(selected_candidate["artifacts"]["model_metadata_path"]),
            run_dir / "selected_candidate_model.metadata.json",
        )
        selected_artifacts["eval_scenario_path"] = copy_file_if_exists(
            Path(selected_candidate["artifacts"]["eval_scenario_path"]),
            run_dir / "selected_candidate_eval_scenario.json",
        )
        selected_artifacts["eval_recording_path"] = copy_file_if_exists(
            Path(selected_candidate["artifacts"]["eval_recording_path"]),
            run_dir / "selected_candidate_eval_recording.jsonl",
        )

    summary = build_summary(
        args=args,
        run_dir=run_dir,
        train_module=train_module,
        base_train_args=base_train_args,
        candidate_pool=candidate_pool,
        target_ids=target_ids,
        commander_candidates=commander_candidates,
        candidate_results=candidate_results,
        selected_candidate=selected_candidate,
        selected_artifacts=selected_artifacts,
    )
    write_json(
        commander_progress_path,
        build_progress(
            args=args,
            run_dir=run_dir,
            train_module=train_module,
            commander_candidates=commander_candidates,
            candidate_results=candidate_results,
            current_candidate=None,
            status="completed",
        ),
    )
    summary_path = run_dir / args.summary_name
    write_json(summary_path, summary)
    print(
        json.dumps(
            {
                "summary_path": str(summary_path),
                "run_dir": str(run_dir),
                "selected_candidate_id": summary.get("selected_candidate_id"),
                "selected_candidate_label": summary.get("selected_candidate_label"),
                "candidate_count": len(commander_candidates),
                "completed_candidate_count": len(successful_results),
                "dry_run": bool(args.dry_run),
            },
            indent=2,
        )
    )
    return summary


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        raise SystemExit(f"Commander optimization failed: {exc}") from exc
