import Aircraft from "@/game/units/Aircraft";
import { convertColorNameToSideColor, SIDE_COLOR } from "@/utils/colors";
import {
  computeDamage,
  getHealthFraction,
  resolveCurrentHp,
  resolveDefense,
  resolveMaxHp,
} from "@/game/units/combatStats";

interface IAirbase {
  id: string;
  name: string;
  sideId: string;
  className: string;
  latitude: number;
  longitude: number;
  altitude: number;
  sideColor?: string | SIDE_COLOR;
  aircraft?: Aircraft[];
  maxHp?: number;
  currentHp?: number;
  defense?: number;
}

export default class Airbase {
  id: string;
  name: string;
  sideId: string;
  className: string;
  latitude: number;
  longitude: number;
  altitude: number; // FT ASL -- currently default -- need to reference from database
  sideColor: SIDE_COLOR;
  aircraft: Aircraft[];
  maxHp: number;
  currentHp: number;
  defense: number;

  constructor(parameters: IAirbase) {
    this.id = parameters.id;
    this.name = parameters.name;
    this.sideId = parameters.sideId;
    this.className = parameters.className;
    this.latitude = parameters.latitude;
    this.longitude = parameters.longitude;
    this.altitude = parameters.altitude;
    this.sideColor = convertColorNameToSideColor(parameters.sideColor);
    this.aircraft = parameters.aircraft ?? [];
    this.maxHp = resolveMaxHp("airbase", parameters.maxHp);
    this.currentHp = resolveCurrentHp(parameters.currentHp, this.maxHp);
    this.defense = resolveDefense("airbase", parameters.defense);
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
