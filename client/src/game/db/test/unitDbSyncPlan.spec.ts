import { describe, expect, it } from "vitest";
import { PythonUnitDbSnapshot } from "@/game/db/pythonUnitDbSnapshot";
import { buildPythonUnitDbSyncPlan } from "@/game/db/unitDbSyncPlan";
import { UnitDbSnapshot } from "@/game/db/unitDbSnapshot";

describe("unitDbSyncPlan", () => {
  it("classifies actionable TS/Python sync work", () => {
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
      shipDb: [],
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
          range: 800,
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
      shipDb: [],
      weaponDb: [],
    };

    const plan = buildPythonUnitDbSyncPlan(clientSnapshot, pythonSnapshot);

    expect(plan.summary.actionCount).toBeGreaterThan(0);
    expect(
      plan.actions.some(
        (action) =>
          action.actionType === "import-python-entry-to-ts" &&
          action.unitId === "Python SAM"
      )
    ).toBe(true);
    expect(
      plan.actions.some(
        (action) =>
          action.actionType === "review-tactical-range-override" &&
          action.unitId === "Shared Fighter"
      )
    ).toBe(true);
    expect(
      plan.actions.some(
        (action) =>
          action.actionType === "align-unit-metadata" &&
          action.unitId === "Shared Fighter"
      )
    ).toBe(true);
    expect(
      plan.actions.some(
        (action) =>
          action.actionType === "extend-python-weapon-schema" &&
          action.domain === "weapon"
      )
    ).toBe(true);
    expect(plan.summary.highPriorityCount).toBeGreaterThan(0);
  });
});
