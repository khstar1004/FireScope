export type CombatantKind =
  | "aircraft"
  | "facility"
  | "airbase"
  | "ship"
  | "weapon";

const DEFAULT_MAX_HP_BY_KIND: Record<CombatantKind, number> = {
  aircraft: 100,
  facility: 120,
  airbase: 150,
  ship: 180,
  weapon: 25,
};

const DEFAULT_DEFENSE_BY_KIND: Record<CombatantKind, number> = {
  aircraft: 10,
  facility: 15,
  airbase: 20,
  ship: 25,
  weapon: 0,
};

const DEFAULT_ATTACK_POWER_SCALE = 100;
const MINIMUM_ATTACK_POWER = 10;
const MINIMUM_DAMAGE = 1;

export function resolveMaxHp(
  kind: CombatantKind,
  maxHp?: number | null
): number {
  if (typeof maxHp === "number" && Number.isFinite(maxHp)) {
    return Math.max(maxHp, 1);
  }
  return DEFAULT_MAX_HP_BY_KIND[kind];
}

export function resolveCurrentHp(
  currentHp: number | null | undefined,
  maxHp: number
): number {
  if (typeof currentHp !== "number" || !Number.isFinite(currentHp)) {
    return maxHp;
  }
  return Math.min(Math.max(currentHp, 0), maxHp);
}

export function resolveDefense(
  kind: CombatantKind,
  defense?: number | null
): number {
  if (typeof defense === "number" && Number.isFinite(defense)) {
    return Math.max(defense, 0);
  }
  return DEFAULT_DEFENSE_BY_KIND[kind];
}

export function resolveAttackPower(
  attackPower?: number | null,
  lethality?: number | null
): number {
  if (typeof attackPower === "number" && Number.isFinite(attackPower)) {
    return Math.max(attackPower, MINIMUM_DAMAGE);
  }

  const scaledLethality = Math.max(lethality ?? 0, 0.1);
  return Math.max(
    Math.round(scaledLethality * DEFAULT_ATTACK_POWER_SCALE * 100) / 100,
    MINIMUM_ATTACK_POWER
  );
}

export function getHealthFraction(currentHp: number, maxHp: number): number {
  if (maxHp <= 0) {
    return 0;
  }
  return Math.min(Math.max(currentHp / maxHp, 0), 1);
}

export function computeDamage(attackPower: number, defense: number): number {
  return Math.max(attackPower - defense, MINIMUM_DAMAGE);
}
