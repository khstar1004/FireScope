from __future__ import annotations

from dataclasses import dataclass, fields, replace
from math import exp, isfinite
from statistics import pstdev
from typing import Any, Mapping

from blade.envs.fixed_target_strike_types import FixedTargetStrikeConfig, LaunchEvent, StepContext
from blade.units.Airbase import Airbase


@dataclass(frozen=True, slots=True)
class FixedTargetStrikeRewardConfig:
    kill_base: float = 100.0
    high_value_target_bonus: float = 50.0
    tot_weight: float = 40.0
    tot_tau_seconds: float = 8.0
    threat_step_penalty: float = -2.0
    launch_cost_per_weapon: float = -1.0
    time_cost_per_step: float = -0.05
    loss_penalty_per_ally: float = -80.0
    success_bonus: float = 150.0
    failure_penalty: float = -150.0
    high_value_target_ids: tuple[str, ...] = ()
    high_value_keywords: tuple[str, ...] = ("airbase", "command", "hq", "c2")


DEFAULT_REWARD_CONFIG = FixedTargetStrikeRewardConfig()


def compute_fixed_target_strike_reward(
    step_context: StepContext,
    config: FixedTargetStrikeConfig
    | FixedTargetStrikeRewardConfig
    | Mapping[str, Any]
    | None = None,
) -> tuple[float, dict[str, Any]]:
    reward_config = _resolve_reward_config(config)

    kill_reward = 0.0
    destroyed_high_value_target_ids: list[str] = []
    for target_id in step_context.destroyed_target_ids:
        target = step_context.scenario.get_target(target_id)
        target_reward = reward_config.kill_base
        if _is_high_value_target(target_id, target, reward_config):
            target_reward += reward_config.high_value_target_bonus
            destroyed_high_value_target_ids.append(target_id)
        kill_reward += target_reward

    tot_bonus, tot_groups = _compute_tot_bonus(step_context.launch_events, reward_config)
    weapons_fired = sum(max(int(event.weapon_quantity), 1) for event in step_context.launch_events)
    threat_penalty = step_context.threat_exposure_count * reward_config.threat_step_penalty
    launch_cost = weapons_fired * reward_config.launch_cost_per_weapon
    time_cost = reward_config.time_cost_per_step
    loss_cost = len(step_context.lost_ally_ids) * reward_config.loss_penalty_per_ally
    terminal_bonus = 0.0
    if step_context.success:
        terminal_bonus = reward_config.success_bonus
    elif step_context.failure:
        terminal_bonus = reward_config.failure_penalty

    total_reward = (
        kill_reward
        + tot_bonus
        + threat_penalty
        + launch_cost
        + time_cost
        + loss_cost
        + terminal_bonus
    )

    breakdown = {
        "kill_reward": float(kill_reward),
        "tot_bonus": float(tot_bonus),
        "threat_penalty": float(threat_penalty),
        "launch_cost": float(launch_cost),
        "time_cost": float(time_cost),
        "loss_cost": float(loss_cost),
        "terminal_bonus": float(terminal_bonus),
        "destroyed_target_ids": list(step_context.destroyed_target_ids),
        "destroyed_high_value_target_ids": destroyed_high_value_target_ids,
        "lost_ally_ids": list(step_context.lost_ally_ids),
        "threat_exposure_count": int(step_context.threat_exposure_count),
        "weapons_fired": int(weapons_fired),
        "selected_target_id": step_context.selected_target_id,
        "selected_target_ids": list(step_context.selected_target_ids),
        "ally_target_assignments": dict(step_context.ally_target_assignments),
        "tot_group_count": len(tot_groups),
        "tot_groups": tot_groups,
        "done_reason": step_context.done_reason,
        "step_index": int(step_context.step_index),
        "total_reward": float(total_reward),
    }
    return float(total_reward), breakdown


def compute_reward(
    step_context: StepContext,
    config: FixedTargetStrikeConfig
    | FixedTargetStrikeRewardConfig
    | Mapping[str, Any]
    | None = None,
) -> tuple[float, dict[str, Any]]:
    return compute_fixed_target_strike_reward(step_context, config)


def _resolve_reward_config(
    config: FixedTargetStrikeConfig
    | FixedTargetStrikeRewardConfig
    | Mapping[str, Any]
    | None,
) -> FixedTargetStrikeRewardConfig:
    if isinstance(config, FixedTargetStrikeRewardConfig):
        return config

    candidate: Any = config
    if isinstance(config, FixedTargetStrikeConfig):
        candidate = config.reward_config

    if candidate is None:
        return DEFAULT_REWARD_CONFIG

    if isinstance(candidate, FixedTargetStrikeRewardConfig):
        return candidate

    reward_kwargs: dict[str, Any] = {}
    reward_fields = {field.name for field in fields(FixedTargetStrikeRewardConfig)}
    if isinstance(candidate, Mapping):
        for key in reward_fields:
            if key in candidate and candidate[key] is not None:
                reward_kwargs[key] = candidate[key]
    else:
        for key in reward_fields:
            if hasattr(candidate, key):
                value = getattr(candidate, key)
                if value is not None:
                    reward_kwargs[key] = value

    if "high_value_target_ids" in reward_kwargs:
        reward_kwargs["high_value_target_ids"] = tuple(reward_kwargs["high_value_target_ids"])
    if "high_value_keywords" in reward_kwargs:
        reward_kwargs["high_value_keywords"] = tuple(reward_kwargs["high_value_keywords"])

    if "tot_tau_seconds" in reward_kwargs and reward_kwargs["tot_tau_seconds"] <= 0:
        reward_kwargs["tot_tau_seconds"] = DEFAULT_REWARD_CONFIG.tot_tau_seconds

    return replace(DEFAULT_REWARD_CONFIG, **reward_kwargs)


def _compute_tot_bonus(
    launch_events: list[LaunchEvent],
    reward_config: FixedTargetStrikeRewardConfig,
) -> tuple[float, list[dict[str, Any]]]:
    grouped_impact_times: dict[str, list[float]] = {}
    for launch_event in launch_events:
        if (
            launch_event.estimated_impact_time_s is None
            or not isfinite(launch_event.estimated_impact_time_s)
        ):
            continue
        grouped_impact_times.setdefault(launch_event.target_id, []).append(
            float(launch_event.estimated_impact_time_s)
        )

    total_bonus = 0.0
    tot_groups: list[dict[str, Any]] = []
    for target_id, impact_times in grouped_impact_times.items():
        if len(impact_times) < 2:
            continue
        impact_std = pstdev(impact_times)
        group_bonus = (
            reward_config.tot_weight
            * len(impact_times)
            * exp(-impact_std / reward_config.tot_tau_seconds)
        )
        total_bonus += group_bonus
        tot_groups.append(
            {
                "target_id": target_id,
                "launch_count": len(impact_times),
                "impact_std_seconds": float(impact_std),
                "group_bonus": float(group_bonus),
            }
        )
    return total_bonus, tot_groups


def _is_high_value_target(
    target_id: str,
    target: Any,
    reward_config: FixedTargetStrikeRewardConfig,
) -> bool:
    if target_id in reward_config.high_value_target_ids:
        return True

    if isinstance(target, Airbase):
        return True

    if target is None:
        return False

    search_text = f"{getattr(target, 'name', '')} {getattr(target, 'class_name', '')}".lower()
    return any(keyword in search_text for keyword in reward_config.high_value_keywords)
