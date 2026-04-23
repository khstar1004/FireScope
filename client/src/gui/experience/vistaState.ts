import type { AssetExperienceSummary } from "@/gui/experience/assetExperience";
import type { BundleModelSelection } from "@/gui/experience/bundleModels";
import type { ImmersiveExperienceProfile } from "@/gui/experience/immersiveExperience";

export interface VistaLineupEntry {
  id: string;
  label: string;
  section: string;
  role: string;
  task: string;
  status: string;
  readinessPct: number;
  fuelPct: number;
  ordnancePct: number;
  coveragePct: number;
  primary: boolean;
}

export interface VistaSummary {
  headline: string;
  postureLabel: string;
  readinessPct: number;
  logisticsPct: number;
  coveragePct: number;
  warning: string;
}

export function clampVistaMetric(
  value: number,
  min: number,
  max: number
) {
  return Math.max(min, Math.min(max, value));
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function humanizeOperationMode(operationMode: string) {
  return operationMode
    .split("-")
    .map((token) =>
      token.length > 0 ? `${token[0].toUpperCase()}${token.slice(1)}` : token
    )
    .join(" ");
}

export function getVistaRangeReference(
  profile: ImmersiveExperienceProfile
) {
  switch (profile) {
    case "ground":
      return 10;
    case "fires":
      return 60;
    case "defense":
      return 140;
    case "maritime":
      return 240;
    case "base":
      return 120;
  }
}

export function getVistaWeaponReference(
  profile: ImmersiveExperienceProfile
) {
  switch (profile) {
    case "ground":
      return 3;
    case "fires":
      return 5;
    case "defense":
      return 6;
    case "maritime":
      return 8;
    case "base":
      return 10;
  }
}

function buildBaseFuelScore(asset: AssetExperienceSummary) {
  if (
    asset.currentFuel !== undefined &&
    asset.maxFuel !== undefined &&
    asset.maxFuel > 0
  ) {
    return clampVistaMetric(
      (asset.currentFuel / asset.maxFuel) * 100,
      20,
      100
    );
  }

  if (asset.kind === "airbase") {
    return clampVistaMetric(((asset.aircraftCount ?? 0) / 12) * 100, 36, 98);
  }

  return asset.kind === "ship" ? 74 : asset.kind === "facility" ? 81 : 78;
}

function buildBaseOrdnanceScore(
  asset: AssetExperienceSummary,
  profile: ImmersiveExperienceProfile
) {
  if (
    asset.currentQuantity !== undefined &&
    asset.maxQuantity !== undefined &&
    asset.maxQuantity > 0
  ) {
    return clampVistaMetric(
      (asset.currentQuantity / asset.maxQuantity) * 100,
      18,
      100
    );
  }

  if (asset.kind === "airbase") {
    return clampVistaMetric(((asset.aircraftCount ?? 0) / 10) * 100, 34, 96);
  }

  return clampVistaMetric(
    ((asset.weaponCount ?? 0) / getVistaWeaponReference(profile)) * 100,
    28,
    100
  );
}

function buildBaseCoverageScore(
  asset: AssetExperienceSummary,
  profile: ImmersiveExperienceProfile
) {
  if (asset.range !== undefined) {
    return clampVistaMetric(
      (asset.range / getVistaRangeReference(profile)) * 100,
      24,
      100
    );
  }

  if (asset.kind === "airbase") {
    return clampVistaMetric(((asset.aircraftCount ?? 0) / 8) * 100, 46, 96);
  }

  return profile === "ground" ? 62 : 70;
}

export function getVistaSectionLabels(
  profile: ImmersiveExperienceProfile
) {
  switch (profile) {
    case "ground":
      return ["SPEAR", "SHIELD", "SCOUT", "C2", "RESERVE"];
    case "fires":
      return ["ALPHA", "BRAVO", "COUNTERFIRE", "SUPPORT", "DEEP"];
    case "defense":
      return ["SENSOR", "OUTER ARC", "INNER ARC", "POINT", "RESERVE"];
    case "maritime":
      return ["FLAG", "SCREEN", "ASW", "LOGISTICS", "RESERVE"];
    case "base":
      return ["ALERT", "SCRAMBLE", "ROTARY", "ISR", "RECOVERY"];
  }
}

export function getVistaModelRole(
  profile: ImmersiveExperienceProfile,
  model: BundleModelSelection
) {
  const signature = `${model.id} ${model.label}`.toLowerCase();

  switch (profile) {
    case "ground":
      if (/\b(k2|tracked)\b/.test(signature)) return "돌파 전차";
      if (/\b(k21|m113)\b/.test(signature)) return "기동 보병";
      if (/\b(stryker|km900)\b/.test(signature)) return "차륜 기동";
      if (/\b(m577|command)\b/.test(signature)) return "전술 지휘";
      return "지상 전력";
    case "fires":
      if (/\b(hyunmoo|roketsan|rocket)\b/.test(signature)) return "장거리 타격";
      if (/\b(k9|paladin|d-30|howitzer)\b/.test(signature)) return "포대 화력";
      if (/\b(nasams|patriot|thaad)\b/.test(signature)) return "연동 방공";
      return "화력 지원";
    case "defense":
      if (/\b(thaad)\b/.test(signature)) return "상층 요격";
      if (/\b(patriot)\b/.test(signature)) return "중층 방어";
      if (/\b(nasams)\b/.test(signature)) return "기동 방공";
      if (/\b(k9)\b/.test(signature)) return "직접 화력";
      return "방어 지원";
    case "maritime":
      if (/\b(carrier)\b/.test(signature)) return "기동 전단";
      if (/\b(submarine)\b/.test(signature)) return "수중 경계";
      if (/\b(tanker)\b/.test(signature)) return "해상 보급";
      return /\b(yi sun|destroyer)\b/.test(signature)
        ? "방공 호위"
        : "수상 전력";
    case "base":
      if (/\b(drone)\b/.test(signature)) return "ISR 감시";
      if (/\b(apache|blackhawk)\b/.test(signature)) return "기동 지원";
      if (/\b(f-35|kf-21|f-15|f-16)\b/.test(signature)) return "출격 편대";
      return "기지 지원";
  }
}

export function getVistaTaskLabel(
  profile: ImmersiveExperienceProfile,
  operationMode: string,
  index: number,
  primary: boolean
) {
  const mode = humanizeOperationMode(operationMode);

  switch (profile) {
    case "ground":
      return primary
        ? `${mode} 주공축`
        : index === 1
          ? "측방 엄호"
          : "후속 투입";
    case "fires":
      return primary
        ? `${mode} 타격축`
        : index === 1
          ? "카운터파이어"
          : "재장전 대기";
    case "defense":
      return primary
        ? `${mode} 교전통제`
        : index === 1
          ? "외곽 요격"
          : "근접 방어";
    case "maritime":
      return primary
        ? `${mode} 기함 축`
        : index === 1
          ? "측면 경계"
          : "후방 지원";
    case "base":
      return primary
        ? `${mode} 주기 편성`
        : index === 1
          ? "즉응 대기"
          : "보조 출격선";
  }
}

export function getVistaStatusLabel(
  profile: ImmersiveExperienceProfile,
  readinessPct: number,
  fuelPct: number,
  ordnancePct: number
) {
  if (readinessPct < 58 || fuelPct < 45) {
    return profile === "base" ? "재정비" : "재보급";
  }

  if (ordnancePct < 50) {
    return profile === "defense" ? "재장전" : "재무장";
  }

  if (readinessPct >= 86) {
    return profile === "maritime"
      ? "해상 전개"
      : profile === "base"
        ? "즉응 출격"
        : "즉응 대기";
  }

  return profile === "ground" ? "축선 정렬" : "전개 유지";
}

export function buildVistaLineup(
  asset: AssetExperienceSummary,
  profile: ImmersiveExperienceProfile,
  activeModel: BundleModelSelection | null,
  selectedModels: BundleModelSelection[],
  operationMode: string
) {
  if (!activeModel) {
    return [] as VistaLineupEntry[];
  }

  const lineupModels = [
    activeModel,
    ...selectedModels.filter((model) => model.id !== activeModel.id),
  ].slice(0, 5);
  const sectionLabels = getVistaSectionLabels(profile);
  const baseFuelPct = buildBaseFuelScore(asset);
  const baseOrdnancePct = buildBaseOrdnanceScore(asset, profile);
  const baseCoveragePct = buildBaseCoverageScore(asset, profile);

  return lineupModels.map((model, index) => {
    const primary = index === 0;
    const fuelPct = clampVistaMetric(
      baseFuelPct - index * 6 + (primary ? 5 : 0),
      28,
      100
    );
    const ordnancePct = clampVistaMetric(
      baseOrdnancePct - index * 7 + (primary ? 6 : 0),
      24,
      100
    );
    const coveragePct = clampVistaMetric(
      baseCoveragePct - index * 4 + (primary ? 4 : 0),
      24,
      100
    );
    const readinessPct = Math.round(
      clampVistaMetric(
        fuelPct * 0.34 + ordnancePct * 0.33 + coveragePct * 0.33,
        0,
        100
      )
    );

    return {
      id: model.id,
      label: model.label,
      section: sectionLabels[index] ?? sectionLabels[sectionLabels.length - 1],
      role: getVistaModelRole(profile, model),
      task: getVistaTaskLabel(profile, operationMode, index, primary),
      status: getVistaStatusLabel(
        profile,
        readinessPct,
        fuelPct,
        ordnancePct
      ),
      readinessPct,
      fuelPct: Math.round(fuelPct),
      ordnancePct: Math.round(ordnancePct),
      coveragePct: Math.round(coveragePct),
      primary,
    };
  });
}

export function buildVistaSummary(
  asset: AssetExperienceSummary,
  profile: ImmersiveExperienceProfile,
  lineup: VistaLineupEntry[]
): VistaSummary {
  const readinessPct = Math.round(
    average(lineup.map((entry) => entry.readinessPct))
  );
  const logisticsPct = Math.round(
    average(lineup.map((entry) => (entry.fuelPct + entry.ordnancePct) / 2))
  );
  const coveragePct = Math.round(
    average(lineup.map((entry) => entry.coveragePct))
  );
  const postureLabel =
    readinessPct >= 85 ? "GREEN" : readinessPct >= 68 ? "AMBER" : "RED";

  let headline = "VISTA";
  switch (profile) {
    case "ground":
      headline = `${asset.name} 기동대`;
      break;
    case "fires":
      headline = `${asset.name} 화력망`;
      break;
    case "defense":
      headline = `${asset.name} 방어망`;
      break;
    case "maritime":
      headline = `${asset.name} 전투단`;
      break;
    case "base":
      headline = `${asset.name} 운용 셀`;
      break;
  }

  const warning =
    logisticsPct < 55
      ? "연료 또는 잔여 탄약 여유가 부족합니다."
      : coveragePct < 62
        ? "센서/교전 커버리지가 좁아 추가 전개가 필요합니다."
        : "현재 편성과 운용 상태가 브리프 기준선 안에 있습니다.";

  return {
    headline,
    postureLabel,
    readinessPct,
    logisticsPct,
    coveragePct,
    warning,
  };
}
