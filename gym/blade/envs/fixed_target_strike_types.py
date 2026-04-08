from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from blade.Scenario import Scenario


@dataclass(slots=True)
class FixedTargetStrikeConfig:
    max_allies: int
    max_targets: int
    max_episode_steps: int
    normalize_margin_nm: float
    eta_clip_seconds: float
    threat_buffer_nm: float
    reward_config: Any = None
    controllable_side_id: str | None = None
    controllable_side_name: str | None = None
    target_side_id: str | None = None
    target_side_name: str | None = None
    target_ids: list[str] | None = None
    ally_ids: list[str] | None = None

    def __post_init__(self) -> None:
        if self.max_allies <= 0:
            raise ValueError("max_allies must be positive")
        if self.max_targets <= 0:
            raise ValueError("max_targets must be positive")
        if self.max_episode_steps <= 0:
            raise ValueError("max_episode_steps must be positive")
        if self.normalize_margin_nm <= 0:
            raise ValueError("normalize_margin_nm must be positive")
        if self.eta_clip_seconds <= 0:
            raise ValueError("eta_clip_seconds must be positive")
        if self.threat_buffer_nm < 0:
            raise ValueError("threat_buffer_nm cannot be negative")
        if self.controllable_side_id is None and self.controllable_side_name is None:
            raise ValueError(
                "Either controllable_side_id or controllable_side_name is required"
            )
        if self.target_side_id is None and self.target_side_name is None:
            raise ValueError("Either target_side_id or target_side_name is required")

        if self.target_ids is not None:
            self.target_ids = list(self.target_ids)
        if self.ally_ids is not None:
            self.ally_ids = list(self.ally_ids)


@dataclass(slots=True)
class LaunchEvent:
    aircraft_id: str
    aircraft_name: str
    target_id: str
    target_name: str
    weapon_id: str
    weapon_name: str
    launch_time_s: int
    launch_distance_nm: float
    weapon_speed_kts: float
    weapon_quantity: int = 1
    estimated_impact_time_s: float | None = None


@dataclass(slots=True)
class StepContext:
    step_index: int
    current_time_s: int
    config: FixedTargetStrikeConfig
    scenario: Scenario
    observation: dict[str, Any]
    selected_target_id: str | None = None
    selected_target_name: str | None = None
    selected_target_slot: int | None = None
    target_priorities: list[float] = field(default_factory=list)
    selected_target_ids: list[str] = field(default_factory=list)
    selected_target_slots: list[int] = field(default_factory=list)
    ally_target_assignments: dict[str, str] = field(default_factory=dict)
    ally_target_priority_vectors: dict[str, list[float]] = field(default_factory=dict)
    launch_events: list[LaunchEvent] = field(default_factory=list)
    destroyed_target_ids: list[str] = field(default_factory=list)
    lost_ally_ids: list[str] = field(default_factory=list)
    remaining_target_ids: list[str] = field(default_factory=list)
    remaining_ally_ids: list[str] = field(default_factory=list)
    threat_exposure_count: int = 0
    success: bool = False
    failure: bool = False
    truncated: bool = False
    terminated: bool = False
    done_reason: str | None = None
