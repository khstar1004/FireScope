import { IAirbaseModel } from "@/game/db/models/Airbase";
import { IAircraftModel } from "@/game/db/models/Aircraft";
import { IFacilityModel } from "@/game/db/models/Facility";
import { IShipModel } from "@/game/db/models/Ship";
import { IWeaponModel } from "@/game/db/models/Weapon";

export interface UnitDbSnapshot {
  airbaseDb: IAirbaseModel[];
  aircraftDb: IAircraftModel[];
  facilityDb: IFacilityModel[];
  shipDb: IShipModel[];
  weaponDb: IWeaponModel[];
}
