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
import {
  buildUnitDbDiagnostics,
  UnitDbDiagnosticsReport,
} from "@/game/db/unitDbDiagnostics";
import {
  buildPythonUnitDbParityReport,
  UnitDbParityReport,
} from "@/game/db/unitDbParity";
import {
  buildPythonUnitDbSyncPlan,
  UnitDbSyncPlan,
} from "@/game/db/unitDbSyncPlan";
import { UnitDbSnapshot } from "@/game/db/unitDbSnapshot";

export default class Dba {
  airbaseDb: IAirbaseModel[];
  aircraftDb: IAircraftModel[];
  facilityDb: IFacilityModel[];
  shipDb: IShipModel[];
  weaponDb: IWeaponModel[];

  constructor(snapshot?: Partial<UnitDbSnapshot>) {
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

    this.applySnapshot(snapshot);
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
    return JSON.stringify(this.toSnapshot(), null, 2);
  }

  toSnapshot(): UnitDbSnapshot {
    return {
      airbaseDb: this.airbaseDb,
      aircraftDb: this.aircraftDb,
      facilityDb: this.facilityDb,
      shipDb: this.shipDb,
      weaponDb: this.weaponDb,
    };
  }

  clone() {
    return new Dba(this.toSnapshot());
  }

  buildDiagnosticsReport(): UnitDbDiagnosticsReport {
    return buildUnitDbDiagnostics(this.toSnapshot());
  }

  buildPythonParityReport(): UnitDbParityReport {
    return buildPythonUnitDbParityReport(this.toSnapshot());
  }

  buildPythonSyncPlan(): UnitDbSyncPlan {
    return buildPythonUnitDbSyncPlan(this.toSnapshot());
  }

  static fromJson(json: string) {
    return new Dba(JSON.parse(json) as Partial<UnitDbSnapshot>);
  }

  importFromJson(json: string) {
    this.applySnapshot(Dba.fromJson(json).toSnapshot());
  }

  importFromCsv(csv: string) {}

  private applySnapshot(snapshot?: Partial<UnitDbSnapshot>) {
    if (!snapshot) {
      return;
    }

    const importAirbaseDb = snapshot.airbaseDb as unknown[];
    if (Array.isArray(importAirbaseDb) && importAirbaseDb.length > 0) {
      this.airbaseDb = Dba.normalizeAirbaseDb(importAirbaseDb);
    }

    const importAircraftDb = snapshot.aircraftDb as unknown[];
    if (Array.isArray(importAircraftDb) && importAircraftDb.length > 0) {
      this.aircraftDb = Dba.normalizeAircraftDb(importAircraftDb);
    }

    const importFacilityDb = snapshot.facilityDb as unknown[];
    if (Array.isArray(importFacilityDb) && importFacilityDb.length > 0) {
      this.facilityDb = Dba.normalizeFacilityDb(importFacilityDb);
    }

    const importShipDb = snapshot.shipDb as unknown[];
    if (Array.isArray(importShipDb) && importShipDb.length > 0) {
      this.shipDb = Dba.normalizeShipDb(importShipDb);
    }

    const importWeaponDb = snapshot.weaponDb as unknown[];
    if (Array.isArray(importWeaponDb) && importWeaponDb.length > 0) {
      this.weaponDb = Dba.normalizeWeaponDb(importWeaponDb);
    }
  }

  private static normalizeAirbaseDb(importAirbaseDb: unknown[]) {
    const finalImportedAirbaseDb: IAirbaseModel[] = [];
    importAirbaseDb.forEach((candidate) => {
      const { name, latitude, longitude, country } = candidate as Record<
        string,
        unknown
      >;
      if (!(name && latitude != null && longitude != null && country)) return;
      finalImportedAirbaseDb.push({
        name: `${name}`,
        latitude: Number(latitude),
        longitude: Number(longitude),
        country: `${country}`,
      });
    });
    return sortByKoreanPriority(
      finalImportedAirbaseDb.filter(
        (unit, idx, all) => all.findIndex((u) => u.name === unit.name) === idx
      ),
      (airbase) => airbase.name
    );
  }

