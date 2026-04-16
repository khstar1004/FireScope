from __future__ import annotations

from importlib import import_module

from blade.envs.fixed_target_strike_types import (
    FixedTargetStrikeConfig,
    LaunchEvent,
    StepContext,
)

__all__ = [
    "BLADE",
    "FixedTargetStrike",
    "FixedTargetStrikeConfig",
    "FixedTargetStrikeEnv",
    "LaunchEvent",
    "StepContext",
]


def __getattr__(name: str):
    if name == "BLADE":
        return import_module("blade.envs.blade").BLADE
    if name in {"FixedTargetStrike", "FixedTargetStrikeEnv"}:
        env_class = import_module("blade.envs.fixed_target_strike").FixedTargetStrikeEnv
        if name == "FixedTargetStrike":
            return env_class
        return env_class
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
