import { describe, expect, it } from "vitest";
import { PythonUnitDbSnapshot } from "@/game/db/pythonUnitDbSnapshot";
import { buildPythonUnitDbParityReport } from "@/game/db/unitDbParity";
import { UnitDbSnapshot } from "@/game/db/unitDbSnapshot";

describe("unitDbParity", () => {
  it("reports missing domains, unit mismatches, and numeric drift", () => {
    const clientSnapshot: UnitDbSnapshot = {
      airbaseDb: [
        {
          name: "Shared Base",
          latitude: 37.5,
          longitude: 127.1,
          country: "South Korea",
        },
      ],
      aircraftDb: [
        {
          className: "Shared Fighter",
          speed: 100,
          maxFuel: 1000,
          fuelRate: 500,
          range: 120,
          dataSource: {
            speedSrc: "client-speed",
            maxFuelSrc: "client-fuel",
            fuelRateSrc: "client-fuel-rate",
            rangeSrc: "client-range",
          },
          units: {
            speedUnit: "knots",
            maxFuelUnit: "lbs",
            fuelRateUnit: "lbs/hr",
            rangeUnit: "nm",
          },
        },
      ],
      facilityDb: [],
      shipDb: [
        {
          className: "Shared Ship",
          speed: 34.8,
          maxFuel: 3500000,
          fuelRate: 100000,
          range: 5000,
        },
      ],
      weaponDb: [
        {
          className: "Client Weapon",
          speed: 800,
          maxFuel: 200,
          fuelRate: 50,
          lethality: 0.8,
        },
      ],
    };

    const pythonSnapshot: PythonUnitDbSnapshot = {
      metadata: {
        sourceFile: "gym/blade/db/UnitDb.py",
        generatedAt: "2026-04-13T00:00:00.000Z",
        availableDomains: {
          airbaseDb: true,
          aircraftDb: true,
          facilityDb: true,
          shipDb: true,
          weaponDb: false,
        },
      },
      airbaseDb: [
        {
          name: "Shared Base",
          latitude: 37.5,
          longitude: 127.1,
          country: "Republic of Korea",
        },
      ],
      aircraftDb: [
        {
          className: "Shared Fighter",
          speed: 115,
          maxFuel: 1000,
          fuelRate: 500,
          range: 240,
          dataSource: {
            speedSrc: "python-speed",
            maxFuelSrc: "python-fuel",
            fuelRateSrc: "python-fuel-rate",
            rangeSrc: "python-range",
          },
          units: {
            speedUnit: "mph",
            maxFuelUnit: "lbs",
            fuelRateUnit: "gallons/hour",
            rangeUnit: "nm",
          },
        },
      ],
      facilityDb: [
        {
          className: "Python SAM",
          range: 50,
        },
      ],
      shipDb: [
        {
          className: "Shared Ship",
          speed: 40,
          maxFuel: 3500000,
          fuelRate: 100000,
          range: 5000,
          units: {
            speedUnit: "mph",
            maxFuelUnit: "lbs",
            fuelRateUnit: "lbs/hr",
            rangeUnit: "nm",
          },
        },
      ],
      weaponDb: [],
    };

    const report = buildPythonUnitDbParityReport(
      clientSnapshot,
      pythonSnapshot
    );

    expect(report.isAligned).toBe(false);
    expect(report.summary.errorCount).toBeGreaterThan(0);
    expect(
      report.issues.some(
        (issue) =>
          issue.domain === "weapon" &&
          issue.code === "domain-unavailable-in-python"
      )
    ).toBe(true);
    expect(
      report.issues.some(
        (issue) => issue.domain === "aircraft" && issue.code === "unit-mismatch"
      )
    ).toBe(true);
    expect(
      report.issues.some(
        (issue) =>
          issue.domain === "aircraft" && issue.code === "numeric-mismatch"
      )
    ).toBe(true);
    expect(report.summary.domains.ship.mismatchUnits).toBe(0);
    expect(report.summary.domains.facility.pythonOnlyUnits).toBe(1);
  });
});
