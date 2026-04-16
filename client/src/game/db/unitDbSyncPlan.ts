import { UnitDbDomain } from "@/game/db/unitDbDiagnostics";
import { PythonUnitDbSnapshot } from "@/game/db/pythonUnitDbSnapshot";
import {
  buildPythonUnitDbParityReport,
  UnitDbParityIssue,
} from "@/game/db/unitDbParity";
import bundledPythonUnitDbSnapshotJson from "@/game/db/pythonUnitDbSnapshot.json";
import { UnitDbSnapshot } from "@/game/db/unitDbSnapshot";

const bundledPythonUnitDbSnapshot =
  bundledPythonUnitDbSnapshotJson as PythonUnitDbSnapshot;

export type UnitDbSyncPriority = "high" | "medium" | "low";
export type UnitDbSyncActionType =
  | "import-python-entry-to-ts"
  | "review-ts-only-entry"
  | "align-unit-metadata"
  | "review-field-drift"
  | "review-numeric-drift"
  | "review-tactical-range-override"
  | "extend-python-weapon-schema";

export interface UnitDbSyncAction {
  priority: UnitDbSyncPriority;
  actionType: UnitDbSyncActionType;
  domain: UnitDbDomain;
  unitId: string;
  recommendation: string;
  rationale: string;
  details?: Record<string, unknown>;
}

export interface UnitDbSyncPlan {
  generatedAt: string;
  comparedAgainst: {
    sourceFile: string;
    generatedAt: string;
  };
  summary: {
    actionCount: number;
    highPriorityCount: number;
    mediumPriorityCount: number;
    lowPriorityCount: number;
    actionTypes: Record<UnitDbSyncActionType, number>;
  };
  actions: UnitDbSyncAction[];
}

function createActionTypeSummary(): Record<UnitDbSyncActionType, number> {
  return {
    "import-python-entry-to-ts": 0,
    "review-ts-only-entry": 0,
    "align-unit-metadata": 0,
    "review-field-drift": 0,
    "review-numeric-drift": 0,
    "review-tactical-range-override": 0,
    "extend-python-weapon-schema": 0,
  };
}

function asRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function getStringList(value: unknown) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    return [];
  }
  return value as string[];
}

function getNumericDifferences(details: Record<string, unknown>) {
  const differences = details.numericDifferences;
  if (!Array.isArray(differences)) {
    return [];
  }
  return differences
    .map((difference) => asRecord(difference))
    .filter(
      (difference): difference is Record<string, unknown> => difference != null
    );
}

function getFieldDifferences(details: Record<string, unknown>) {
  const differences = details.fieldDifferences;
  if (!Array.isArray(differences)) {
    return [];
  }
  return differences
    .map((difference) => asRecord(difference))
    .filter(
      (difference): difference is Record<string, unknown> => difference != null
    );
}

function getUnitDifferences(details: Record<string, unknown>) {
  const differences = details.unitDifferences;
  if (!Array.isArray(differences)) {
    return [];
  }
  return differences
    .map((difference) => asRecord(difference))
    .filter(
      (difference): difference is Record<string, unknown> => difference != null
    );
}

function getPreviewForDomain(
  domain: UnitDbDomain,
  unitId: string,
  clientSnapshot: UnitDbSnapshot,
  pythonSnapshot: PythonUnitDbSnapshot,
  side: "client" | "python"
) {
  if (domain === "airbase") {
    const collection =
      side === "client" ? clientSnapshot.airbaseDb : pythonSnapshot.airbaseDb;
    return collection.find((item) => item.name === unitId) ?? null;
  }

  if (domain === "aircraft") {
    const collection =
      side === "client" ? clientSnapshot.aircraftDb : pythonSnapshot.aircraftDb;
    return collection.find((item) => item.className === unitId) ?? null;
  }

  if (domain === "facility") {
    const collection =
      side === "client" ? clientSnapshot.facilityDb : pythonSnapshot.facilityDb;
    return collection.find((item) => item.className === unitId) ?? null;
  }

  if (domain === "ship") {
    const collection =
      side === "client" ? clientSnapshot.shipDb : pythonSnapshot.shipDb;
    return collection.find((item) => item.className === unitId) ?? null;
  }

  const collection =
    side === "client" ? clientSnapshot.weaponDb : pythonSnapshot.weaponDb;
  return collection.find((item) => item.className === unitId) ?? null;
}

