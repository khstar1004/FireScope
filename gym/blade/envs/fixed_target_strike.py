from __future__ import annotations

import importlib
from typing import Any, Callable

import gymnasium as gym
import numpy as np
from gymnasium import spaces

from blade.Doctrine import DoctrineType
from blade.Game import Game
from blade.Scenario import Scenario
from blade.envs.fixed_target_strike_types import (
    FixedTargetStrikeConfig,
    LaunchEvent,
    OBSERVATION_VERSION,
    StepContext,
)
from blade.units.Airbase import Airbase
from blade.units.Aircraft import Aircraft
from blade.units.Facility import Facility
from blade.units.Ship import Ship
from blade.units.Weapon import Weapon
from blade.utils.constants import NAUTICAL_MILES_TO_METERS
from blade.utils.utils import (
    get_bearing_between_two_points,
    get_distance_between_two_points,
    get_terminal_coordinates_from_distance_and_bearing,
)

FixedTarget = Facility | Airbase | Ship

ALLY_FEATURE_COUNT = 11
TARGET_FEATURE_COUNT = 10
GLOBAL_FEATURE_COUNT = 8
ALLY_ACTION_CONTROL_COUNT = 3
MODE_HOLD_THRESHOLD = 1.0 / 3.0
MODE_REPOSITION_THRESHOLD = 2.0 / 3.0


