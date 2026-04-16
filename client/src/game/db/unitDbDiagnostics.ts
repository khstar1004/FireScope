import { UnitDbSnapshot } from "@/game/db/unitDbSnapshot";

export type UnitDbDiagnosticSeverity = "error" | "warning";
export type UnitDbDomain =
  | "airbase"
  | "aircraft"
  | "facility"
  | "ship"
  | "weapon";

export interface UnitDbDiagnosticIssue {
  severity: UnitDbDiagnosticSeverity;
  domain: UnitDbDomain;
  unitId: string;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface UnitDbDiagnosticsDomainSummary {
  units: number;
  errors: number;
  warnings: number;
}

export interface UnitDbDiagnosticsReport {
  generatedAt: string;
  isValid: boolean;
  summary: {
    totalUnits: number;
    issueCount: number;
    errorCount: number;
    warningCount: number;
    domains: Record<UnitDbDomain, UnitDbDiagnosticsDomainSummary>;
  };
  issues: UnitDbDiagnosticIssue[];
}

const EXPECTED_AIRCRAFT_UNITS = {
  speedUnit: "knots",
  maxFuelUnit: "lbs",
  fuelRateUnit: "lbs/hr",
  rangeUnit: "nm",
} as const;

const EXPECTED_SHIP_UNITS = {
  speedUnit: "knots",
  maxFuelUnit: "lbs",
  fuelRateUnit: "lbs/hr",
  rangeUnit: "nm",
} as const;

function createEmptyDomainSummary(
  units = 0
): UnitDbDiagnosticsDomainSummary {
  return {
    units,
    errors: 0,
    warnings: 0,
  };
}

function createBaseDomainSummary(snapshot: UnitDbSnapshot) {
  return {
    airbase: createEmptyDomainSummary(snapshot.airbaseDb.length),
    aircraft: createEmptyDomainSummary(snapshot.aircraftDb.length),
    facility: createEmptyDomainSummary(snapshot.facilityDb.length),
    ship: createEmptyDomainSummary(snapshot.shipDb.length),
    weapon: createEmptyDomainSummary(snapshot.weaponDb.length),
  } satisfies Record<UnitDbDomain, UnitDbDiagnosticsDomainSummary>;
}

function isMissingSource(value: unknown) {
  return (
    typeof value !== "string" ||
    value.trim().length === 0 ||
    value.trim().toLowerCase() === "missing"
  );
}

function isFinitePositiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function getDuplicateIds(items: string[]) {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([item]) => item);
}

function pushIssue(
  issues: UnitDbDiagnosticIssue[],
  issue: UnitDbDiagnosticIssue
) {
  issues.push(issue);
}

function validateAirbases(snapshot: UnitDbSnapshot, issues: UnitDbDiagnosticIssue[]) {
  const duplicateNames = getDuplicateIds(
    snapshot.airbaseDb.map((airbase) => airbase.name)
  );

  duplicateNames.forEach((name) => {
    pushIssue(issues, {
      severity: "error",
      domain: "airbase",
      unitId: name,
      code: "duplicate-name",
      message: `동일한 기지 이름 '${name}'이(가) 중복 등록되어 있습니다.`,
    });
  });

  snapshot.airbaseDb.forEach((airbase) => {
    const invalidFields: string[] = [];

    if (
      typeof airbase.latitude !== "number" ||
      !Number.isFinite(airbase.latitude) ||
      airbase.latitude < -90 ||
      airbase.latitude > 90
    ) {
      invalidFields.push("latitude");
    }

    if (
      typeof airbase.longitude !== "number" ||
      !Number.isFinite(airbase.longitude) ||
      airbase.longitude < -180 ||
      airbase.longitude > 180
    ) {
      invalidFields.push("longitude");
    }

    if (airbase.country.trim().length === 0) {
      invalidFields.push("country");
    }

    if (invalidFields.length > 0) {
      pushIssue(issues, {
        severity: "error",
        domain: "airbase",
        unitId: airbase.name,
        code: "invalid-fields",
        message: `기지 '${airbase.name}'의 필수 필드가 유효하지 않습니다: ${invalidFields.join(", ")}.`,
        details: { invalidFields },
      });
    }
  });
}

