import json
from typing import List, Optional
from blade.units.Weapon import Weapon
from blade.utils.colors import convert_color_name_to_side_color, SIDE_COLOR
from blade.units.combat_stats import (
    apply_damage,
    get_health_fraction,
    resolve_current_hp,
    resolve_defense,
    resolve_max_hp,
)


class Facility:
    def __init__(
        self,
        id: str,
        name: str,
        side_id: str,
        class_name: str,
        latitude: float = 0.0,
        longitude: float = 0.0,
        altitude: float = 0.0,  # FT ASL -- currently default
        range: float = 250.0,
        side_color: str | SIDE_COLOR | None = None,
        weapons: Optional[List[Weapon]] = None,
        max_hp: float | None = None,
        current_hp: float | None = None,
        defense: float | None = None,
    ):
        self.id = id
        self.name = name
        self.side_id = side_id
        self.class_name = class_name
        self.latitude = latitude
        self.longitude = longitude
        self.altitude = altitude
        self.range = range
        self.side_color = convert_color_name_to_side_color(side_color)
        self.weapons = weapons if weapons is not None else []
        self.max_hp = resolve_max_hp("facility", max_hp)
        self.current_hp = resolve_current_hp(current_hp, self.max_hp)
        self.defense = resolve_defense("facility", defense)

    def get_total_weapon_quantity(self) -> int:
        return sum([weapon.current_quantity for weapon in self.weapons])

    def get_weapon_with_highest_engagement_range(self) -> Weapon | None:
        if len(self.weapons) == 0:
            return None
        return max(self.weapons, key=lambda weapon: weapon.get_engagement_range())

    def get_detection_range(self) -> float:
        return self.range

    def get_health_fraction(self) -> float:
        return get_health_fraction(self.current_hp, self.max_hp)

    def apply_damage(self, raw_attack: float) -> float:
        return apply_damage(self, raw_attack)

    def is_destroyed(self) -> bool:
        return self.current_hp <= 0

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "side_id": str(self.side_id),
            "class_name": self.class_name,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "altitude": self.altitude,
            "range": self.range,
            "side_color": (
                self.side_color.value
                if isinstance(self.side_color, SIDE_COLOR)
                else self.side_color
            ),
            "weapons": [weapon.to_dict() for weapon in self.weapons],
            "max_hp": self.max_hp,
            "current_hp": self.current_hp,
            "defense": self.defense,
        }
