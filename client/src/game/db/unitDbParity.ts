import { UnitDbDomain } from "@/game/db/unitDbDiagnostics";
import { PythonUnitDbSnapshot } from "@/game/db/pythonUnitDbSnapshot";
import bundledPythonUnitDbSnapshotJson from "@/game/db/pythonUnitDbSnapshot.json";
import { UnitDbSnapshot } from "@/game/db/unitDbSnapshot";

const bundledPythonUnitDbSnapshot =
  bundledPythonUnitDbSnapshotJson as PythonUnitDbSnapshot;

type MeasurementField = "speed" | "maxFuel" | "fuelRate" | "range";
type MeasurementUnitField =
  | "speedUnit"
  | "maxFuelUnit"
  | "fuelRateUnit"
  | "rangeUnit";
type UnitMap = Record<MeasurementUnitField, string>;

const NUMERIC_MISMATCH_THRESHOLD = 0.05;
const LOCATION_MISMATCH_THRESHOLD = 0.0001;

const DEFAULT_CLIENT_SHIP_UNITS: UnitMap = {
  speedUnit: "knots",
  maxFuelUnit: "lbs",
  fuelRateUnit: "lbs/hr",
  rangeUnit: "nm",
};

const DEFAULT_CLIENT_AIRCRAFT_UNITS: UnitMap = {
  speedUnit: "knots",
  maxFuelUnit: "lbs",
  fuelRateUnit: "lbs/hr",
  rangeUnit: "nm",
};

const DEFAULT_PYTHON_SHIP_UNITS: UnitMap = {
  speedUnit: "mph",
  maxFuelUnit: "lbs",
  fuelRateUnit: "lbs/hr",
  rangeUnit: "nm",
};

export type UnitDbParitySeverity = "error" | "warning";

export interface UnitDbParityIssue {
  severity: UnitDbParitySeverity;
  domain: UnitDbDomain;
  unitId: string;
  code:
    | "domain-unavailable-in-python"
    | "missing-in-client"
    | "missing-in-python"
    | "field-mismatch"
    | "unit-mismatch"
    | "numeric-mismatch";
  message: string;
  details?: Record<string, unknown>;
}

export interface UnitDbParityDomainSummary {
  clientUnits: number;
  pythonUnits: number;
  sharedUnits: number;
  clientOnlyUnits: number;
  pythonOnlyUnits: number;
  mismatchUnits: number;
}

export interface UnitDbParityReport {
  generatedAt: string;
  comparedAgainst: {
    sourceFile: string;
    generatedAt: string;
  };
  isAligned: boolean;
  summary: {
    issueCount: number;
    errorCount: number;
    warningCount: number;
    domains: Record<UnitDbDomain, UnitDbParityDomainSummary>;
  };
  issues: UnitDbParityIssue[];
}

function createDomainSummary(
  clientUnits: number,
  pythonUnits: number
): UnitDbParityDomainSummary {
  return {
    clientUnits,
    pythonUnits,
    sharedUnits: 0,
    clientOnlyUnits: 0,
    pythonOnlyUnits: 0,
    mismatchUnits: 0,
  };
}

function createBaseSummary(
  clientSnapshot: UnitDbSnapshot,
  pythonSnapshot: PythonUnitDbSnapshot
) {
  return {
    airbase: createDomainSummary(
      clientSnapshot.airbaseDb.length,
      pythonSnapshot.airbaseDb.length
    ),
    aircraft: createDomainSummary(
      clientSnapshot.aircraftDb.length,
      pythonSnapshot.aircraftDb.length
    ),
    facility: createDomainSummary(
      clientSnapshot.facilityDb.length,
      pythonSnapshot.facilityDb.length
    ),
    ship: createDomainSummary(
      clientSnapshot.shipDb.length,
      pythonSnapshot.shipDb.length
    ),
    weapon: createDomainSummary(
      clientSnapshot.weaponDb.length,
      pythonSnapshot.weaponDb.length
    ),
  } satisfies Record<UnitDbDomain, UnitDbParityDomainSummary>;
}

function getRelativeDifference(left: number, right: number) {
  return Math.abs(left - right) / Math.max(Math.abs(left), Math.abs(right), 1);
}

