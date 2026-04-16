from __future__ import annotations

import sys
import types
import unittest
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

if "gymnasium" not in sys.modules:
    gymnasium_module = types.ModuleType("gymnasium")
    envs_module = types.ModuleType("gymnasium.envs")
    registration_module = types.ModuleType("gymnasium.envs.registration")

    def register(*args, **kwargs):
        return None

    registration_module.register = register
    envs_module.registration = registration_module

    sys.modules["gymnasium"] = gymnasium_module
    sys.modules["gymnasium.envs"] = envs_module
    sys.modules["gymnasium.envs.registration"] = registration_module

if "shapely" not in sys.modules:
    shapely_module = types.ModuleType("shapely")
    geometry_module = types.ModuleType("shapely.geometry")

    class _BufferedPoint:
        def contains(self, other) -> bool:
            return True

    class Point:
        def __init__(self, *args, **kwargs):
            self.args = args

        def buffer(self, *args, **kwargs):
            return _BufferedPoint()

    class Polygon:
        def __init__(self, *args, **kwargs):
            self.args = args

        @property
        def centroid(self):
            return Point(0.0, 0.0)

    geometry_module.Point = Point
    geometry_module.Polygon = Polygon
    shapely_module.geometry = geometry_module

    sys.modules["shapely"] = shapely_module
    sys.modules["shapely.geometry"] = geometry_module

from blade.Relationships import Relationships
from blade.Scenario import Scenario
from blade.Side import Side
from blade.engine.weaponEngagement import weapon_endgame
from blade.envs.fixed_target_strike_reward import (
    FixedTargetStrikeRewardConfig,
    compute_fixed_target_strike_reward,
)
from blade.envs.fixed_target_strike_types import FixedTargetStrikeConfig, StepContext
from blade.units.Facility import Facility
from blade.units.Weapon import Weapon


def build_weapon(*, weapon_id: str, side_id: str, target_id: str | None = None) -> Weapon:
    return Weapon(
        id=weapon_id,
        name="Test Missile",
        side_id=side_id,
        class_name="Test Missile",
        latitude=0.0,
        longitude=0.0,
        altitude=10000.0,
        heading=90.0,
        speed=600.0,
        current_fuel=30.0,
        max_fuel=30.0,
        fuel_rate=300.0,
        range=54.0,
        route=[],
        side_color="blue" if side_id == "blue-side" else "red",
        target_id=target_id,
        lethality=0.75,
        attack_power=75.0,
        max_quantity=1,
        current_quantity=1,
    )


class HpCombatTest(unittest.TestCase):
    def test_weapon_damage_accumulates_until_target_hp_is_depleted(self) -> None:
        target = Facility(
            id="red-target",
            name="Red Target",
            side_id="red-side",
            class_name="Target Facility",
            latitude=0.0,
            longitude=0.0,
            altitude=0.0,
            range=20.0,
            side_color="red",
            weapons=[],
            max_hp=120.0,
            current_hp=120.0,
            defense=15.0,
        )
        scenario = Scenario(facilities=[target], weapons=[])

        first_weapon = build_weapon(
            weapon_id="blue-weapon-1", side_id="blue-side", target_id=target.id
        )
        scenario.weapons.append(first_weapon)
        self.assertFalse(weapon_endgame(scenario, first_weapon, target))
        self.assertAlmostEqual(target.current_hp, 60.0)
        self.assertIn(target, scenario.facilities)

        second_weapon = build_weapon(
            weapon_id="blue-weapon-2", side_id="blue-side", target_id=target.id
        )
        scenario.weapons.append(second_weapon)
        self.assertTrue(weapon_endgame(scenario, second_weapon, target))
        self.assertNotIn(target, scenario.facilities)

    def test_damage_reward_uses_fractional_hp_progress(self) -> None:
        blue_side = Side(id="blue-side", name="BLUE", color="blue")
        red_side = Side(id="red-side", name="RED", color="red")
        target = Facility(
            id="red-sam-site",
            name="SAM Site",
            side_id=red_side.id,
            class_name="SAM Site",
            latitude=34.38,
            longitude=127.42,
            altitude=0.0,
            range=25.0,
            side_color="red",
            weapons=[],
            max_hp=120.0,
            current_hp=60.0,
            defense=30.0,
        )
        scenario = Scenario(
            id="hp-progress",
            name="HP Progress",
            start_time=0,
            duration=3600,
            sides=[blue_side, red_side],
            facilities=[target],
            relationships=Relationships(
                hostiles={blue_side.id: [red_side.id], red_side.id: [blue_side.id]},
                allies={blue_side.id: [], red_side.id: []},
            ),
        )
        env_config = FixedTargetStrikeConfig(
            max_allies=1,
            max_targets=1,
            max_episode_steps=30,
            normalize_margin_nm=120.0,
            eta_clip_seconds=1800.0,
            threat_buffer_nm=5.0,
            controllable_side_name="BLUE",
            target_side_name="RED",
        )
        reward_config = FixedTargetStrikeRewardConfig(damage_progress_weight=40.0)
        step_context = StepContext(
            step_index=1,
            current_time_s=1,
            config=env_config,
            scenario=scenario,
            observation={},
            total_damage_fraction=0.5,
            target_damage_fractions={"red-target": 0.5},
            done_reason="in_progress",
        )

        reward, breakdown = compute_fixed_target_strike_reward(step_context, reward_config)

        self.assertAlmostEqual(reward, 19.95)
        self.assertAlmostEqual(breakdown["damage_progress_reward"], 20.0)
        self.assertEqual(breakdown["total_damage_fraction"], 0.5)