function validateAircraft(snapshot: UnitDbSnapshot, issues: UnitDbDiagnosticIssue[]) {
  const duplicateClassNames = getDuplicateIds(
    snapshot.aircraftDb.map((aircraft) => aircraft.className)
  );

  duplicateClassNames.forEach((className) => {
    pushIssue(issues, {
      severity: "error",
      domain: "aircraft",
      unitId: className,
      code: "duplicate-class-name",
      message: `항공기 '${className}'이(가) 중복 등록되어 있습니다.`,
    });
  });

  snapshot.aircraftDb.forEach((aircraft) => {
    const invalidFields = [
      ["speed", aircraft.speed],
      ["maxFuel", aircraft.maxFuel],
      ["fuelRate", aircraft.fuelRate],
      ["range", aircraft.range],
    ]
      .filter(([, value]) => !isFinitePositiveNumber(value))
      .map(([field]) => field);

    if (invalidFields.length > 0) {
      pushIssue(issues, {
        severity: "error",
        domain: "aircraft",
        unitId: aircraft.className,
        code: "invalid-numeric-fields",
        message: `항공기 '${aircraft.className}'의 수치 필드가 유효하지 않습니다: ${invalidFields.join(", ")}.`,
        details: { invalidFields },
      });
    }

    const missingSources = Object.entries(aircraft.dataSource)
      .filter(([, value]) => isMissingSource(value))
      .map(([field]) => field);

    if (missingSources.length > 0) {
      pushIssue(issues, {
        severity: "warning",
        domain: "aircraft",
        unitId: aircraft.className,
        code: "missing-source-metadata",
        message: `항공기 '${aircraft.className}'의 출처 정보가 비어 있습니다: ${missingSources.join(", ")}.`,
        details: { missingSources },
      });
    }

    const unexpectedUnits = (
      Object.entries(EXPECTED_AIRCRAFT_UNITS) as Array<
        [keyof typeof EXPECTED_AIRCRAFT_UNITS, string]
      >
    )
      .filter(([field, expected]) => aircraft.units[field] !== expected)
      .map(([field, expected]) => ({
        field,
        expected,
        actual: aircraft.units[field],
      }));

    if (unexpectedUnits.length > 0) {
      pushIssue(issues, {
        severity: "warning",
        domain: "aircraft",
        unitId: aircraft.className,
        code: "unexpected-units",
        message: `항공기 '${aircraft.className}'의 단위 체계가 기준과 다릅니다.`,
        details: { unexpectedUnits },
      });
    }
  });
}

function validateFacilities(
  snapshot: UnitDbSnapshot,
  issues: UnitDbDiagnosticIssue[]
) {
  const duplicateClassNames = getDuplicateIds(
    snapshot.facilityDb.map((facility) => facility.className)
  );

  duplicateClassNames.forEach((className) => {
    pushIssue(issues, {
      severity: "error",
      domain: "facility",
      unitId: className,
      code: "duplicate-class-name",
      message: `지상 무기체계 '${className}'이(가) 중복 등록되어 있습니다.`,
    });
  });

  snapshot.facilityDb.forEach((facility) => {
    const invalidFields: string[] = [];

    if (!isFinitePositiveNumber(facility.range)) {
      invalidFields.push("range");
    }

    if (
      facility.detectionArcDegrees !== undefined &&
      (!Number.isFinite(facility.detectionArcDegrees) ||
        facility.detectionArcDegrees <= 0 ||
        facility.detectionArcDegrees > 360)
    ) {
      invalidFields.push("detectionArcDegrees");
    }

    if (invalidFields.length > 0) {
      pushIssue(issues, {
        severity: "error",
        domain: "facility",
        unitId: facility.className,
        code: "invalid-numeric-fields",
        message: `지상 무기체계 '${facility.className}'의 수치 필드가 유효하지 않습니다: ${invalidFields.join(", ")}.`,
        details: { invalidFields },
      });
    }

    if (isMissingSource(facility.sourceUrl)) {
      pushIssue(issues, {
        severity: "warning",
        domain: "facility",
        unitId: facility.className,
        code: "missing-source-url",
        message: `지상 무기체계 '${facility.className}'에 출처 URL이 없습니다.`,
      });
    }
  });
}

