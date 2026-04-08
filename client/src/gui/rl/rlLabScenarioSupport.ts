export interface RlScenarioSideSummary {
  id: string;
  name: string;
  aircraftCount: number;
  armedAircraftCount: number;
  fixedTargetCount: number;
}

export interface RlScenarioUnitOption {
  id: string;
  name: string;
  sideId: string;
  sideName: string;
  className: string;
  weaponCount: number;
}

export interface RlScenarioTargetOption extends RlScenarioUnitOption {
  kind: "facility" | "airbase" | "ship";
  recommendedPriority: number;
  highValuePriority: number;
}

export interface RlScenarioAnalysis {
  status: "empty" | "invalid" | "valid";
  scenarioName: string | null;
  sideSummaries: RlScenarioSideSummary[];
  allyOptions: RlScenarioUnitOption[];
  targetOptions: RlScenarioTargetOption[];
  recommendedControllableSideName: string | null;
  recommendedTargetSideName: string | null;
  recommendedAllyIds: string[];
  recommendedTargetIds: string[];
  recommendedHighValueTargetIds: string[];
  warnings: string[];
  error: string | null;
}

export interface RlScenarioSelection {
  controllableSideName: string;
  targetSideName: string;
  allyIds: string[];
  targetIds: string[];
  highValueTargetIds: string[];
}

const MAX_RECOMMENDED_ALLIES = 4;
const MAX_RECOMMENDED_TARGETS = 4;
const MAX_RECOMMENDED_HIGH_VALUE_TARGETS = 2;
const HIGH_VALUE_KEYWORD_PATTERN =
  /airbase|airport|runway|base|hq|command|c2|depot|hangar|기지|비행장|공항|사령|지휘|탄약|지휘소/i;
const THREAT_KEYWORD_PATTERN = /sam|radar|launcher|missile|방공|레이더|미사일/i;

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as UnknownRecord;
  }
  return null;
}

function asArray(value: unknown): UnknownRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => asRecord(item))
    .filter((item): item is UnknownRecord => item !== null);
}

function readString(record: UnknownRecord, key: string) {
  const value = record[key];
  return typeof value === "string" ? value : "";
}

