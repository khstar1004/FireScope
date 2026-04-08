import { IAircraftModel } from "@/game/db/models/Aircraft";
import {
  AirbaseDb,
  AircraftDb,
  FacilityDb,
  ShipDb,
  WeaponDb,
} from "@/game/db/UnitDb";
import { IAirbaseModel } from "@/game/db/models/Airbase";
import { IFacilityModel } from "@/game/db/models/Facility";
import { IShipModel } from "@/game/db/models/Ship";
import { IWeaponModel } from "@/game/db/models/Weapon";
import { sortByKoreanPriority } from "@/utils/koreanCatalog";

export default class Dba {
  airbaseDb: IAirbaseModel[];
  aircraftDb: IAircraftModel[];
  facilityDb: IFacilityModel[];
  shipDb: IShipModel[];
  weaponDb: IWeaponModel[];

  constructor() {
    this.airbaseDb = sortByKoreanPriority(AirbaseDb, (airbase) => airbase.name);
    this.aircraftDb = sortByKoreanPriority(
      AircraftDb,
      (aircraft) => aircraft.className
    );
    this.facilityDb = sortByKoreanPriority(
      FacilityDb,
      (facility) => facility.className
    );
    this.shipDb = sortByKoreanPriority(ShipDb, (ship) => ship.className);
    this.weaponDb = sortByKoreanPriority(
      WeaponDb,
      (weapon) => weapon.className
    );
  }

  getAircraftDb() {
    return this.aircraftDb;
  }

  getAirbaseDb() {
    return this.airbaseDb;
  }

  getFacilityDb() {
    return this.facilityDb;
  }

  getShipDb() {
    return this.shipDb;
  }

  getWeaponDb() {
    return this.weaponDb;
  }

  exportToJson() {
    return JSON.stringify({
      airbaseDb: this.airbaseDb,
      aircraftDb: this.aircraftDb,
      facilityDb: this.facilityDb,
      shipDb: this.shipDb,
      weaponDb: this.weaponDb,
    });
  }