function validateShips(snapshot: UnitDbSnapshot, issues: UnitDbDiagnosticIssue[]) {
  const duplicateClassNames = getDuplicateIds(
    snapshot.shipDb.map((ship) => ship.className)
  );

  duplicateClassNames.forEach((className) => {
    pushIssue(issues, {
      severity: "error",
      domain: "ship",
      unitId: className,
      code: "duplicate-class-name",
      message: `함정 '${className}'이(가) 중복 등록되어 있습니다.`,
    });
  });

  snapshot.shipDb.forEach((ship) => {
    const invalidFields = [
      ["speed", ship.speed],
      ["maxFuel", ship.maxFuel],
      ["fuelRate", ship.fuelRate],
      ["range", ship.range],
    ]
      .filter(([, value]) => !isFinitePositiveNumber(value))
      .map(([field]) => field);

    if (invalidFields.length > 0) {
      pushIssue(issues, {
        severity: "error",
        domain: "ship",
        unitId: ship.className,
        code: "invalid-numeric-fields",
        message: `함정 '${ship.className}'의 수치 필드가 유효하지 않습니다: ${invalidFields.join(", ")}.`,
        details: { invalidFields },
      });
    }

    const missingSources = Object.entries({
      speedSrc: ship.dataSource?.speedSrc,
      maxFuelSrc: ship.dataSource?.maxFuelSrc,
      fuelRateSrc: ship.dataSource?.fuelRateSrc,
      rangeSrc: ship.dataSource?.rangeSrc,
    })
      .filter(([, value]) => isMissingSource(value))
      .map(([field]) => field);

    if (missingSources.length > 0) {
      pushIssue(issues, {
        severity: "warning",
        domain: "ship",
        unitId: ship.className,
        code: "missing-source-metadata",
        message: `함정 '${ship.className}'의 출처 정보가 비어 있습니다: ${missingSources.join(", ")}.`,
        details: { missingSources },
      });
    }

    const unexpectedUnits = (
      Object.entries(EXPECTED_SHIP_UNITS) as Array<
        [keyof typeof EXPECTED_SHIP_UNITS, string]
      >
    )
      .filter(([field, expected]) => ship.units?.[field] !== expected)
      .map(([field, expected]) => ({
        field,
        expected,
        actual: ship.units?.[field],
      }));

    if (unexpectedUnits.length > 0) {
      pushIssue(issues, {
        severity: "warning",
        domain: "ship",
        unitId: ship.className,
        code: "unexpected-units",
        message: `함정 '${ship.className}'의 단위 체계가 기준과 다릅니다.`,
        details: { unexpectedUnits },
      });
    }
  });
}

function validateWeapons(snapshot: UnitDbSnapshot, issues: UnitDbDiagnosticIssue[]) {
  const duplicateClassNames = getDuplicateIds(
    snapshot.weaponDb.map((weapon) => weapon.className)
  );

  duplicateClassNames.forEach((className) => {
    pushIssue(issues, {
      severity: "error",
      domain: "weapon",
      unitId: className,
      code: "duplicate-class-name",
      message: `무기 '${className}'이(가) 중복 등록되어 있습니다.`,
    });
  });

  snapshot.weaponDb.forEach((weapon) => {
    const invalidFields = [
      ["speed", weapon.speed],
      ["maxFuel", weapon.maxFuel],
      ["fuelRate", weapon.fuelRate],
    ]
      .filter(([, value]) => !isFinitePositiveNumber(value))
      .map(([field]) => field);

    if (
      typeof weapon.lethality !== "number" ||
      !Number.isFinite(weapon.lethality) ||
      weapon.lethality <= 0 ||
      weapon.lethality > 1
    ) {
      invalidFields.push("lethality");
    }

    if (invalidFields.length > 0) {
      pushIssue(issues, {
        severity: "error",
        domain: "weapon",
        unitId: weapon.className,
        code: "invalid-numeric-fields",
        message: `무기 '${weapon.className}'의 수치 필드가 유효하지 않습니다: ${invalidFields.join(", ")}.`,
        details: { invalidFields },
      });
    }
  });
}

function buildSummary(
  snapshot: UnitDbSnapshot,
  issues: UnitDbDiagnosticIssue[]
) {
  const domains = createBaseDomainSummary(snapshot);

  issues.forEach((issue) => {
    if (issue.severity === "error") {
      domains[issue.domain].errors += 1;
      return;
    }

    domains[issue.domain].warnings += 1;
  });

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.length - errorCount;
  const totalUnits =
    snapshot.airbaseDb.length +
    snapshot.aircraftDb.length +
    snapshot.facilityDb.length +
    snapshot.shipDb.length +
    snapshot.weaponDb.length;

  return {
    totalUnits,
    issueCount: issues.length,
    errorCount,
    warningCount,
    domains,
  };
}

export function buildUnitDbDiagnostics(
  snapshot: UnitDbSnapshot
): UnitDbDiagnosticsReport {
  const issues: UnitDbDiagnosticIssue[] = [];

  validateAirbases(snapshot, issues);
  validateAircraft(snapshot, issues);
  validateFacilities(snapshot, issues);
  validateShips(snapshot, issues);
  validateWeapons(snapshot, issues);

  const summary = buildSummary(snapshot, issues);

  return {
    generatedAt: new Date().toISOString(),
    isValid: summary.errorCount === 0,
    summary,
    issues,
  };
}