function readNumber(record: UnknownRecord, key: string) {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function countWeapons(record: UnknownRecord) {
  return asArray(record.weapons).reduce((total, weapon) => {
    const quantity =
      readNumber(weapon, "currentQuantity") ||
      readNumber(weapon, "maxQuantity") ||
      1;
    return total + quantity;
  }, 0);
}

function normalizeName(value: string, fallback: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function getScenarioRoot(parsed: unknown) {
  const record = asRecord(parsed);
  if (!record) {
    return null;
  }
  const currentScenario = asRecord(record.currentScenario);
  return currentScenario ?? record;
}

function createSideNameMap(sideRecords: UnknownRecord[]) {
  const sideNameMap = new Map<string, string>();
  for (const side of sideRecords) {
    const id = readString(side, "id");
    if (!id) {
      continue;
    }
    sideNameMap.set(id, normalizeName(readString(side, "name"), id));
  }
  return sideNameMap;
}

function createAllyOption(record: UnknownRecord, sideNameMap: Map<string, string>) {
  const id = readString(record, "id");
  const sideId = readString(record, "sideId");
  if (!id || !sideId) {
    return null;
  }

  return {
    id,
    name: normalizeName(readString(record, "name"), id),
    sideId,
    sideName: sideNameMap.get(sideId) ?? sideId,
    className: readString(record, "className"),
    weaponCount: countWeapons(record),
  } satisfies RlScenarioUnitOption;
}

function createTargetOption(
  record: UnknownRecord,
  sideNameMap: Map<string, string>,
  kind: RlScenarioTargetOption["kind"]
) {
  const id = readString(record, "id");
  const sideId = readString(record, "sideId");
  if (!id || !sideId) {
    return null;
  }

  const name = normalizeName(readString(record, "name"), id);
  const className = readString(record, "className");
  const searchableText = `${name} ${className}`;
  const weaponCount = countWeapons(record);

  let recommendedPriority = 100;
  let highValuePriority = 0;

  if (kind === "airbase") {
    recommendedPriority += 120;
    highValuePriority += 200;
  } else if (kind === "ship") {
    recommendedPriority += 80;
    highValuePriority += 100;
  } else {
    recommendedPriority += 40;
  }

  if (HIGH_VALUE_KEYWORD_PATTERN.test(searchableText)) {
    recommendedPriority += 30;
    highValuePriority += 120;
  }
  if (THREAT_KEYWORD_PATTERN.test(searchableText)) {
    recommendedPriority += 60;
  }
  if (weaponCount > 0) {
    recommendedPriority += Math.min(weaponCount, 6) * 5;
  }

  return {
    id,
    name,
    sideId,
    sideName: sideNameMap.get(sideId) ?? sideId,
    className,
    weaponCount,
    kind,
    recommendedPriority,
    highValuePriority,
  } satisfies RlScenarioTargetOption;
}

function sortAllies(left: RlScenarioUnitOption, right: RlScenarioUnitOption) {
  return (
    right.weaponCount - left.weaponCount ||
    left.name.localeCompare(right.name) ||
    left.id.localeCompare(right.id)
  );
}

function sortTargets(left: RlScenarioTargetOption, right: RlScenarioTargetOption) {
  return (
    right.recommendedPriority - left.recommendedPriority ||
    right.weaponCount - left.weaponCount ||
    left.name.localeCompare(right.name) ||
    left.id.localeCompare(right.id)
  );
}

function sortHighValueTargets(
  left: RlScenarioTargetOption,
  right: RlScenarioTargetOption
) {
  return (
    right.highValuePriority - left.highValuePriority ||
    right.recommendedPriority - left.recommendedPriority ||
    left.name.localeCompare(right.name) ||
    left.id.localeCompare(right.id)
  );
}

function dedupe(values: string[]) {
  return Array.from(new Set(values));
}

export function analyzeRlScenario(scenarioText: string): RlScenarioAnalysis {
  const trimmed = scenarioText.trim();
  if (!trimmed) {
    return {
      status: "empty",
      scenarioName: null,
      sideSummaries: [],
      allyOptions: [],
      targetOptions: [],
      recommendedControllableSideName: null,
      recommendedTargetSideName: null,
      recommendedAllyIds: [],
      recommendedTargetIds: [],
      recommendedHighValueTargetIds: [],
      warnings: ["시나리오 JSON을 불러오면 추천 학습 구성이 자동으로 채워집니다."],
      error: null,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (error) {
    return {
      status: "invalid",
      scenarioName: null,
      sideSummaries: [],
      allyOptions: [],
      targetOptions: [],
      recommendedControllableSideName: null,
      recommendedTargetSideName: null,
      recommendedAllyIds: [],
      recommendedTargetIds: [],
      recommendedHighValueTargetIds: [],
      warnings: [],
      error:
        error instanceof Error
          ? `시나리오 JSON 파싱에 실패했습니다: ${error.message}`
          : "시나리오 JSON 파싱에 실패했습니다.",
    };
  }

  const scenario = getScenarioRoot(parsed);
  if (!scenario) {
    return {
      status: "invalid",
      scenarioName: null,
      sideSummaries: [],
      allyOptions: [],
      targetOptions: [],
      recommendedControllableSideName: null,
      recommendedTargetSideName: null,
      recommendedAllyIds: [],
      recommendedTargetIds: [],
      recommendedHighValueTargetIds: [],
      warnings: [],
      error: "시나리오 본문을 찾지 못했습니다.",
    };
  }

  const sideRecords = asArray(scenario.sides);
  const sideNameMap = createSideNameMap(sideRecords);
  const allyOptions = asArray(scenario.aircraft)
    .map((record) => createAllyOption(record, sideNameMap))
    .filter((record): record is RlScenarioUnitOption => record !== null)
    .sort(sortAllies);
  const targetOptions = [
    ...asArray(scenario.facilities).map((record) =>
      createTargetOption(record, sideNameMap, "facility")
    ),
    ...asArray(scenario.airbases).map((record) =>
      createTargetOption(record, sideNameMap, "airbase")
    ),
    ...asArray(scenario.ships)
      .filter((record) => readNumber(record, "speed") === 0)
      .map((record) => createTargetOption(record, sideNameMap, "ship")),
  ]
    .filter((record): record is RlScenarioTargetOption => record !== null)
    .sort(sortTargets);

  const sideSummaries = sideRecords
    .map((side) => {
      const id = readString(side, "id");
      if (!id) {
        return null;
      }

      const aircraftOnSide = allyOptions.filter((ally) => ally.sideId === id);
      const targetsOnSide = targetOptions.filter((target) => target.sideId === id);
      return {
        id,
        name: normalizeName(readString(side, "name"), id),
        aircraftCount: aircraftOnSide.length,
        armedAircraftCount: aircraftOnSide.filter((ally) => ally.weaponCount > 0).length,
        fixedTargetCount: targetsOnSide.length,
      } satisfies RlScenarioSideSummary;
    })
    .filter((summary): summary is RlScenarioSideSummary => summary !== null)
    .sort((left, right) => left.name.localeCompare(right.name));

  const controllableSide = sideSummaries
    .filter((summary) => summary.aircraftCount > 0)
    .sort(
      (left, right) =>
        right.armedAircraftCount - left.armedAircraftCount ||
        right.aircraftCount - left.aircraftCount ||
        left.name.localeCompare(right.name)
    )[0];
  const targetSide = sideSummaries
    .filter(
      (summary) =>
        summary.fixedTargetCount > 0 &&
        summary.name !== controllableSide?.name
    )
    .sort(
      (left, right) =>
        right.fixedTargetCount - left.fixedTargetCount ||
        left.name.localeCompare(right.name)
    )[0];

  const recommendedAllyIds =
    controllableSide === undefined
      ? []
      : allyOptions
          .filter((ally) => ally.sideName === controllableSide.name)
          .slice(0, MAX_RECOMMENDED_ALLIES)
          .map((ally) => ally.id);

  const targetCandidates =
    targetSide === undefined
      ? []
      : targetOptions.filter((target) => target.sideName === targetSide.name);
  const recommendedTargetIds = targetCandidates
    .slice(0, MAX_RECOMMENDED_TARGETS)
    .map((target) => target.id);
  const recommendedHighValueTargetIds = dedupe(
    targetCandidates
      .filter((target) => recommendedTargetIds.includes(target.id))
      .filter((target) => target.highValuePriority > 0)
      .sort(sortHighValueTargets)
      .slice(0, MAX_RECOMMENDED_HIGH_VALUE_TARGETS)
      .map((target) => target.id)
  );

  if (recommendedHighValueTargetIds.length === 0 && recommendedTargetIds.length > 0) {
    recommendedHighValueTargetIds.push(recommendedTargetIds[0]);
  }

  const warnings: string[] = [];
  if (!controllableSide) {
    warnings.push("항공기를 가진 세력을 찾지 못했습니다. 아군 세력과 기체 ID를 직접 지정해야 합니다.");
  }
  if (!targetSide) {
    warnings.push("고정 표적 세력을 찾지 못했습니다. 적 세력과 표적 ID를 직접 지정해야 합니다.");
  }
  if (controllableSide && recommendedAllyIds.length === 0) {
    warnings.push("추천 아군 항공기를 만들지 못했습니다. 무장이 있는 기체가 필요할 수 있습니다.");
  }
  if (targetSide && recommendedTargetIds.length === 0) {
    warnings.push("추천 표적을 만들지 못했습니다. 시설, 기지, 정지 함정을 확인해 주세요.");
  }
  if (
    controllableSide &&
    allyOptions.filter((ally) => ally.sideName === controllableSide.name).length >
      recommendedAllyIds.length
  ) {
    warnings.push(
      `초심자용 기본값으로 아군 항공기 ${recommendedAllyIds.length}대만 추천합니다. 나머지는 수동으로 추가할 수 있습니다.`
    );
  }
  if (targetSide && targetCandidates.length > recommendedTargetIds.length) {
    warnings.push(
      `초심자용 기본값으로 표적 ${recommendedTargetIds.length}개만 추천합니다. 더 큰 시나리오는 수동으로 확장할 수 있습니다.`
    );
  }

  return {
    status: "valid",
    scenarioName: normalizeName(readString(scenario, "name"), "Unnamed Scenario"),
    sideSummaries,
    allyOptions,
    targetOptions,
    recommendedControllableSideName: controllableSide?.name ?? null,
    recommendedTargetSideName: targetSide?.name ?? null,
    recommendedAllyIds,
    recommendedTargetIds,
    recommendedHighValueTargetIds,
    warnings,
    error: null,
  };
}

export function validateRlScenarioSelection(
  analysis: RlScenarioAnalysis,
  selection: RlScenarioSelection
) {
  if (analysis.status !== "valid") {
    return analysis.error ? [analysis.error] : [];
  }

  const issues: string[] = [];
  const allyIds = selection.allyIds.filter((id) => id.length > 0);
  const targetIds = selection.targetIds.filter((id) => id.length > 0);
  const highValueTargetIds = selection.highValueTargetIds.filter((id) => id.length > 0);

  const sideNames = new Set(analysis.sideSummaries.map((side) => side.name));
  const allyMap = new Map(analysis.allyOptions.map((ally) => [ally.id, ally]));
  const targetMap = new Map(analysis.targetOptions.map((target) => [target.id, target]));

  if (!selection.controllableSideName.trim()) {
    issues.push("아군 세력명이 비어 있습니다.");
  } else if (!sideNames.has(selection.controllableSideName.trim())) {
    issues.push(`아군 세력명 '${selection.controllableSideName}'을 시나리오에서 찾지 못했습니다.`);
  }

  if (!selection.targetSideName.trim()) {
    issues.push("적 세력명이 비어 있습니다.");
  } else if (!sideNames.has(selection.targetSideName.trim())) {
    issues.push(`적 세력명 '${selection.targetSideName}'을 시나리오에서 찾지 못했습니다.`);
  }

  if (
    selection.controllableSideName.trim() &&
    selection.targetSideName.trim() &&
    selection.controllableSideName.trim() === selection.targetSideName.trim()
  ) {
    issues.push("아군 세력과 적 세력은 서로 달라야 합니다.");
  }

  if (allyIds.length === 0) {
    issues.push("학습에 사용할 아군 항공기 ID가 필요합니다.");
  }
  if (targetIds.length === 0) {
    issues.push("학습에 사용할 고정 표적 ID가 필요합니다.");
  }

  for (const allyId of allyIds) {
    const ally = allyMap.get(allyId);
    if (!ally) {
      issues.push(`아군 항공기 ID '${allyId}'를 시나리오에서 찾지 못했습니다.`);
      continue;
    }
    if (ally.sideName !== selection.controllableSideName.trim()) {
      issues.push(
        `아군 항공기 ID '${allyId}'는 세력 '${selection.controllableSideName}' 소속이 아닙니다.`
      );
    }
  }

  for (const targetId of targetIds) {
    const target = targetMap.get(targetId);
    if (!target) {
      issues.push(`고정 표적 ID '${targetId}'를 시나리오에서 찾지 못했습니다.`);
      continue;
    }
    if (target.sideName !== selection.targetSideName.trim()) {
      issues.push(
        `고정 표적 ID '${targetId}'는 세력 '${selection.targetSideName}' 소속이 아닙니다.`
      );
    }
  }

  for (const highValueTargetId of highValueTargetIds) {
    if (!targetIds.includes(highValueTargetId)) {
      issues.push(
        `고가치 표적 ID '${highValueTargetId}'는 선택한 고정 표적 목록 안에 있어야 합니다.`
      );
    }
  }

  return dedupe(issues);
}