function pushAction(actions: UnitDbSyncAction[], action: UnitDbSyncAction) {
  actions.push(action);
}

function buildMissingEntryActions(
  issue: UnitDbParityIssue,
  clientSnapshot: UnitDbSnapshot,
  pythonSnapshot: PythonUnitDbSnapshot,
  actions: UnitDbSyncAction[]
) {
  const details = asRecord(issue.details);
  if (!details) return;

  const ids = getStringList(details.ids);
  if (issue.code === "missing-in-client") {
    ids.forEach((unitId) => {
      pushAction(actions, {
        priority: "high",
        actionType: "import-python-entry-to-ts",
        domain: issue.domain,
        unitId,
        recommendation: `Python DB에만 있는 '${unitId}'를 TS DB 후보로 추가 검토합니다.`,
        rationale:
          "엔진 간 공통 편제를 맞추려면 TS 쪽 누락 항목부터 메워야 합니다.",
        details: {
          pythonPreview: getPreviewForDomain(
            issue.domain,
            unitId,
            clientSnapshot,
            pythonSnapshot,
            "python"
          ),
        },
      });
    });
    return;
  }

  if (issue.code === "missing-in-python") {
    ids.forEach((unitId) => {
      pushAction(actions, {
        priority: issue.domain === "weapon" ? "high" : "medium",
        actionType: "review-ts-only-entry",
        domain: issue.domain,
        unitId,
        recommendation: `TS DB에만 있는 '${unitId}'를 Python DB로 올릴지, TS 전용 자산으로 유지할지 결정합니다.`,
        rationale:
          "TS 전용 항목을 방치하면 브라우저 엔진과 Python 엔진의 시뮬레이션 결과가 계속 갈라집니다.",
        details: {
          clientPreview: getPreviewForDomain(
            issue.domain,
            unitId,
            clientSnapshot,
            pythonSnapshot,
            "client"
          ),
        },
      });
    });
  }
}

function buildFieldDriftAction(
  issue: UnitDbParityIssue,
  actions: UnitDbSyncAction[]
) {
  const details = asRecord(issue.details);
  if (!details) return;

  const fieldDifferences = getFieldDifferences(details);
  const countryOnly =
    fieldDifferences.length > 0 &&
    fieldDifferences.every((difference) => difference.field === "country");

  pushAction(actions, {
    priority: countryOnly ? "low" : "medium",
    actionType: "review-field-drift",
    domain: issue.domain,
    unitId: issue.unitId,
    recommendation: countryOnly
      ? `기지 '${issue.unitId}'의 국가 표기를 표준화합니다.`
      : `'${issue.unitId}'의 비수치 필드 차이를 검토합니다.`,
    rationale: countryOnly
      ? "국가명 표기 불일치는 참조 데이터 매칭과 필터링을 깨뜨릴 수 있습니다."
      : "비수치 필드 드리프트는 식별, 매칭, 검색 결과를 틀어지게 만듭니다.",
    details: {
      fieldDifferences,
    },
  });
}

function buildUnitMetadataAction(
  issue: UnitDbParityIssue,
  actions: UnitDbSyncAction[]
) {
  const details = asRecord(issue.details);
  if (!details) return;

  const unitDifferences = getUnitDifferences(details);
  pushAction(actions, {
    priority: "medium",
    actionType: "align-unit-metadata",
    domain: issue.domain,
    unitId: issue.unitId,
    recommendation: `'${issue.unitId}'의 단위 메타데이터를 엔진 기준 단위 체계로 맞춥니다.`,
    rationale:
      "실제 값이 같더라도 단위 메타데이터가 다르면 이후 자동 동기화와 검증이 계속 오탐을 냅니다.",
    details: {
      unitDifferences,
    },
  });
}

function isLikelyTacticalRangeOverride(difference: Record<string, unknown>) {
  if (difference.field !== "range") return false;

  const normalizedClientValue = difference.normalizedClientValue;
  const normalizedPythonValue = difference.normalizedPythonValue;
  if (
    typeof normalizedClientValue !== "number" ||
    typeof normalizedPythonValue !== "number"
  ) {
    return false;
  }

  return (
    normalizedClientValue > 0 &&
    normalizedClientValue <= normalizedPythonValue * 0.25
  );
}

