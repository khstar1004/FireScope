import { convertColorNameToSideColor, SIDE_COLOR } from "@/utils/colors";
import {
  computeDamage,
  getHealthFraction,
  resolveAttackPower,
  resolveCurrentHp,
  resolveDefense,
  resolveMaxHp,
} from "@/game/units/combatStats";

interface IWeapon {
  id: string;
  launcherId?: string;
  launchLatitude?: number;
  launchLongitude?: number;
  launchAltitude?: number;
  name: string;
  sideId: string;
  className: string;
  latitude: number;
  longitude: number;
  altitude: number;
  heading: number;
  speed: number;
  currentFuel: number;
  maxFuel: number;
  fuelRate: number; // lbs/hr
  range: number;
  route?: number[][];
  sideColor?: string | SIDE_COLOR;
  targetId: string | null;
  lethality: number;
  attackPower?: number;
  maxQuantity: number;
  currentQuantity: number;
  maxHp?: number;
  currentHp?: number;
  defense?: number;
}

export default class Weapon {
  id: string;
  launcherId: string;
  launchLatitude: number | null;
  launchLongitude: number | null;
  launchAltitude: number | null;
  name: string;
  sideId: string;
  className: string;
  latitude: number;
  longitude: number;
  altitude: number; // FT ASL -- currently default -- need to reference from database
  heading: number;
  speed: number; // KTS -- currently default -- need to reference from database
  currentFuel: number;
  maxFuel: number;
  fuelRate: number; // lbs/hr
  range: number; // NM -- currently default -- need to reference from database
  route: number[][];
  sideColor: SIDE_COLOR;
  targetId: string | null;
  lethality: number; // currently default -- need to reference from database
  attackPower: number;
  maxQuantity: number;
  currentQuantity: number;
  maxHp: number;
  currentHp: number;
  defense: number;

  constructor(parameters: IWeapon) {
    this.id = parameters.id;
    this.launcherId = parameters.launcherId ?? parameters.id;
    this.launchLatitude = parameters.launchLatitude ?? null;
    this.launchLongitude = parameters.launchLongitude ?? null;
    this.launchAltitude = parameters.launchAltitude ?? null;
    this.name = parameters.name;
    this.sideId = parameters.sideId;
    this.className = parameters.className;
    this.latitude = parameters.latitude;
    this.longitude = parameters.longitude;
    this.altitude = parameters.altitude;
    this.heading = parameters.heading;
    this.speed = parameters.speed;
    this.currentFuel = parameters.currentFuel;
    this.maxFuel = parameters.maxFuel;
    this.fuelRate = parameters.fuelRate;
    this.range = parameters.range;
    this.route = parameters.route ?? [];
    this.sideColor = convertColorNameToSideColor(parameters.sideColor);
    this.targetId = parameters.targetId;
    this.lethality = parameters.lethality;
    this.attackPower = resolveAttackPower(
      parameters.attackPower,
      parameters.lethality
    );
    this.maxQuantity = parameters.maxQuantity;
    this.currentQuantity = parameters.currentQuantity;
    this.maxHp = resolveMaxHp("weapon", parameters.maxHp);
    this.currentHp = resolveCurrentHp(parameters.currentHp, this.maxHp);
    this.defense = resolveDefense("weapon", parameters.defense);
  }

  getEngagementRange(): number {
    return this.speed * (this.currentFuel / this.fuelRate);
  }

  getHealthFraction(): number {
    return getHealthFraction(this.currentHp, this.maxHp);
  }

  applyDamage(rawAttackPower: number): number {
    const damage = computeDamage(rawAttackPower, this.defense);
    this.currentHp = Math.max(this.currentHp - damage, 0);
    return damage;
  }

  isDestroyed(): boolean {
    return this.currentHp <= 0;
  }
}
