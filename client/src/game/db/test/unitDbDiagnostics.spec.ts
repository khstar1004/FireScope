import { describe, expect, it } from "vitest";
import Dba from "@/game/db/Dba";
import { buildUnitDbDiagnostics } from "@/game/db/unitDbDiagnostics";
import { UnitDbSnapshot } from "@/game/db/unitDbSnapshot";

describe("unitDbDiagnostics", () => {
  it("reports important integrity and metadata issues", () => {
    const snapshot: UnitDbSnapshot = {
      airbaseDb: [
        {
          name: "Broken Base",
          latitude: 95,
          longitude: 127,
          country: "",
        },
        {
          name: "Broken Base",
          latitude: 37.5,
          longitude: 127.1,
          country: "South Korea",
        },
      ],
      aircraftDb: [
        {
          className: "Broken Aircraft",
          speed: 0,
          maxFuel: 12000,
          fuelRate: 4500,
          range: 120,
          dataSource: {
            speedSrc: "missing",
            maxFuelSrc: "",
            fuelRateSrc: "missing",
            rangeSrc: "https://example.com/range",
          },
          units: {
            speedUnit: "mph",
            maxFuelUnit: "lbs",
            fuelRateUnit: "lbs/hr",
            rangeUnit: "nm",
          },
        },
      ],
      facilityDb: [
        {
          className: "Broken SAM",
          range: 0,
          detectionArcDegrees: 420,
        },
      ],
      shipDb: [
        {
          className: "Notional Destroyer",
          speed: 30,
          maxFuel: 5000,
          fuelRate: 100,
          range: 4500,
        },
      ],
      weaponDb: [
        {
          className: "Broken Missile",
          speed: 900,
          maxFuel: 200,
          fuelRate: 60,
          lethality: 1.4,
        },
        {
          className: "Broken Missile",
          speed: 900,
          maxFuel: 200,
          fuelRate: 60,
          lethality: 0.8,
        },
      ],
    };

    const report = buildUnitDbDiagnostics(snapshot);

    expect(report.isValid).toBe(false);
    expect(report.summary.errorCount).toBeGreaterThan(0);
    expect(report.summary.warningCount).toBeGreaterThan(0);
    expect(
      report.issues.some(
        (issue) =>
          issue.domain === "aircraft" && issue.code === "unexpected-units"
      )
    ).toBe(true);
    expect(
      report.issues.some(
        (issue) =>
          issue.domain === "ship" &&
          issue.code === "missing-source-metadata"
      )
    ).toBe(true);
    expect(
      report.issues.some(
        (issue) =>
          issue.domain === "weapon" &&
          issue.code === "duplicate-class-name"
      )
    ).toBe(true);
  });

  it("creates a new Dba instance from imported JSON without mutating the original", () => {
    const original = new Dba();
    const imported = Dba.fromJson(
      JSON.stringify({
        aircraftDb: [
          {
            className: "Custom Aircraft",
            speed: 500,
            maxFuel: 8000,
            fuelRate: 2000,
            range: 150,
            dataSource: {
              speedSrc: "https://example.com/speed",
              maxFuelSrc: "https://example.com/fuel",
              fuelRateSrc: "https://example.com/fuel-rate",
              rangeSrc: "https://example.com/range",
            },
            units: {
              speedUnit: "knots",
              maxFuelUnit: "lbs",
              fuelRateUnit: "lbs/hr",
              rangeUnit: "nm",
            },
          },
        ],
      })
    );

    expect(imported).toBeInstanceOf(Dba);
    expect(imported).not.toBe(original);
    expect(imported.getAircraftDb()).toHaveLength(1);
    expect(imported.getAircraftDb()[0].className).toBe("Custom Aircraft");
    expect(original.getAircraftDb().some((unit) => unit.className === "Custom Aircraft")).toBe(
      false
    );

    const cloned = imported.clone();

    expect(cloned).not.toBe(imported);
    expect(cloned.exportToJson()).toBe(imported.exportToJson());
  });
});