function buildNumericDriftAction(
  issue: UnitDbParityIssue,
  actions: UnitDbSyncAction[]
) {
  const details = asRecord(issue.details);
  if (!details) return;

  const numericDifferences = getNumericDifferences(details);
  const tacticalRangeOverride =
    issue.domain === "aircraft" &&
    numericDifferences.some((difference) =>
      isLikelyTacticalRangeOverride(difference)
    );

  pushAction(actions, {
    priority: "high",
    actionType: tacticalRangeOverride
      ? "review-tactical-range-override"
      : "review-numeric-drift",
    domain: issue.domain,
    unitId: issue.unitId,
    recommendation: tacticalRangeOverride
      ? `항공기 '${issue.unitId}'의 range 값을 자동 동기화하지 말고, 전술 반경과 원본 항속거리를 분리합니다.`
      : `'${issue.unitId}'의 성능 수치를 TS/Python 기준값 중 하나로 수렴시킵니다.`,
    rationale: tacticalRangeOverride
      ? "현재 TS 항공기 range는 전술 시뮬레이션용 축약값일 가능성이 높아 단순 덮어쓰기가 위험합니다."
      : "성능 수치 드리프트는 동일 시나리오에서도 엔진별 결과 차이를 직접 유발합니다.",
    details: {
      numericDifferences,
    },
  });
}

function buildSchemaGapAction(
  issue: UnitDbParityIssue,
  actions: UnitDbSyncAction[]
) {
  pushAction(actions, {
    priority: "high",
    actionType: "extend-python-weapon-schema",
    domain: issue.domain,
    unitId: issue.unitId,
    recommendation:
      "Python 엔진에 WeaponDb 또는 동등한 무장 데이터 모델을 추가합니다.",
    rationale:
      "무장 도메인이 비어 있으면 TS/Python 교전 결과를 구조적으로 맞출 수 없습니다.",
    details: asRecord(issue.details) ?? undefined,
  });
}

function comparePriority(left: UnitDbSyncPriority, right: UnitDbSyncPriority) {
  const rank: Record<UnitDbSyncPriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };
  return rank[left] - rank[right];
}

export function buildPythonUnitDbSyncPlan(
  clientSnapshot: UnitDbSnapshot,
  pythonSnapshot: PythonUnitDbSnapshot = bundledPythonUnitDbSnapshot
): UnitDbSyncPlan {
  const parityReport = buildPythonUnitDbParityReport(
    clientSnapshot,
    pythonSnapshot
  );
  const actions: UnitDbSyncAction[] = [];

  parityReport.issues.forEach((issue) => {
    if (
      issue.code === "missing-in-client" ||
      issue.code === "missing-in-python"
    ) {
      buildMissingEntryActions(issue, clientSnapshot, pythonSnapshot, actions);
      return;
    }

    if (issue.code === "field-mismatch") {
      buildFieldDriftAction(issue, actions);
      return;
    }

    if (issue.code === "unit-mismatch") {
      buildUnitMetadataAction(issue, actions);
      return;
    }

    if (issue.code === "numeric-mismatch") {
      buildNumericDriftAction(issue, actions);
      return;
    }

    if (issue.code === "domain-unavailable-in-python") {
      buildSchemaGapAction(issue, actions);
    }
  });

  actions.sort((left, right) => {
    const priorityComparison = comparePriority(left.priority, right.priority);
    if (priorityComparison !== 0) {
      return priorityComparison;
    }
    const domainComparison = left.domain.localeCompare(right.domain);
    if (domainComparison !== 0) {
      return domainComparison;
    }
    return left.unitId.localeCompare(right.unitId);
  });

  const actionTypes = createActionTypeSummary();
  let highPriorityCount = 0;
  let mediumPriorityCount = 0;
  let lowPriorityCount = 0;

  actions.forEach((action) => {
    actionTypes[action.actionType] += 1;
    if (action.priority === "high") {
      highPriorityCount += 1;
      return;
    }
    if (action.priority === "medium") {
      mediumPriorityCount += 1;
      return;
    }
    lowPriorityCount += 1;
  });

  return {
    generatedAt: new Date().toISOString(),
    comparedAgainst: parityReport.comparedAgainst,
    summary: {
      actionCount: actions.length,
      highPriorityCount,
      mediumPriorityCount,
      lowPriorityCount,
      actionTypes,
    },
    actions,
  };
}