  importFromJson(json: string) {
    const data = JSON.parse(json);

    const importAirbaseDb = data.airbaseDb as any[];
    if (Array.isArray(importAirbaseDb) && importAirbaseDb.length > 0) {
      const finalImportedAirbaseDb: IAirbaseModel[] = [];
      importAirbaseDb.forEach(({ name, latitude, longitude, country }) => {
        if (!(name && latitude != null && longitude != null && country)) return;
        finalImportedAirbaseDb.push({ name, latitude, longitude, country });
      });
      this.airbaseDb = sortByKoreanPriority(
        finalImportedAirbaseDb.filter(
          (unit, idx, all) => all.findIndex((u) => u.name === unit.name) === idx
        ),
        (airbase) => airbase.name
      );
    }

    const importAircraftDb = data.aircraftDb as any[];
    if (Array.isArray(importAircraftDb) && importAircraftDb.length > 0) {
      const finalImportedAircraftDb: IAircraftModel[] = [];
      importAircraftDb.forEach((aircraft) => {
        const {
          className,
          speed,
          maxFuel,
          fuelRate,
          range,
          dataSource,
          units,
        } = aircraft;
        if (
          !(
            className &&
            speed != null &&
            maxFuel != null &&
            fuelRate != null &&
            range != null
          )
        )
          return;

        finalImportedAircraftDb.push({
          className,
          speed,
          maxFuel,
          fuelRate,
          range,
          dataSource: {
            speedSrc: dataSource?.speedSrc ?? "",
            maxFuelSrc: dataSource?.maxFuelSrc ?? "",
            fuelRateSrc: dataSource?.fuelRateSrc ?? "",
            rangeSrc: dataSource?.rangeSrc ?? "",
          },
          units: {
            speedUnit: units?.speedUnit ?? "",
            maxFuelUnit: units?.maxFuelUnit ?? "",
            fuelRateUnit: units?.fuelRateUnit ?? "",
            rangeUnit: units?.rangeUnit ?? "",
          },
        });
      });
      this.aircraftDb = sortByKoreanPriority(
        finalImportedAircraftDb.filter(
          (unit, idx, all) =>
            all.findIndex((u) => u.className === unit.className) === idx
        ),
        (aircraft) => aircraft.className
      );
    }

    const importFacilityDb = data.facilityDb as any[];
    if (Array.isArray(importFacilityDb) && importFacilityDb.length > 0) {
      const finalImportedFacilityDb: IFacilityModel[] = [];
      importFacilityDb.forEach(
        ({
          className,
          range,
          detectionArcDegrees,
          sourceUrl,
          sourceNote,
        }) => {
        if (!(className && range != null)) return;
          finalImportedFacilityDb.push({
            className,
            range,
            detectionArcDegrees:
              typeof detectionArcDegrees === "number"
                ? detectionArcDegrees
                : undefined,
            sourceUrl: typeof sourceUrl === "string" ? sourceUrl : undefined,
            sourceNote:
              typeof sourceNote === "string" ? sourceNote : undefined,
          });
        }
      );
      this.facilityDb = sortByKoreanPriority(
        finalImportedFacilityDb.filter(
          (unit, idx, all) =>
            all.findIndex((u) => u.className === unit.className) === idx
        ),
        (facility) => facility.className
      );
    }

    const importShipDb = data.shipDb as any[];
    if (Array.isArray(importShipDb) && importShipDb.length > 0) {
      const finalImportedShipDb: IShipModel[] = [];
      importShipDb.forEach((ship) => {
        const {
          className,
          speed,
          maxFuel,
          fuelRate,
          range,
          dataSource,
          units,
        } = ship;
        if (
          !(
            className &&
            speed != null &&
            maxFuel != null &&
            fuelRate != null &&
            range != null
          )
        )
          return;

        const model: IShipModel = {
          className,
          speed,
          maxFuel,
          fuelRate,
          range,
        };

        if (
          dataSource &&
          typeof dataSource.speedSrc === "string" &&
          typeof dataSource.maxFuelSrc === "string"
        ) {
          model.dataSource = {
            speedSrc: dataSource.speedSrc,
            maxFuelSrc: dataSource.maxFuelSrc,
            fuelRateSrc: dataSource.fuelRateSrc,
            rangeSrc: dataSource.rangeSrc,
          };
        }

        if (
          units &&
          typeof units.speedUnit === "string" &&
          typeof units.maxFuelUnit === "string"
        ) {
          model.units = {
            speedUnit: units.speedUnit,
            maxFuelUnit: units.maxFuelUnit,
            fuelRateUnit: units.fuelRateUnit,
            rangeUnit: units.rangeUnit,
          };
        }

        finalImportedShipDb.push(model);
      });
      this.shipDb = sortByKoreanPriority(
        finalImportedShipDb.filter(
          (unit, idx, all) =>
            all.findIndex((u) => u.className === unit.className) === idx
        ),
        (ship) => ship.className
      );
    }

    const importWeaponDb = data.weaponDb as any[];
    if (Array.isArray(importWeaponDb) && importWeaponDb.length > 0) {
      const finalImportedWeaponDb: IWeaponModel[] = [];
      importWeaponDb.forEach((weapon) => {
        const { className, speed, maxFuel, fuelRate, lethality } = weapon;
        if (
          !(
            className &&
            speed != null &&
            maxFuel != null &&
            fuelRate != null &&
            lethality != null
          )
        )
          return;

        finalImportedWeaponDb.push({
          className,
          speed,
          maxFuel,
          fuelRate,
          lethality,
        });
      });
      this.weaponDb = sortByKoreanPriority(
        finalImportedWeaponDb.filter(
          (unit, idx, all) =>
            all.findIndex((u) => u.className === unit.className) === idx
        ),
        (weapon) => weapon.className
      );
    }
  }

  importFromCsv(csv: string) {}
}