function normalizeMeasurement(
  field: MeasurementField,
  value: number,
  unit?: string
) {
  const normalizedUnit = unit?.trim().toLowerCase() ?? "";

  if (field === "speed") {
    if (!normalizedUnit || normalizedUnit === "knots") return value;
    if (normalizedUnit === "mph") return value * 0.868976;
    return null;
  }

  if (field === "fuelRate") {
    if (!normalizedUnit || normalizedUnit === "lbs/hr") return value;
    return null;
  }

  if (field === "maxFuel") {
    if (!normalizedUnit || normalizedUnit === "lbs") return value;
    return null;
  }

  if (field === "range") {
    if (!normalizedUnit || normalizedUnit === "nm") return value;
    return null;
  }

  return null;
}

function getMeasurementUnitField(
  field: MeasurementField
): MeasurementUnitField {
  if (field === "speed") return "speedUnit";
  if (field === "maxFuel") return "maxFuelUnit";
  if (field === "fuelRate") return "fuelRateUnit";
  return "rangeUnit";
}

function getUnitsWithDefaults(
  units: Partial<UnitMap> | undefined,
  defaults: UnitMap
) {
  return {
    speedUnit: units?.speedUnit ?? defaults.speedUnit,
    maxFuelUnit: units?.maxFuelUnit ?? defaults.maxFuelUnit,
    fuelRateUnit: units?.fuelRateUnit ?? defaults.fuelRateUnit,
    rangeUnit: units?.rangeUnit ?? defaults.rangeUnit,
  } satisfies UnitMap;
}

function getSharedAndMissingIds(clientIds: string[], pythonIds: string[]) {
  const clientIdSet = new Set(clientIds);
  const pythonIdSet = new Set(pythonIds);

  return {
    sharedIds: clientIds.filter((id) => pythonIdSet.has(id)),
    clientOnlyIds: clientIds.filter((id) => !pythonIdSet.has(id)),
    pythonOnlyIds: pythonIds.filter((id) => !clientIdSet.has(id)),
  };
}

function pushAggregatedMissingIssue(
  issues: UnitDbParityIssue[],
  domain: UnitDbDomain,
  severity: UnitDbParitySeverity,
  code: "missing-in-client" | "missing-in-python",
  ids: string[],
  message: string
) {
  if (ids.length === 0) return;
  issues.push({
    severity,
    domain,
    unitId: "*",
    code,
    message,
    details: {
      ids,
      count: ids.length,
    },
  });
}

function compareAirbases(
  clientSnapshot: UnitDbSnapshot,
  pythonSnapshot: PythonUnitDbSnapshot,
  issues: UnitDbParityIssue[],
  summary: Record<UnitDbDomain, UnitDbParityDomainSummary>,
  mismatchUnits: Record<UnitDbDomain, Set<string>>
) {
  const domain: UnitDbDomain = "airbase";
  const clientMap = new Map(
    clientSnapshot.airbaseDb.map((airbase) => [airbase.name, airbase])
  );
  const pythonMap = new Map(
    pythonSnapshot.airbaseDb.map((airbase) => [airbase.name, airbase])
  );
  const { sharedIds, clientOnlyIds, pythonOnlyIds } = getSharedAndMissingIds(
    Array.from(clientMap.keys()),
    Array.from(pythonMap.keys())
  );

  summary[domain].sharedUnits = sharedIds.length;
  summary[domain].clientOnlyUnits = clientOnlyIds.length;
  summary[domain].pythonOnlyUnits = pythonOnlyIds.length;

  pushAggregatedMissingIssue(
    issues,
    domain,
    "warning",
    "missing-in-python",
    clientOnlyIds,
    `기지 ${clientOnlyIds.length}개가 TS DB에만 있습니다.`
  );
  pushAggregatedMissingIssue(
    issues,
    domain,
    "warning",
    "missing-in-client",
    pythonOnlyIds,
    `기지 ${pythonOnlyIds.length}개가 Python DB에만 있습니다.`
  );

  sharedIds.forEach((airbaseName) => {
    const clientAirbase = clientMap.get(airbaseName)!;
    const pythonAirbase = pythonMap.get(airbaseName)!;
    const fieldDifferences: Array<Record<string, unknown>> = [];

    if (
      getRelativeDifference(clientAirbase.latitude, pythonAirbase.latitude) >
      LOCATION_MISMATCH_THRESHOLD
    ) {
      fieldDifferences.push({
        field: "latitude",
        clientValue: clientAirbase.latitude,
        pythonValue: pythonAirbase.latitude,
      });
    }

    if (
      getRelativeDifference(clientAirbase.longitude, pythonAirbase.longitude) >
      LOCATION_MISMATCH_THRESHOLD
    ) {
      fieldDifferences.push({
        field: "longitude",
        clientValue: clientAirbase.longitude,
        pythonValue: pythonAirbase.longitude,
      });
    }

    if (clientAirbase.country !== pythonAirbase.country) {
      fieldDifferences.push({
        field: "country",
        clientValue: clientAirbase.country,
        pythonValue: pythonAirbase.country,
      });
    }

    if (fieldDifferences.length > 0) {
      mismatchUnits[domain].add(airbaseName);
      issues.push({
        severity: "error",
        domain,
        unitId: airbaseName,
        code: "field-mismatch",
        message: `기지 '${airbaseName}'의 속성이 Python DB와 다릅니다.`,
        details: {
          fieldDifferences,
        },
      });
    }
  });
}

