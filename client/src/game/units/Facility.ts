import Weapon from "@/game/units/Weapon";
import { convertColorNameToSideColor, SIDE_COLOR } from "@/utils/colors";
import { getFacilityDetectionArcDegrees } from "@/game/db/facilityThreatProfiles";
import {
  computeDamage,
  getHealthFraction,
  resolveCurrentHp,
  resolveDefense,
  resolveMaxHp,
} from "@/game/units/combatStats";

interface IFacility {
  id: string;
  name: string;
  sideId: string;
  className: string;
  latitude: number;
  longitude: number;
  altitude: number;
  range: number;
  heading?: number;
  speed?: number;
  route?: number[][];
  sideColor?: string | SIDE_COLOR;
  weapons?: Weapon[];
  detectionArcDegrees?: number;
  maxHp?: number;
  currentHp?: number;
  defense?: number;
}

export default class Facility {
  id: string;
  name: string;
  sideId: string;
  className: string;
  latitude: number = 0.0;
  longitude: number = 0.0;
  altitude: number = 0.0; // FT ASL -- currently default -- need to reference from database
  range: number = 250; // NM -- currently default -- need to reference from database
  heading: number = 0.0;
  speed: number = 0.0; // KTS
  route: number[][] = [];
  sideColor: SIDE_COLOR;
  weapons: Weapon[] = [];
  detectionArcDegrees: number;
  maxHp: number;
  currentHp: number;
  defense: number;

  constructor(parameters: IFacility) {
    this.id = parameters.id;
    this.name = parameters.name;
    this.sideId = parameters.sideId;
    this.className = parameters.className;
    this.latitude = parameters.latitude;
    this.longitude = parameters.longitude;
    this.altitude = parameters.altitude;
    this.range = parameters.range;
    this.heading = parameters.heading ?? 0.0;
    this.speed = parameters.speed ?? 0.0;
    this.route = parameters.route ?? [];
    this.sideColor = convertColorNameToSideColor(parameters.sideColor);
    this.weapons = parameters.weapons ?? [];
    this.detectionArcDegrees =
      parameters.detectionArcDegrees ??
      getFacilityDetectionArcDegrees(parameters.className);
    this.maxHp = resolveMaxHp("facility", parameters.maxHp);
    this.currentHp = resolveCurrentHp(parameters.currentHp, this.maxHp);
    this.defense = resolveDefense("facility", parameters.defense);
  }

  getTotalWeaponQuantity(): number {
    let sum = 0;
    this.weapons.forEach((weapon) => {
      sum += weapon.currentQuantity;
    });
    return sum;
  }

  getWeaponWithHighestEngagementRange(): Weapon | undefined {
    if (this.weapons.length === 0) return;
    return this.weapons.reduce((a, b) =>
      a.getEngagementRange() > b.getEngagementRange() ? a : b
    );
  }

  getWeaponEngagementRange(): number {
    if (this.weapons.length === 0) return 0;
    return (
      this.getWeaponWithHighestEngagementRange()?.getEngagementRange() ?? 0
    );
  }

  getDetectionRange(): number {
    return this.range;
  }

  getDetectionArcDegrees(): number {
    return this.detectionArcDegrees;
  }

  getDetectionHeading(): number {
    return this.heading;
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