class FixedTargetStrikeEnv(gym.Env):
    metadata = {"render_modes": []}

    def __init__(
        self,
        render_mode: str | None = None,
        game: Game | None = None,
        config: FixedTargetStrikeConfig | None = None,
    ):
        if game is None:
            raise ValueError("game is required")
        if config is None:
            raise ValueError("config is required")

        self.render_mode = render_mode
        self.game = game
        self.config = config
        self._reward_callable: Callable[..., Any] | None = None

        self.observation_space = spaces.Dict(
            {
                "allies": spaces.Box(
                    low=0.0,
                    high=1.0,
                    shape=(self.config.max_allies, ALLY_FEATURE_COUNT),
                    dtype=np.float32,
                ),
                "targets": spaces.Box(
                    low=0.0,
                    high=1.0,
                    shape=(self.config.max_targets, TARGET_FEATURE_COUNT),
                    dtype=np.float32,
                ),
                "launch_eta": spaces.Box(
                    low=0.0,
                    high=1.0,
                    shape=(self.config.max_allies, self.config.max_targets),
                    dtype=np.float32,
                ),
                "impact_eta": spaces.Box(
                    low=0.0,
                    high=1.0,
                    shape=(self.config.max_allies, self.config.max_targets),
                    dtype=np.float32,
                ),
                "range_margin": spaces.Box(
                    low=0.0,
                    high=1.0,
                    shape=(self.config.max_allies, self.config.max_targets),
                    dtype=np.float32,
                ),
                "threat_exposure": spaces.Box(
                    low=0.0,
                    high=1.0,
                    shape=(self.config.max_allies, self.config.max_targets),
                    dtype=np.float32,
                ),
                "weapon_range_advantage": spaces.Box(
                    low=0.0,
                    high=1.0,
                    shape=(self.config.max_allies, self.config.max_targets),
                    dtype=np.float32,
                ),
                "ally_mask": spaces.Box(
                    low=0.0,
                    high=1.0,
                    shape=(self.config.max_allies,),
                    dtype=np.float32,
                ),
                "target_mask": spaces.Box(
                    low=0.0,
                    high=1.0,
                    shape=(self.config.max_targets,),
                    dtype=np.float32,
                ),
                "global": spaces.Box(
                    low=0.0,
                    high=1.0,
                    shape=(GLOBAL_FEATURE_COUNT,),
                    dtype=np.float32,
                ),
            }
        )
        self.action_space = spaces.Box(
            low=0.0,
            high=1.0,
            shape=(
                self.config.max_allies
                * (self.config.max_targets + ALLY_ACTION_CONTROL_COUNT),
            ),
            dtype=np.float32,
        )

        self._controllable_side_id = ""
        self._target_side_id = ""
        self._ally_catalog: list[str] = []
        self._target_catalog: list[str] = []
        self._initial_ally_weapon_totals: dict[str, int] = {}
        self._previous_ally_target_assignments: dict[str, str] = {}
        self._episode_step = 0
        self._episode_has_launch = False
        self._get_reward_callable()

    def reset(self, seed: int | None = None, options: dict | None = None):
        super().reset(seed=seed)
        self.game.reset()
        self._episode_step = 0

        scenario = self.game.current_scenario
        self._controllable_side_id = self._resolve_side_id(
            scenario,
            self.config.controllable_side_id,
            self.config.controllable_side_name,
            "controllable",
        )
        self._target_side_id = self._resolve_side_id(
            scenario,
            self.config.target_side_id,
            self.config.target_side_name,
            "target",
        )
        self._ally_catalog = [ally.id for ally in self._resolve_allies(scenario)]
        self._target_catalog = [target.id for target in self._resolve_targets(scenario)]
        self._initial_ally_weapon_totals = {
            ally.id: ally.get_total_weapon_quantity()
            for ally in self._resolve_allies(scenario)
        }
        self._previous_ally_target_assignments = {}
        self._episode_has_launch = False
        self._validate_target_margin_constraints()
        self._apply_controllable_doctrine()

        observation = self._build_observation()
        info = {
            "reward_breakdown": {},
            "done_reason": "reset",
            "done_reason_detail": "reset",
            "selected_target_id": None,
            "selected_target_ids": [],
            "selected_target_assignments": {},
            "launch_count": 0,
        }
        return observation, info

    def step(self, action: np.ndarray):
        if not self._ally_catalog or not self._target_catalog:
            raise RuntimeError("Environment must be reset before calling step()")

        action_array = np.asarray(action, dtype=np.float32)
        if action_array.shape != self.action_space.shape:
            raise ValueError(
                f"Expected action shape {self.action_space.shape}, got {action_array.shape}"
            )

        self._apply_controllable_doctrine()
        if self._should_apply_guided_launch_bootstrap():
            action_array = self._apply_guided_launch_bootstrap(action_array)

        scenario = self.game.current_scenario
        pre_alive_ally_ids = self._get_alive_ally_ids()
        pre_alive_target_ids = self._get_alive_target_ids()
        pre_target_health_fractions = self._get_target_health_fraction_snapshot(
            pre_alive_target_ids
        )

        launch_events, ally_target_selections = self._apply_actions(action_array)
        if len(launch_events) > 0:
            self._episode_has_launch = True

        _, _, _, engine_truncated, _ = self.game.step(action=[])

        post_alive_ally_ids = self._get_alive_ally_ids()
        post_alive_target_ids = self._get_alive_target_ids()
        post_target_health_fractions = self._get_target_health_fraction_snapshot(
            post_alive_target_ids
        )

        destroyed_target_ids = [
            target_id
            for target_id in pre_alive_target_ids
            if target_id not in post_alive_target_ids
        ]
        target_damage_fractions = {
            target_id: max(
                pre_target_health_fractions.get(target_id, 0.0)
                - post_target_health_fractions.get(target_id, 0.0),
                0.0,
            )
            for target_id in pre_alive_target_ids
        }
        target_damage_fractions = {
            target_id: damage_fraction
            for target_id, damage_fraction in target_damage_fractions.items()
            if damage_fraction > 0.0
        }
        lost_ally_ids = [
            ally_id for ally_id in pre_alive_ally_ids if ally_id not in post_alive_ally_ids
        ]

        threat_exposure_count = self._count_threat_exposure()
        success = len(post_alive_target_ids) == 0
        failure = not success and not self._has_attack_capability(post_alive_target_ids)
        self._episode_step += 1
        truncated = (
            not success
            and not failure
            and (engine_truncated or self._episode_step >= self.config.max_episode_steps)
        )
        terminated = success or failure
        done_reason = self._get_done_reason(success, failure, truncated)
        done_reason_detail = self._get_done_reason_detail(success, failure, truncated)
        selected_target_summary = self._summarize_target_selection(
            ally_target_selections, launch_events
        )
        selected_target_ids = [
            selection["target_id"] for selection in ally_target_selections
        ]
        selected_target_slots = [
            selection["target_slot"]
            for selection in ally_target_selections
            if selection["target_slot"] is not None
        ]
        ally_target_assignments = {
            selection["ally_id"]: selection["target_id"]
            for selection in ally_target_selections
        }
        ally_target_priority_vectors = {
            selection["ally_id"]: list(selection["target_priorities"])
            for selection in ally_target_selections
        }
        selected_assignment_metrics = self._build_selected_assignment_metrics(
            ally_target_selections,
            launch_events,
            destroyed_target_ids,
        )
        target_switch_count = self._count_target_switches(
            ally_target_assignments,
            pre_alive_target_ids,
        )

        observation = self._build_observation()
        step_context = StepContext(
            step_index=self._episode_step,
            current_time_s=scenario.current_time,
            config=self.config,
            scenario=scenario,
            observation=observation,
            selected_target_id=selected_target_summary["target_id"],
            selected_target_name=selected_target_summary["target_name"],
            selected_target_slot=selected_target_summary["target_slot"],
            target_priorities=self._aggregate_target_priorities(ally_target_selections),
            selected_target_ids=selected_target_ids,
            selected_target_slots=selected_target_slots,
            ally_target_assignments=ally_target_assignments,
            ally_target_priority_vectors=ally_target_priority_vectors,
            selected_launch_eta_before=selected_assignment_metrics["launch_eta_before"],
            selected_launch_eta_after=selected_assignment_metrics["launch_eta_after"],
            selected_ready_before_count=selected_assignment_metrics["ready_before_count"],
            selected_ready_after_count=selected_assignment_metrics["ready_after_count"],
            target_switch_count=target_switch_count,
            stagnation_count=selected_assignment_metrics["stagnation_count"],
            launch_events=launch_events,
            target_damage_fractions=target_damage_fractions,
            total_damage_fraction=float(sum(target_damage_fractions.values())),
            destroyed_target_ids=destroyed_target_ids,
            lost_ally_ids=lost_ally_ids,
            remaining_target_ids=post_alive_target_ids,
            remaining_ally_ids=post_alive_ally_ids,
            threat_exposure_count=threat_exposure_count,
            success=success,
            failure=failure,
            truncated=truncated,
            terminated=terminated,
            done_reason=done_reason,
        )
        reward, reward_breakdown = self._compute_reward(step_context)

        info = {
            "reward_breakdown": reward_breakdown,
            "done_reason": done_reason,
            "done_reason_detail": done_reason_detail,
            "selected_target_id": step_context.selected_target_id,
            "selected_target_ids": step_context.selected_target_ids,
            "selected_target_assignments": step_context.ally_target_assignments,
            "launch_count": len(launch_events),
            "observation_version": OBSERVATION_VERSION,
        }
        self._previous_ally_target_assignments = dict(ally_target_assignments)
        return observation, reward, terminated, truncated, info

    def _should_apply_guided_launch_bootstrap(self) -> bool:
        return (
            self.config.guided_launch_bootstrap_steps > 0
            and not self._episode_has_launch
            and self._episode_step < self.config.guided_launch_bootstrap_steps
        )

    def _apply_guided_launch_bootstrap(self, action: np.ndarray) -> np.ndarray:
        guided_action = np.array(action, dtype=np.float32, copy=True)
        ally_action_block_size = self.config.max_targets + ALLY_ACTION_CONTROL_COUNT

        for ally_index, ally_id in enumerate(self._ally_catalog):
            ally = self.game.current_scenario.get_aircraft(ally_id)
            if ally is None:
                continue

            target_slot, target = self._select_guided_bootstrap_target(ally)
            if target_slot is None or target is None:
                continue

            ally_action_start = ally_index * ally_action_block_size
            guided_action[
                ally_action_start : ally_action_start + self.config.max_targets
            ] = 0.0
            guided_action[ally_action_start + target_slot] = 1.0

            control_start = ally_action_start + self.config.max_targets
            can_fire = self._can_aircraft_fire_at_target(ally, target)
            guided_action[control_start] = 0.95 if can_fire else 0.5
            guided_action[control_start + 1] = 0.5
            guided_action[control_start + 2] = self._get_guided_bearing_scalar(
                ally, target
            )

        return guided_action

    def _select_guided_bootstrap_target(
        self, ally: Aircraft
    ) -> tuple[int | None, FixedTarget | None]:
        best_slot: int | None = None
        best_target: FixedTarget | None = None
        best_key: tuple[float, float, int] | None = None

        for target_slot, target_id in enumerate(self._target_catalog):
            target = self.game.current_scenario.get_target(target_id)
            if not isinstance(target, (Facility, Airbase, Ship)):
                continue

            can_fire_score = 0.0 if self._can_aircraft_fire_at_target(ally, target) else 1.0
            launch_eta = float(self._estimate_launch_eta_seconds(ally, target))
            distance_nm = float(self._distance_units_nm(ally, target))
            key = (can_fire_score, launch_eta, distance_nm)
            if best_key is None or key < best_key:
                best_key = key
                best_slot = target_slot
                best_target = target

        return best_slot, best_target

    def _get_guided_bearing_scalar(self, ally: Aircraft, target: FixedTarget) -> float:
        bearing_deg = get_bearing_between_two_points(
            target.latitude,
            target.longitude,
            ally.latitude,
            ally.longitude,
        )
        return float(np.clip(bearing_deg / 360.0, 0.0, 1.0))

    def _resolve_side_id(
        self,
        scenario: Scenario,
        side_id: str | None,
        side_name: str | None,
        label: str,
    ) -> str:
        if side_id is not None:
            side = scenario.get_side(side_id)
            if side is None:
                raise ValueError(f"Unknown {label} side id: {side_id}")
            return side.id

        for side in scenario.sides:
            if side.name == side_name:
                return side.id

        raise ValueError(f"Unknown {label} side name: {side_name}")

    def _resolve_allies(self, scenario: Scenario) -> list[Aircraft]:
        allies = [
            aircraft
            for aircraft in scenario.aircraft
            if aircraft.side_id == self._controllable_side_id
        ]
        if self.config.ally_ids is not None:
            ally_map = {ally.id: ally for ally in allies}
            missing_ids = [
                ally_id for ally_id in self.config.ally_ids if ally_id not in ally_map
            ]
            if missing_ids:
                raise ValueError(f"Unknown ally ids: {missing_ids}")
            allies = [ally_map[ally_id] for ally_id in self.config.ally_ids]

        if len(allies) == 0:
            raise ValueError("No controllable allies found in the scenario")
        if len(allies) > self.config.max_allies:
            raise ValueError(
                f"Found {len(allies)} allies but max_allies is {self.config.max_allies}"
            )
        return allies

    def _resolve_targets(self, scenario: Scenario) -> list[FixedTarget]:
        targets: list[FixedTarget] = []
        for facility in scenario.facilities:
            if facility.side_id == self._target_side_id:
                targets.append(facility)
        for airbase in scenario.airbases:
            if airbase.side_id == self._target_side_id:
                targets.append(airbase)
        for ship in scenario.ships:
            if ship.side_id == self._target_side_id and self._is_stationary_ship(ship):
                targets.append(ship)

        if self.config.target_ids is not None:
            target_map = {target.id: target for target in targets}
            missing_ids = [
                target_id for target_id in self.config.target_ids if target_id not in target_map
            ]
            if missing_ids:
                raise ValueError(f"Unknown or unsupported target ids: {missing_ids}")
            targets = [target_map[target_id] for target_id in self.config.target_ids]

        if len(targets) == 0:
            raise ValueError("No hostile fixed targets found in the scenario")
        if len(targets) > self.config.max_targets:
            raise ValueError(
                f"Found {len(targets)} targets but max_targets is {self.config.max_targets}"
            )
        return targets

    def _apply_controllable_doctrine(self) -> None:
        self.game.current_scenario.update_side_doctrine(
            self._controllable_side_id,
            {
                DoctrineType.AIRCRAFT_ATTACK_HOSTILE: False,
                DoctrineType.AIRCRAFT_CHASE_HOSTILE: False,
            },
        )

    def _build_observation(self) -> dict[str, np.ndarray]:
        allies = np.zeros(
            (self.config.max_allies, ALLY_FEATURE_COUNT), dtype=np.float32
        )
        targets = np.zeros(
            (self.config.max_targets, TARGET_FEATURE_COUNT), dtype=np.float32
        )
        launch_eta = np.zeros(
            (self.config.max_allies, self.config.max_targets), dtype=np.float32
        )
        impact_eta = np.zeros(
            (self.config.max_allies, self.config.max_targets), dtype=np.float32
        )
        range_margin = np.zeros(
            (self.config.max_allies, self.config.max_targets), dtype=np.float32
        )
        threat_exposure = np.zeros(
            (self.config.max_allies, self.config.max_targets), dtype=np.float32
        )
        weapon_range_advantage = np.zeros(
            (self.config.max_allies, self.config.max_targets), dtype=np.float32
        )
        ally_mask = np.zeros((self.config.max_allies,), dtype=np.float32)
        target_mask = np.zeros((self.config.max_targets,), dtype=np.float32)

        active_allies = self._get_alive_allies()
        active_targets = self._get_alive_targets()
        target_centroid = self._get_target_centroid(active_targets)
        ally_centroid = self._get_ally_centroid(active_allies)

        for index, ally_id in enumerate(self._ally_catalog):
            ally = self.game.current_scenario.get_aircraft(ally_id)
            if ally is None:
                continue
            ally_mask[index] = 1.0
            weapon = self._get_best_weapon(ally)
            any_in_range = (
                weapon is not None
                and any(
                    self._can_aircraft_fire_at_target(ally, target)
                    for target in active_targets
                )
            )
            distance_to_centroid_nm = self._distance_nm(
                ally.latitude,
                ally.longitude,
                target_centroid[0],
                target_centroid[1],
            )
            bearing_to_centroid = get_bearing_between_two_points(
                ally.latitude,
                ally.longitude,
                target_centroid[0],
                target_centroid[1],
            )
            initial_weapon_total = max(
                1,
                self._initial_ally_weapon_totals.get(
                    ally.id, ally.get_total_weapon_quantity() or 1
                ),
            )
            best_launch_eta_seconds = (
                min(self._estimate_launch_eta_seconds(ally, target) for target in active_targets)
                if active_targets
                else self.config.eta_clip_seconds
            )
            allies[index] = np.asarray(
                [
                    self._normalize_latitude(ally.latitude),
                    self._normalize_longitude(ally.longitude),
                    self._normalize_heading(ally.heading),
                    self._normalize_fraction(ally.current_fuel, ally.max_fuel),
                    ally.get_health_fraction(),
                    self._normalize_fraction(
                        ally.get_total_weapon_quantity(), initial_weapon_total
                    ),
                    self._normalize_distance_nm(distance_to_centroid_nm),
                    self._normalize_heading(bearing_to_centroid),
                    float(any_in_range),
                    self._normalize_eta_seconds(best_launch_eta_seconds),
                    self._get_ally_threat_exposure_intensity(ally),
                ],
                dtype=np.float32,
            )

        for target_index, target_id in enumerate(self._target_catalog):
            target = self.game.current_scenario.get_target(target_id)
            if target is None:
                continue
            target_mask[target_index] = 1.0
            closest_ally_distance_nm = (
                min(self._distance_units_nm(ally, target) for ally in active_allies)
                if active_allies
                else self.config.normalize_margin_nm
            )
            closest_launch_eta_seconds = (
                min(self._estimate_launch_eta_seconds(ally, target) for ally in active_allies)
                if active_allies
                else self.config.eta_clip_seconds
            )
            in_range_ally_fraction = (
                sum(
                    int(self._can_aircraft_fire_at_target(ally, target))
                    for ally in active_allies
                )
                / max(len(active_allies), 1)
                if active_allies
                else 0.0
            )
            bearing_from_ally_centroid = get_bearing_between_two_points(
                ally_centroid[0],
                ally_centroid[1],
                target.latitude,
                target.longitude,
            )
            targets[target_index] = np.asarray(
                [
                    self._normalize_latitude(target.latitude),
                    self._normalize_longitude(target.longitude),
                    self._normalize_target_type(target),
                    self._normalize_distance_nm(self._get_target_threat_radius_nm(target)),
                    target.get_health_fraction(),
                    self._normalize_defense(target.defense),
                    self._normalize_distance_nm(closest_ally_distance_nm),
                    self._normalize_eta_seconds(closest_launch_eta_seconds),
                    self._normalize_heading(bearing_from_ally_centroid),
                    float(np.clip(in_range_ally_fraction, 0.0, 1.0)),
                ],
                dtype=np.float32,
            )

        for ally_index, ally_id in enumerate(self._ally_catalog):
            ally = self.game.current_scenario.get_aircraft(ally_id)
            if ally is None:
                continue
            for target_index, target_id in enumerate(self._target_catalog):
                target = self.game.current_scenario.get_target(target_id)
                if target is None:
                    continue
                weapon = self._get_best_weapon(ally)
                distance_nm = self._distance_units_nm(ally, target)
                launch_radius_nm = (
                    min(ally.get_detection_range(), weapon.get_engagement_range())
                    if weapon is not None
                    else 0.0
                )
                target_threat_radius_nm = self._get_target_threat_radius_nm(target)
                launch_eta[ally_index, target_index] = self._normalize_eta_seconds(
                    self._estimate_launch_eta_seconds(ally, target)
                )
                impact_eta[ally_index, target_index] = self._normalize_eta_seconds(
                    self._estimate_impact_eta_seconds(ally, target)
                )
                range_margin[ally_index, target_index] = self._normalize_signed_margin_nm(
                    launch_radius_nm - distance_nm
                )
                threat_exposure[ally_index, target_index] = (
                    self._compute_threat_exposure_intensity(distance_nm, target_threat_radius_nm)
                )
                weapon_range_advantage[ally_index, target_index] = (
                    self._normalize_signed_margin_nm(
                        (weapon.get_engagement_range() if weapon is not None else 0.0)
                        - target_threat_radius_nm
                    )
                )

        current_friendly_weapons = len(
            [
                weapon
                for weapon in self.game.current_scenario.weapons
                if weapon.side_id == self._controllable_side_id
            ]
        )
        current_threat_exposure = self._get_mean_ally_threat_exposure(active_allies)
        valid_launch_etas = launch_eta[
            np.outer(ally_mask.astype(bool), target_mask.astype(bool))
        ]
        mean_launch_eta = (
            float(valid_launch_etas.mean()) if valid_launch_etas.size > 0 else 0.0
        )
        in_range_pair_fraction = (
            float(np.count_nonzero(valid_launch_etas <= 0.0) / valid_launch_etas.size)
            if valid_launch_etas.size > 0
            else 0.0
        )
        best_launch_eta = (
            float(valid_launch_etas.min()) if valid_launch_etas.size > 0 else 0.0
        )

        global_features = np.asarray(
            [
                self._normalize_fraction(self._episode_step, self.config.max_episode_steps),
                self._normalize_fraction(len(active_allies), len(self._ally_catalog)),
                self._normalize_fraction(len(active_targets), len(self._target_catalog)),
                self._normalize_fraction(current_friendly_weapons, self.config.max_allies),
                float(mean_launch_eta),
                float(np.clip(current_threat_exposure, 0.0, 1.0)),
                float(np.clip(in_range_pair_fraction, 0.0, 1.0)),
                float(np.clip(best_launch_eta, 0.0, 1.0)),
            ],
            dtype=np.float32,
        )

        observation = {
            "allies": allies,
            "targets": targets,
            "launch_eta": launch_eta,
            "impact_eta": impact_eta,
            "range_margin": range_margin,
            "threat_exposure": threat_exposure,
            "weapon_range_advantage": weapon_range_advantage,
            "ally_mask": ally_mask,
            "target_mask": target_mask,
            "global": global_features,
        }

        if not self.observation_space.contains(observation):
            raise ValueError("Generated observation does not match observation_space")

        return observation

    def _select_target(
        self, priority_vector: np.ndarray
    ) -> tuple[int | None, FixedTarget | None]:
        best_slot: int | None = None
        best_priority = -1.0
        for index, target_id in enumerate(self._target_catalog):
            target = self.game.current_scenario.get_target(target_id)
            if target is None:
                continue
            priority = float(priority_vector[index])
            if priority > best_priority:
                best_priority = priority
                best_slot = index

        if best_slot is None:
            return None, None

        target = self.game.current_scenario.get_target(self._target_catalog[best_slot])
        if not isinstance(target, (Facility, Airbase, Ship)):
            return None, None
        return best_slot, target

    def _apply_actions(
        self, action: np.ndarray
    ) -> tuple[list[LaunchEvent], list[dict[str, Any]]]:
        launch_events: list[LaunchEvent] = []
        ally_target_selections: list[dict[str, Any]] = []
        ally_action_block_size = self.config.max_targets + ALLY_ACTION_CONTROL_COUNT

        for ally_index, ally_id in enumerate(self._ally_catalog):
            ally = self.game.current_scenario.get_aircraft(ally_id)
            if ally is None:
                continue

            ally_action_start = ally_index * ally_action_block_size
            priority_vector = action[
                ally_action_start : ally_action_start + self.config.max_targets
            ]
            selected_target_slot, selected_target = self._select_target(priority_vector)
            if selected_target is not None:
                ally_target_selections.append(
                    {
                        "ally_id": ally.id,
                        "target_id": selected_target.id,
                        "target_name": selected_target.name,
                        "target_slot": selected_target_slot,
                        "target_priorities": priority_vector.tolist(),
                        "pre_can_fire": self._can_aircraft_fire_at_target(ally, selected_target),
                        "pre_launch_eta_seconds": self._estimate_launch_eta_seconds(
                            ally, selected_target
                        ),
                    }
                )

            control_start = ally_action_start + self.config.max_targets
            mode_scalar = float(action[control_start])
            radius_scalar = float(action[control_start + 1])
            bearing_scalar = float(action[control_start + 2])

            if mode_scalar < MODE_HOLD_THRESHOLD:
                self.game.move_aircraft(ally.id, [])
                continue

            if selected_target is None:
                continue

            if mode_scalar < MODE_REPOSITION_THRESHOLD:
                self._command_reposition(ally, selected_target, radius_scalar, bearing_scalar)
                continue

            ally_launch_events = self._try_fire(ally, selected_target)
            if len(ally_launch_events) > 0:
                launch_events.extend(ally_launch_events)
                continue

            self._command_reposition(ally, selected_target, radius_scalar, bearing_scalar)

        return launch_events, ally_target_selections

    def _aggregate_target_priorities(
        self, ally_target_selections: list[dict[str, Any]]
    ) -> list[float]:
        if len(ally_target_selections) == 0:
            return [0.0] * self.config.max_targets

        accumulated = np.zeros((self.config.max_targets,), dtype=np.float32)
        for selection in ally_target_selections:
            priority_vector = np.asarray(selection["target_priorities"], dtype=np.float32)
            accumulated += priority_vector
        return (accumulated / max(len(ally_target_selections), 1)).tolist()

    def _summarize_target_selection(
        self,
        ally_target_selections: list[dict[str, Any]],
        launch_events: list[LaunchEvent],
    ) -> dict[str, str | int | None]:
        candidate_ids: list[str] = [event.target_id for event in launch_events]
        if len(candidate_ids) == 0:
            candidate_ids = [
                selection["target_id"] for selection in ally_target_selections
            ]
        if len(candidate_ids) == 0:
            return {
                "target_id": None,
                "target_name": None,
                "target_slot": None,
            }

        target_counts: dict[str, int] = {}
        for target_id in candidate_ids:
            target_counts[target_id] = target_counts.get(target_id, 0) + 1
        selected_target_id = max(
            target_counts,
            key=lambda target_id: (target_counts[target_id], -candidate_ids.index(target_id)),
        )

        selection = next(
            (
                candidate
                for candidate in ally_target_selections
                if candidate["target_id"] == selected_target_id
            ),
            None,
        )
        target = self.game.current_scenario.get_target(selected_target_id)
        target_name = (
            selection["target_name"]
            if selection is not None
            else target.name
            if target is not None
            else None
        )
        target_slot = (
            selection["target_slot"]
            if selection is not None
            else self._target_catalog.index(selected_target_id)
            if selected_target_id in self._target_catalog
            else None
        )
        return {
            "target_id": selected_target_id,
            "target_name": target_name,
            "target_slot": target_slot,
        }

    def _try_fire(self, ally: Aircraft, target: FixedTarget) -> list[LaunchEvent]:
        weapon = self._get_best_weapon(ally)
        if weapon is None or not self._can_aircraft_fire_at_target(ally, target):
            return []

        pre_weapon_ids = {existing_weapon.id for existing_weapon in self.game.current_scenario.weapons}
        launch_time_s = self.game.current_scenario.current_time
        self.game.handle_aircraft_attack(ally.id, target.id, weapon.id, 1)
        spawned_weapons = [
            spawned_weapon
            for spawned_weapon in self.game.current_scenario.weapons
            if spawned_weapon.id not in pre_weapon_ids and spawned_weapon.side_id == ally.side_id
        ]
        if len(spawned_weapons) == 0:
            return []

        launch_events: list[LaunchEvent] = []
        for spawned_weapon in spawned_weapons:
            actual_target = self.game.current_scenario.get_target(spawned_weapon.target_id)
            if actual_target is None:
                actual_target = target

            estimated_impact_time_s = self._estimate_spawned_weapon_impact_time_seconds(
                spawned_weapon, actual_target, launch_time_s
            )
            launch_events.append(
                LaunchEvent(
                    aircraft_id=ally.id,
                    aircraft_name=ally.name,
                    target_id=actual_target.id,
                    target_name=actual_target.name,
                    weapon_id=spawned_weapon.id,
                    weapon_name=spawned_weapon.name,
                    launch_time_s=launch_time_s,
                    launch_distance_nm=self._distance_units_nm(ally, actual_target),
                    weapon_speed_kts=spawned_weapon.speed,
                    estimated_impact_time_s=estimated_impact_time_s,
                )
            )

        return launch_events

    def _command_reposition(
        self,
        ally: Aircraft,
        target: FixedTarget,
        radius_scalar: float,
        bearing_scalar: float,
    ) -> None:
        desired_radius_nm = self._get_desired_reposition_radius_nm(
            ally, target, radius_scalar
        )
        bearing = float(np.clip(bearing_scalar, 0.0, 1.0) * 360.0)
        waypoint = get_terminal_coordinates_from_distance_and_bearing(
            target.latitude,
            target.longitude,
            (desired_radius_nm * NAUTICAL_MILES_TO_METERS) / 1000.0,
            bearing,
        )
        self.game.move_aircraft(ally.id, [[waypoint[0], waypoint[1]]])

    def _get_desired_reposition_radius_nm(
        self, ally: Aircraft, target: FixedTarget, radius_scalar: float
    ) -> float:
        clipped_scalar = float(np.clip(radius_scalar, 0.0, 1.0))
        lower_bound_nm = max(1.0, self.config.threat_buffer_nm)
        desired_radius_nm = lower_bound_nm + (
            clipped_scalar * max(self.config.normalize_margin_nm - lower_bound_nm, 0.0)
        )

        weapon = self._get_best_weapon(ally)
        if weapon is not None:
            desired_radius_nm = min(
                desired_radius_nm,
                max(lower_bound_nm, weapon.get_engagement_range() * 0.95),
            )

        threat_floor_nm = self._get_target_threat_radius_nm(target) + self.config.threat_buffer_nm
        desired_radius_nm = max(desired_radius_nm, threat_floor_nm)
        return min(desired_radius_nm, self.config.normalize_margin_nm)

    def _estimate_launch_eta_seconds(self, ally: Aircraft, target: FixedTarget) -> float:
        weapon = self._get_best_weapon(ally)
        if weapon is None or ally.speed <= 0:
            return self.config.eta_clip_seconds

        distance_nm = self._distance_units_nm(ally, target)
        launch_radius_nm = min(ally.get_detection_range(), weapon.get_engagement_range())
        if distance_nm <= launch_radius_nm:
            return 0.0
        return min(
            self.config.eta_clip_seconds,
            ((distance_nm - launch_radius_nm) / ally.speed) * 3600.0,
        )

    def _estimate_impact_eta_seconds(self, ally: Aircraft, target: FixedTarget) -> float:
        weapon = self._get_best_weapon(ally)
        if weapon is None or weapon.speed <= 0:
            return self.config.eta_clip_seconds

        launch_eta_seconds = self._estimate_launch_eta_seconds(ally, target)
        distance_nm = self._distance_units_nm(ally, target)
        flight_distance_nm = min(distance_nm, weapon.get_engagement_range())
        flight_eta_seconds = (flight_distance_nm / weapon.speed) * 3600.0
        return min(
            self.config.eta_clip_seconds, launch_eta_seconds + flight_eta_seconds
        )

    def _estimate_spawned_weapon_impact_time_seconds(
        self,
        spawned_weapon: Weapon,
        target: FixedTarget,
        launch_time_s: int,
    ) -> float:
        if spawned_weapon.speed <= 0:
            return float(launch_time_s)

        remaining_distance_nm = self._distance_units_nm(spawned_weapon, target)
        return float(launch_time_s) + 1.0 + (
            (remaining_distance_nm / spawned_weapon.speed) * 3600.0
        )

    def _build_selected_assignment_metrics(
        self,
        ally_target_selections: list[dict[str, Any]],
        launch_events: list[LaunchEvent],
        destroyed_target_ids: list[str],
    ) -> dict[str, Any]:
        launch_targets_by_ally: dict[str, set[str]] = {}
        for launch_event in launch_events:
            launch_targets_by_ally.setdefault(launch_event.aircraft_id, set()).add(
                launch_event.target_id
            )

        destroyed_target_id_set = set(destroyed_target_ids)
        launch_eta_before: dict[str, float] = {}
        launch_eta_after: dict[str, float] = {}
        ready_before_count = 0
        ready_after_count = 0
        stagnation_count = 0

        for selection in ally_target_selections:
            ally_id = str(selection["ally_id"])
            target_id = str(selection["target_id"])
            before_eta_seconds = float(
                selection.get("pre_launch_eta_seconds", self.config.eta_clip_seconds)
            )
            launch_eta_before[ally_id] = before_eta_seconds
            ready_before = bool(selection.get("pre_can_fire", False))
            ready_before_count += int(ready_before)

            launched_on_selected_target = target_id in launch_targets_by_ally.get(ally_id, set())
            if launched_on_selected_target or target_id in destroyed_target_id_set:
                launch_eta_after[ally_id] = 0.0
                ready_after_count += 1
                continue

            ally = self.game.current_scenario.get_aircraft(ally_id)
            target = self.game.current_scenario.get_target(target_id)
            if ally is None or target is None:
                launch_eta_after[ally_id] = float(self.config.eta_clip_seconds)
                continue

            after_eta_seconds = float(self._estimate_launch_eta_seconds(ally, target))
            launch_eta_after[ally_id] = after_eta_seconds
            ready_after = self._can_aircraft_fire_at_target(ally, target)
            ready_after_count += int(ready_after)
            if after_eta_seconds >= before_eta_seconds - 1e-6 and not ready_after:
                stagnation_count += 1

        return {
            "launch_eta_before": launch_eta_before,
            "launch_eta_after": launch_eta_after,
            "ready_before_count": ready_before_count,
            "ready_after_count": ready_after_count,
            "stagnation_count": stagnation_count,
        }

    def _get_best_weapon(self, ally: Aircraft) -> Weapon | None:
        valid_weapons = [weapon for weapon in ally.weapons if weapon.current_quantity > 0]
        if len(valid_weapons) == 0:
            return None
        return max(valid_weapons, key=lambda weapon: weapon.get_engagement_range())

    def _can_aircraft_fire_at_target(self, ally: Aircraft, target: FixedTarget) -> bool:
        weapon = self._get_best_weapon(ally)
        if weapon is None:
            return False
        distance_nm = self._distance_units_nm(ally, target)
        max_launch_radius_nm = min(ally.get_detection_range(), weapon.get_engagement_range())
        return distance_nm <= max_launch_radius_nm

    def _get_target_threat_radius_nm(self, target: FixedTarget) -> float:
        if isinstance(target, Airbase):
            return 0.0

        threat_radius_nm = target.get_detection_range()
        weapon = target.get_weapon_with_highest_engagement_range()
        if weapon is not None:
            threat_radius_nm = max(threat_radius_nm, weapon.get_engagement_range())
        return threat_radius_nm

    def _validate_target_margin_constraints(self) -> None:
        if len(self._target_catalog) == 0:
            return

        required_margin_nm = max(
            self._get_target_threat_radius_nm(target) + self.config.threat_buffer_nm
            for target in self._get_alive_targets()
        )
        if required_margin_nm > self.config.normalize_margin_nm:
            raise ValueError(
                "normalize_margin_nm must cover the largest target threat radius plus "
                f"threat_buffer_nm. Required at least {required_margin_nm:.2f} nm, "
                f"got {self.config.normalize_margin_nm:.2f} nm."
            )

    def _count_threat_exposure(self) -> int:
        exposure_count = 0
        hostile_detectors = self._get_hostile_detectors()
        for ally in self._get_alive_allies():
            for detector in hostile_detectors:
                detector_threat_radius_nm = self._get_detector_threat_radius_nm(detector)
                if detector_threat_radius_nm <= 0:
                    continue
                if (
                    self._distance_units_nm(ally, detector)
                    <= detector_threat_radius_nm + self.config.threat_buffer_nm
                ):
                    exposure_count += 1
        return exposure_count

    def _is_ally_inside_threat_zone(self, ally: Aircraft) -> bool:
        return self._get_ally_threat_exposure_intensity(ally) > 0.0

    def _get_ally_threat_exposure_intensity(self, ally: Aircraft) -> float:
        hostile_detectors = self._get_hostile_detectors()
        if len(hostile_detectors) == 0:
            return 0.0
        return max(
            self._compute_threat_exposure_intensity(
                self._distance_units_nm(ally, detector),
                self._get_detector_threat_radius_nm(detector),
            )
            for detector in hostile_detectors
        )

    def _get_mean_ally_threat_exposure(self, allies: list[Aircraft]) -> float:
        if len(allies) == 0:
            return 0.0
        return float(
            np.mean([self._get_ally_threat_exposure_intensity(ally) for ally in allies])
        )

    def _compute_threat_exposure_intensity(
        self, distance_nm: float, threat_radius_nm: float
    ) -> float:
        if threat_radius_nm <= 0:
            return 0.0
        effective_radius_nm = max(threat_radius_nm + self.config.threat_buffer_nm, 1e-6)
        return float(np.clip((effective_radius_nm - distance_nm) / effective_radius_nm, 0.0, 1.0))

    def _count_target_switches(
        self,
        ally_target_assignments: dict[str, str],
        previous_alive_target_ids: list[str],
    ) -> int:
        previous_alive_target_id_set = set(previous_alive_target_ids)
        target_switch_count = 0
        for ally_id, target_id in ally_target_assignments.items():
            previous_target_id = self._previous_ally_target_assignments.get(ally_id)
            if (
                previous_target_id is not None
                and previous_target_id != target_id
                and previous_target_id in previous_alive_target_id_set
            ):
                target_switch_count += 1
        return target_switch_count

    def _get_hostile_detectors(self) -> list[Aircraft | Facility | Ship]:
        scenario = self.game.current_scenario
        hostile_units: list[Aircraft | Facility | Ship] = []
        hostile_units.extend(
            aircraft
            for aircraft in scenario.aircraft
            if aircraft.side_id == self._target_side_id
        )
        hostile_units.extend(
            facility
            for facility in scenario.facilities
            if facility.side_id == self._target_side_id
        )
        hostile_units.extend(
            ship for ship in scenario.ships if ship.side_id == self._target_side_id
        )
        return hostile_units

    def _get_detector_threat_radius_nm(
        self, detector: Aircraft | Facility | Ship
    ) -> float:
        threat_radius_nm = detector.get_detection_range()
        weapon = detector.get_weapon_with_highest_engagement_range()
        if weapon is not None:
            threat_radius_nm = max(threat_radius_nm, weapon.get_engagement_range())
        return threat_radius_nm

    def _has_attack_capability(self, alive_target_ids: list[str]) -> bool:
        for ally in self._get_alive_allies():
            if self._get_best_weapon(ally) is not None:
                return True

        for weapon in self.game.current_scenario.weapons:
            if (
                weapon.side_id == self._controllable_side_id
                and weapon.target_id in alive_target_ids
            ):
                return True

        return False

    def _get_done_reason(
        self, success: bool, failure: bool, truncated: bool
    ) -> str:
        if success:
            return "success"
        if failure:
            return "failure"
        if truncated:
            return "truncated"
        return "in_progress"

    def _get_done_reason_detail(
        self, success: bool, failure: bool, truncated: bool
    ) -> str:
        if success:
            return "all_targets_destroyed"
        if failure:
            if len(self._get_alive_allies()) == 0:
                return "all_allies_lost"
            return "no_attack_capability"
        if truncated:
            return "max_episode_steps"
        return "in_progress"

    def _get_target_health_fraction_snapshot(
        self, target_ids: list[str] | None = None
    ) -> dict[str, float]:
        snapshot: dict[str, float] = {}
        candidate_ids = target_ids if target_ids is not None else self._target_catalog
        for target_id in candidate_ids:
            target = self.game.current_scenario.get_target(target_id)
            if isinstance(target, (Facility, Airbase, Ship)):
                snapshot[target_id] = float(target.get_health_fraction())
        return snapshot

    def _get_alive_allies(self) -> list[Aircraft]:
        allies: list[Aircraft] = []
        for ally_id in self._ally_catalog:
            ally = self.game.current_scenario.get_aircraft(ally_id)
            if ally is not None:
                allies.append(ally)
        return allies

    def _get_alive_targets(self) -> list[FixedTarget]:
        targets: list[FixedTarget] = []
        for target_id in self._target_catalog:
            target = self.game.current_scenario.get_target(target_id)
            if isinstance(target, (Facility, Airbase, Ship)):
                targets.append(target)
        return targets

    def _get_alive_ally_ids(self) -> list[str]:
        return [ally.id for ally in self._get_alive_allies()]

    def _get_alive_target_ids(self) -> list[str]:
        return [target.id for target in self._get_alive_targets()]

    def _get_target_centroid(self, targets: list[FixedTarget]) -> tuple[float, float]:
        if len(targets) == 0:
            return (0.0, 0.0)
        return (
            sum(target.latitude for target in targets) / len(targets),
            sum(target.longitude for target in targets) / len(targets),
        )

    def _get_ally_centroid(self, allies: list[Aircraft]) -> tuple[float, float]:
        if len(allies) == 0:
            return (0.0, 0.0)
        return (
            sum(ally.latitude for ally in allies) / len(allies),
            sum(ally.longitude for ally in allies) / len(allies),
        )

    def _compute_reward(self, step_context: StepContext) -> tuple[float, dict[str, Any]]:
        reward_callable = self._get_reward_callable()
        result = reward_callable(step_context, self.config)

        if isinstance(result, tuple):
            reward = float(result[0])
            breakdown = result[1] if len(result) > 1 and isinstance(result[1], dict) else {}
            return reward, breakdown

        if isinstance(result, dict):
            reward = float(result.get("reward", 0.0))
            breakdown = result.get("breakdown", result.get("reward_breakdown", {}))
            if not isinstance(breakdown, dict):
                breakdown = {}
            return reward, breakdown

        raise TypeError(
            "blade.envs.fixed_target_strike_reward.compute_reward must return "
            "(reward, breakdown) or a mapping with reward metadata"
        )

    def _get_reward_callable(self) -> Callable[..., Any]:
        if self._reward_callable is not None:
            return self._reward_callable

        try:
            reward_module = importlib.import_module("blade.envs.fixed_target_strike_reward")
        except ModuleNotFoundError as exc:
            raise RuntimeError(
                "FixedTargetStrikeEnv requires blade.envs.fixed_target_strike_reward "
                "with a compute_reward(step_context, config) function."
            ) from exc

        candidate = getattr(reward_module, "compute_reward", None)
        if not callable(candidate):
            raise RuntimeError(
                "blade.envs.fixed_target_strike_reward.compute_reward is required."
            )

        self._reward_callable = candidate
        return candidate

    def _normalize_latitude(self, latitude: float) -> float:
        return float(np.clip((latitude + 90.0) / 180.0, 0.0, 1.0))

    def _normalize_longitude(self, longitude: float) -> float:
        return float(np.clip((longitude + 180.0) / 360.0, 0.0, 1.0))

    def _normalize_heading(self, heading: float) -> float:
        return float(np.clip((heading % 360.0) / 360.0, 0.0, 1.0))

    def _normalize_fraction(self, numerator: float, denominator: float) -> float:
        if denominator <= 0:
            return 0.0
        return float(np.clip(numerator / denominator, 0.0, 1.0))

    def _normalize_defense(self, defense: float) -> float:
        return float(np.clip(defense / 100.0, 0.0, 1.0))

    def _normalize_distance_nm(self, distance_nm: float) -> float:
        return float(
            np.clip(distance_nm / self.config.normalize_margin_nm, 0.0, 1.0)
        )

    def _normalize_eta_seconds(self, eta_seconds: float) -> float:
        return float(np.clip(eta_seconds / self.config.eta_clip_seconds, 0.0, 1.0))

    def _normalize_signed_margin_nm(self, margin_nm: float) -> float:
        return float(
            np.clip((margin_nm / self.config.normalize_margin_nm) * 0.5 + 0.5, 0.0, 1.0)
        )

    def _normalize_target_type(self, target: FixedTarget) -> float:
        if isinstance(target, Facility):
            return 0.0
        if isinstance(target, Airbase):
            return 0.5
        return 1.0

    def _distance_nm(self, lat_a: float, lon_a: float, lat_b: float, lon_b: float) -> float:
        return (
            get_distance_between_two_points(lat_a, lon_a, lat_b, lon_b) * 1000.0
        ) / NAUTICAL_MILES_TO_METERS

    def _distance_units_nm(
        self, unit_a: Aircraft | FixedTarget, unit_b: Aircraft | FixedTarget
    ) -> float:
        return self._distance_nm(
            unit_a.latitude,
            unit_a.longitude,
            unit_b.latitude,
            unit_b.longitude,
        )

    def _is_stationary_ship(self, ship: Ship) -> bool:
        return ship.speed == 0