function compareFacilities(
  clientSnapshot: UnitDbSnapshot,
  pythonSnapshot: PythonUnitDbSnapshot,
  issues: UnitDbParityIssue[],
  summary: Record<UnitDbDomain, UnitDbParityDomainSummary>,
  mismatchUnits: Record<UnitDbDomain, Set<string>>
) {
  const domain: UnitDbDomain = "facility";
  const clientMap = new Map(
    clientSnapshot.facilityDb.map((facility) => [facility.className, facility])
  );
  const pythonMap = new Map(
    pythonSnapshot.facilityDb.map((facility) => [facility.className, facility])
  );
  const { sharedIds, clientOnlyIds, pythonOnlyIds } = getSharedAndMissingIds(
    Array.from(clientMap.keys()),
    Array.from(pythonMap.keys())
  );

  summary[domain].sharedUnits = sharedIds.length;
  summary[domain].clientOnlyUnits = clientOnlyIds.length;
  summary[domain].pythonOnlyUnits = pythonOnlyIds.length;

  pushAggregatedMissingIssue(
    issues,
    domain,
    "warning",
    "missing-in-python",
    clientOnlyIds,
    `지상 무기체계 ${clientOnlyIds.length}개가 TS DB에만 있습니다.`
  );
  pushAggregatedMissingIssue(
    issues,
    domain,
    "warning",
    "missing-in-client",
    pythonOnlyIds,
    `지상 무기체계 ${pythonOnlyIds.length}개가 Python DB에만 있습니다.`
  );

  sharedIds.forEach((facilityName) => {
    const clientFacility = clientMap.get(facilityName)!;
    const pythonFacility = pythonMap.get(facilityName)!;
    const relativeDifference = getRelativeDifference(
      clientFacility.range,
      pythonFacility.range
    );

    if (relativeDifference > NUMERIC_MISMATCH_THRESHOLD) {
      mismatchUnits[domain].add(facilityName);
      issues.push({
        severity: "error",
        domain,
        unitId: facilityName,
        code: "numeric-mismatch",
        message: `지상 무기체계 '${facilityName}'의 사거리가 Python DB와 다릅니다.`,
        details: {
          numericDifferences: [
            {
              field: "range",
              clientValue: clientFacility.range,
              pythonValue: pythonFacility.range,
              relativeDifference,
              unit: "nm",
            },
          ],
        },
      });
    }
  });
}

