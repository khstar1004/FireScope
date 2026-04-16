from __future__ import annotations


DEFAULT_MAX_HP_BY_KIND = {
    "aircraft": 100.0,
    "facility": 120.0,
    "airbase": 150.0,
    "ship": 180.0,
    "weapon": 25.0,
}

DEFAULT_DEFENSE_BY_KIND = {
    "aircraft": 10.0,
    "facility": 15.0,
    "airbase": 20.0,
    "ship": 25.0,
    "weapon": 0.0,
}

DEFAULT_ATTACK_POWER_SCALE = 100.0
MINIMUM_ATTACK_POWER = 10.0
MINIMUM_DAMAGE = 1.0


def resolve_max_hp(kind: str, max_hp: float | None) -> float:
    if max_hp is not None:
        return max(float(max_hp), 1.0)
    return DEFAULT_MAX_HP_BY_KIND[kind]


def resolve_current_hp(current_hp: float | None, max_hp: float) -> float:
    if current_hp is None:
        return max_hp
    return min(max(float(current_hp), 0.0), max_hp)


def resolve_defense(kind: str, defense: float | None) -> float:
    if defense is not None:
        return max(float(defense), 0.0)
    return DEFAULT_DEFENSE_BY_KIND[kind]


def resolve_attack_power(
    attack_power: float | None, lethality: float | None = None
) -> float:
    if attack_power is not None:
        return max(float(attack_power), MINIMUM_DAMAGE)

    scaled_lethality = max(float(lethality or 0.0), 0.1)
    return max(round(scaled_lethality * DEFAULT_ATTACK_POWER_SCALE, 2), MINIMUM_ATTACK_POWER)


def get_health_fraction(current_hp: float, max_hp: float) -> float:
    if max_hp <= 0:
        return 0.0
    return min(max(current_hp / max_hp, 0.0), 1.0)


def compute_damage(raw_attack: float, defense: float) -> float:
    return max(float(raw_attack) - float(defense), MINIMUM_DAMAGE)


def apply_damage(target: object, raw_attack: float) -> float:
    damage = compute_damage(raw_attack, getattr(target, "defense", 0.0))
    next_hp = max(getattr(target, "current_hp", 0.0) - damage, 0.0)
    setattr(target, "current_hp", next_hp)
    return damage