  private static normalizeAircraftDb(importAircraftDb: unknown[]) {
    const finalImportedAircraftDb: IAircraftModel[] = [];
    importAircraftDb.forEach((candidate) => {
      const { className, speed, maxFuel, fuelRate, range, dataSource, units } =
        candidate as Record<string, any>;
      if (
        !(
          className &&
          speed != null &&
          maxFuel != null &&
          fuelRate != null &&
          range != null
        )
      ) {
        return;
      }

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
    return sortByKoreanPriority(
      finalImportedAircraftDb.filter(
        (unit, idx, all) =>
          all.findIndex((u) => u.className === unit.className) === idx
      ),
      (aircraft) => aircraft.className
    );
  }

  private static normalizeFacilityDb(importFacilityDb: unknown[]) {
    const finalImportedFacilityDb: IFacilityModel[] = [];
    importFacilityDb.forEach((candidate) => {
      const { className, range, detectionArcDegrees, sourceUrl, sourceNote } =
        candidate as Record<string, unknown>;
      if (!(className && range != null)) return;
      finalImportedFacilityDb.push({
        className: `${className}`,
        range: Number(range),
        detectionArcDegrees:
          typeof detectionArcDegrees === "number"
            ? detectionArcDegrees
            : undefined,
        sourceUrl: typeof sourceUrl === "string" ? sourceUrl : undefined,
        sourceNote: typeof sourceNote === "string" ? sourceNote : undefined,
      });
    });
    return sortByKoreanPriority(
      finalImportedFacilityDb.filter(
        (unit, idx, all) =>
          all.findIndex((u) => u.className === unit.className) === idx
      ),
      (facility) => facility.className
    );
  }

  private static normalizeShipDb(importShipDb: unknown[]) {
    const finalImportedShipDb: IShipModel[] = [];
    importShipDb.forEach((candidate) => {
      const { className, speed, maxFuel, fuelRate, range, dataSource, units } =
        candidate as Record<string, any>;
      if (
        !(
          className &&
          speed != null &&
          maxFuel != null &&
          fuelRate != null &&
          range != null
        )
      ) {
        return;
      }

      const model: IShipModel = {
        className,
        speed,
        maxFuel,
        fuelRate,
        range,
      };

      if (dataSource && typeof dataSource === "object") {
        model.dataSource = {
          speedSrc: dataSource.speedSrc ?? "",
          maxFuelSrc: dataSource.maxFuelSrc ?? "",
          fuelRateSrc: dataSource.fuelRateSrc ?? "",
          rangeSrc: dataSource.rangeSrc ?? "",
        };
      }
      if (units && typeof units === "object") {
        model.units = {
          speedUnit: units.speedUnit ?? "",
          maxFuelUnit: units.maxFuelUnit ?? "",
          fuelRateUnit: units.fuelRateUnit ?? "",
          rangeUnit: units.rangeUnit ?? "",
        };
      }

      finalImportedShipDb.push(model);
    });
    return sortByKoreanPriority(
      finalImportedShipDb.filter(
        (unit, idx, all) =>
          all.findIndex((u) => u.className === unit.className) === idx
      ),
      (ship) => ship.className
    );
  }

  private static normalizeWeaponDb(importWeaponDb: unknown[]) {
    const finalImportedWeaponDb: IWeaponModel[] = [];
    importWeaponDb.forEach((candidate) => {
      const { className, speed, maxFuel, fuelRate, lethality } =
        candidate as Record<string, unknown>;
      if (
        !(
          className &&
          speed != null &&
          maxFuel != null &&
          fuelRate != null &&
          lethality != null
        )
      ) {
        return;
      }

      finalImportedWeaponDb.push({
        className: `${className}`,
        speed: Number(speed),
        maxFuel: Number(maxFuel),
        fuelRate: Number(fuelRate),
        lethality: Number(lethality),
      });
    });
    return sortByKoreanPriority(
      finalImportedWeaponDb.filter(
        (unit, idx, all) =>
          all.findIndex((u) => u.className === unit.className) === idx
      ),
      (weapon) => weapon.className
    );
  }
}