function compareAirframes(
  domain: Extract<UnitDbDomain, "aircraft" | "ship">,
  clientItems: UnitDbSnapshot["aircraftDb"] | UnitDbSnapshot["shipDb"],
  pythonItems:
    | PythonUnitDbSnapshot["aircraftDb"]
    | PythonUnitDbSnapshot["shipDb"],
  issues: UnitDbParityIssue[],
  summary: Record<UnitDbDomain, UnitDbParityDomainSummary>,
  mismatchUnits: Record<UnitDbDomain, Set<string>>
) {
  const clientMap = new Map(clientItems.map((item) => [item.className, item]));
  const pythonMap = new Map(pythonItems.map((item) => [item.className, item]));
  const { sharedIds, clientOnlyIds, pythonOnlyIds } = getSharedAndMissingIds(
    Array.from(clientMap.keys()),
    Array.from(pythonMap.keys())
  );

  summary[domain].sharedUnits = sharedIds.length;
  summary[domain].clientOnlyUnits = clientOnlyIds.length;
  summary[domain].pythonOnlyUnits = pythonOnlyIds.length;

  pushAggregatedMissingIssue(
    issues,
    domain,
    "warning",
    "missing-in-python",
    clientOnlyIds,
    `${domain === "aircraft" ? "항공기" : "함정"} ${clientOnlyIds.length}개가 TS DB에만 있습니다.`
  );
  pushAggregatedMissingIssue(
    issues,
    domain,
    "warning",
    "missing-in-client",
    pythonOnlyIds,
    `${domain === "aircraft" ? "항공기" : "함정"} ${pythonOnlyIds.length}개가 Python DB에만 있습니다.`
  );

  sharedIds.forEach((className) => {
    const clientItem = clientMap.get(className)!;
    const pythonItem = pythonMap.get(className)!;
    const clientUnits =
      domain === "aircraft"
        ? getUnitsWithDefaults(clientItem.units, DEFAULT_CLIENT_AIRCRAFT_UNITS)
        : getUnitsWithDefaults(clientItem.units, DEFAULT_CLIENT_SHIP_UNITS);
    const pythonUnits =
      domain === "aircraft"
        ? getUnitsWithDefaults(pythonItem.units, DEFAULT_CLIENT_AIRCRAFT_UNITS)
        : getUnitsWithDefaults(pythonItem.units, DEFAULT_PYTHON_SHIP_UNITS);

    const unitDifferences = (
      [
        "speedUnit",
        "maxFuelUnit",
        "fuelRateUnit",
        "rangeUnit",
      ] as MeasurementUnitField[]
    )
      .filter((field) => clientUnits[field] !== pythonUnits[field])
      .map((field) => ({
        field,
        clientValue: clientUnits[field],
        pythonValue: pythonUnits[field],
      }));

    if (unitDifferences.length > 0) {
      issues.push({
        severity: "warning",
        domain,
        unitId: className,
        code: "unit-mismatch",
        message: `${domain === "aircraft" ? "항공기" : "함정"} '${className}'의 단위 체계가 Python DB와 다릅니다.`,
        details: {
          unitDifferences,
        },
      });
    }

    const numericDifferences: Array<Record<string, unknown>> = [];

    (["speed", "maxFuel", "fuelRate", "range"] as MeasurementField[]).forEach(
      (field) => {
        const unitField = getMeasurementUnitField(field);
        const clientUnit = clientUnits[unitField];
        const pythonUnit = pythonUnits[unitField];
        const normalizedClientValue = normalizeMeasurement(
          field,
          clientItem[field],
          clientUnit
        );
        const normalizedPythonValue = normalizeMeasurement(
          field,
          pythonItem[field],
          pythonUnit
        );

        if (normalizedClientValue == null || normalizedPythonValue == null) {
          return;
        }

        const relativeDifference = getRelativeDifference(
          normalizedClientValue,
          normalizedPythonValue
        );

        if (relativeDifference > NUMERIC_MISMATCH_THRESHOLD) {
          numericDifferences.push({
            field,
            clientValue: clientItem[field],
            pythonValue: pythonItem[field],
            clientUnit,
            pythonUnit,
            normalizedClientValue,
            normalizedPythonValue,
            relativeDifference,
          });
        }
      }
    );

    if (numericDifferences.length > 0) {
      mismatchUnits[domain].add(className);
      issues.push({
        severity: "error",
        domain,
        unitId: className,
        code: "numeric-mismatch",
        message: `${domain === "aircraft" ? "항공기" : "함정"} '${className}'의 성능 수치가 Python DB와 다릅니다.`,
        details: {
          numericDifferences,
        },
      });
    }
  });
}

function compareWeapons(
  clientSnapshot: UnitDbSnapshot,
  pythonSnapshot: PythonUnitDbSnapshot,
  issues: UnitDbParityIssue[],
  summary: Record<UnitDbDomain, UnitDbParityDomainSummary>
) {
  const domain: UnitDbDomain = "weapon";
  summary[domain].sharedUnits = 0;
  summary[domain].clientOnlyUnits = clientSnapshot.weaponDb.length;
  summary[domain].pythonOnlyUnits = pythonSnapshot.weaponDb.length;

  if (!pythonSnapshot.metadata.availableDomains.weaponDb) {
    issues.push({
      severity: "error",
      domain,
      unitId: "*",
      code: "domain-unavailable-in-python",
      message:
        "Python DB에는 WeaponDb가 없어 TS 무장 데이터와 정합성 비교를 수행할 수 없습니다.",
      details: {
        clientWeaponCount: clientSnapshot.weaponDb.length,
      },
    });
    return;
  }

  const clientWeaponIds = clientSnapshot.weaponDb.map(
    (weapon) => weapon.className
  );
  const pythonWeaponIds = pythonSnapshot.weaponDb.map(
    (weapon) => weapon.className
  );
  const { clientOnlyIds, pythonOnlyIds } = getSharedAndMissingIds(
    clientWeaponIds,
    pythonWeaponIds
  );

  pushAggregatedMissingIssue(
    issues,
    domain,
    "warning",
    "missing-in-python",
    clientOnlyIds,
    `무장 ${clientOnlyIds.length}개가 TS DB에만 있습니다.`
  );
  pushAggregatedMissingIssue(
    issues,
    domain,
    "warning",
    "missing-in-client",
    pythonOnlyIds,
    `무장 ${pythonOnlyIds.length}개가 Python DB에만 있습니다.`
  );
}

export function buildPythonUnitDbParityReport(
  clientSnapshot: UnitDbSnapshot,
  pythonSnapshot: PythonUnitDbSnapshot = bundledPythonUnitDbSnapshot
): UnitDbParityReport {
  const issues: UnitDbParityIssue[] = [];
  const summary = createBaseSummary(clientSnapshot, pythonSnapshot);
  const mismatchUnits: Record<UnitDbDomain, Set<string>> = {
    airbase: new Set<string>(),
    aircraft: new Set<string>(),
    facility: new Set<string>(),
    ship: new Set<string>(),
    weapon: new Set<string>(),
  };

  compareAirbases(
    clientSnapshot,
    pythonSnapshot,
    issues,
    summary,
    mismatchUnits
  );
  compareAirframes(
    "aircraft",
    clientSnapshot.aircraftDb,
    pythonSnapshot.aircraftDb,
    issues,
    summary,
    mismatchUnits
  );
  compareFacilities(
    clientSnapshot,
    pythonSnapshot,
    issues,
    summary,
    mismatchUnits
  );
  compareAirframes(
    "ship",
    clientSnapshot.shipDb,
    pythonSnapshot.shipDb,
    issues,
    summary,
    mismatchUnits
  );
  compareWeapons(clientSnapshot, pythonSnapshot, issues, summary);

  (Object.keys(mismatchUnits) as UnitDbDomain[]).forEach((domain) => {
    summary[domain].mismatchUnits = mismatchUnits[domain].size;
  });

  const errorCount = issues.filter(
    (issue) => issue.severity === "error"
  ).length;
  const warningCount = issues.filter(
    (issue) => issue.severity === "warning"
  ).length;

  return {
    generatedAt: new Date().toISOString(),
    comparedAgainst: {
      sourceFile: pythonSnapshot.metadata.sourceFile,
      generatedAt: pythonSnapshot.metadata.generatedAt,
    },
    isAligned: errorCount === 0,
    summary: {
      issueCount: issues.length,
      errorCount,
      warningCount,
      domains: summary,
    },
    issues,
  };
}
