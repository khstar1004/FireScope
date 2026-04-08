import type { AssetExperienceSummary } from "@/gui/experience/assetExperience";
import type { BundleModelSelection } from "@/gui/experience/bundleModels";
import {
  getImmersiveOperationOptions,
  type ImmersiveOperationOption,
} from "@/gui/experience/immersiveOperations";
import type { ImmersiveExperienceProfile } from "@/gui/experience/immersiveExperience";

export type ExperienceCameraCue =
  | "chase"
  | "operator"
  | "topdown"
  | "projectile"
  | "impact"
  | "radar"
  | "bridge"
  | "command";

export interface ExperienceTheme {
  labOverline: string;
  labTitle: string;
  labDescription: string;
  opsOverline: string;
  opsTitle: string;
  opsDescription: string;
  accentColor: string;
  glowColor: string;
  background: string;
}

export interface ExperienceInterfaceBlock {
  title: string;
  description: string;
}

export interface ExperienceMissionPhase {
  id: string;
  title: string;
  objective: string;
  instruction: string;
  cameraCue: ExperienceCameraCue;
  successHint: string;
}

export interface ExperienceMissionPlan {
  title: string;
  operatorRole: string;
  pageIdentity: string;
  environmentLabel: string;
  hudModeLabel: string;
  defaultCameraMode: ExperienceCameraCue;
  launchLabel: string;
  briefingTitle: string;
  briefingSummary: string;
  missionStatement: string;
  interfaceBlocks: ExperienceInterfaceBlock[];
  coreLoops: string[];
  missionPhases: ExperienceMissionPhase[];
  outcomes: string[];
  freePlayLabel: string;
}

export type ExperienceMovementType =
  | "tracked"
  | "wheeled"
  | "launcher"
  | "air-defense"
  | "ship"
  | "jet"
  | "rotary"
  | "drone";

export type ExperienceSpawnMode =
  | "road"
  | "battery"
  | "defense-pad"
  | "sea-lane"
  | "runway"
  | "helipad"
  | "drone-pad";

export interface ExperienceModelRuntime {
  modelId: string;
  modelPath: string;
  label: string;
  movementType: ExperienceMovementType;
  spawnMode: ExperienceSpawnMode;
  scale: number;
  minimumPixelSize: number;
  maxSpeedMps: number;
  reverseSpeedMps: number;
  turnRateDeg: number;
  chaseDistance: number;
  chaseHeight: number;
  operatorDistance: number;
  operatorHeight: number;
  topDownHeight: number;
  projectileDistance: number;
  projectileHeight: number;
  impactDistance: number;
  impactHeight: number;
  threatOffsetM: number;
}

function getOperationOption(
  profile: ImmersiveExperienceProfile,
  operationMode: string
) {
  return (
    getImmersiveOperationOptions(profile).find(
      (option) => option.id === operationMode
    ) ?? getImmersiveOperationOptions(profile)[0]
  );
}

export function getExperienceTheme(
  profile: ImmersiveExperienceProfile
): ExperienceTheme {
  switch (profile) {
    case "ground":
      return {
        labOverline: "FIRE SCOPE GROUND ASSAULT LAB",
        labTitle: "지상 기동 쇼룸",
        labDescription:
          "전차와 장갑 플랫폼을 크게 띄우고 차체 실루엣, 포탑 축, 기동 감각을 먼저 확인합니다.",
        opsOverline: "FIRE SCOPE GROUND ASSAULT OPS",
        opsTitle: "지상 기동 3D 실전체험",
        opsDescription:
          "실제 지도 위에서 장갑 플랫폼을 움직이며 도로 축을 따라 전진하고, 주포와 유도탄을 발사합니다.",
        accentColor: "#b5e37a",
        glowColor: "#7ef0d2",
        background:
          "radial-gradient(circle at top, #304124 0%, #10150d 42%, #050604 100%)",
      };
    case "fires":
      return {
        labOverline: "FIRE SCOPE FIRES COMMAND LAB",
        labTitle: "화력 플랫폼 쇼룸",
        labDescription:
          "포대와 런처를 발사 자세로 보여주고, 살보 방향과 탄도 감각을 미리 확인합니다.",
        opsOverline: "FIRE SCOPE FIRES STRIKE OPS",
        opsTitle: "화력 운용 3D 실전체험",
        opsDescription:
          "실제 3D 지도에서 포대/런처를 배치하고 발사부터 비행, 착탄 폭발까지 한 흐름으로 추적합니다.",
        accentColor: "#ffb15a",
        glowColor: "#ffd768",
        background:
          "radial-gradient(circle at top, #492811 0%, #150d0a 42%, #050404 100%)",
      };
    case "defense":
      return {
        labOverline: "FIRE SCOPE AIR DEFENSE LAB",
        labTitle: "방공 체계 쇼룸",
        labDescription:
          "레이더, 발사기, 요격 범위를 레이더 콘솔처럼 정리해 계층 방어 구조를 먼저 이해합니다.",
        opsOverline: "FIRE SCOPE AIR DEFENSE OPS",
        opsTitle: "방공 체계 3D 실전체험",
        opsDescription:
          "실제 3D 지도에서 표적을 탐지하고, 우선순위를 정해 요격 미사일을 발사한 뒤 공중 폭발까지 추적합니다.",
        accentColor: "#72f0d0",
        glowColor: "#8dd9ff",
        background:
          "radial-gradient(circle at top, #173531 0%, #081211 42%, #030606 100%)",
      };
    case "maritime":
      return {
        labOverline: "FIRE SCOPE MARITIME CONTROL LAB",
        labTitle: "해상 전력 쇼룸",
        labDescription:
          "함정 실루엣과 갑판 구성을 비교하고, 선택한 함형을 그대로 해역 임무에 넘깁니다.",
        opsOverline: "FIRE SCOPE MARITIME TASK OPS",
        opsTitle: "함정 운용 3D 실전체험",
        opsDescription:
          "실제 3D 해역에서 함정을 기동하고, 함포와 대함 미사일의 발사-비행-착탄 흐름을 모두 봅니다.",
        accentColor: "#74d8ff",
        glowColor: "#75f0dd",
        background:
          "radial-gradient(circle at top, #123446 0%, #09121b 42%, #03070b 100%)",
      };
    case "base":
      return {
        labOverline: "FIRE SCOPE BASE OPERATIONS LAB",
        labTitle: "기지 대응 쇼룸",
        labDescription:
          "전투기, 헬기, 드론을 기지 디오라마 위에 올려두고 어떤 자산을 즉응 출격시킬지 고릅니다.",
        opsOverline: "FIRE SCOPE BASE RESPONSE OPS",
        opsTitle: "기지 운용 3D 실전체험",
        opsDescription:
          "실제 3D 지도 위 기지 구역에서 선택한 항공 자산을 출격시키고, 주변 위협에 대한 방호와 대응 흐름을 지휘합니다.",
        accentColor: "#d9c181",
        glowColor: "#8fd9ff",
        background:
          "radial-gradient(circle at top, #413421 0%, #120f0b 42%, #050403 100%)",
      };
  }
}

function buildMissionSummary(
  asset: AssetExperienceSummary,
  model: BundleModelSelection | null,
  option: ImmersiveOperationOption
) {
  const modelLabel = model?.label ?? asset.name;
  return `${option.note}. 쇼룸에서 고른 ${modelLabel} 모델을 그대로 들고 들어가 실제 지도 위에서 임무 흐름을 체험합니다.`;
}

export function buildExperienceMissionPlan(
  profile: ImmersiveExperienceProfile,
  operationMode: string,
  asset: AssetExperienceSummary,
  model: BundleModelSelection | null
): ExperienceMissionPlan {
  const option = getOperationOption(profile, operationMode);
  const summary = buildMissionSummary(asset, model, option);

  switch (profile) {
    case "ground":
      return {
        title: `${option.label} Ground Mission`,
        operatorRole: "차량장 / 포수",
        pageIdentity: "추적 카메라와 포수 관측 축이 중심인 직접 기동형 페이지",
        environmentLabel: "도로 축 + 교차로 + 전진 거점",
        hudModeLabel: "Driver Strip / Gunner Cue / Threat Lane",
        defaultCameraMode: "chase",
        launchLabel: "실전 투입",
        briefingTitle: "지상 기동 브리프",
        briefingSummary: summary,
        missionStatement:
          "장갑 플랫폼을 전진 축에 투입하고, 위협을 지정해 주포와 유도탄으로 축을 정리합니다.",
        interfaceBlocks: [
          {
            title: "Driver Strip",
            description: "속도, 기동축, 차체 방향을 하단에 고정합니다.",
          },
          {
            title: "Gunner Cue",
            description:
              "표적 거리, 발사 가능 상태, 포수 추적 카메라를 제공합니다.",
          },
          {
            title: "Threat Lane",
            description: "정면 위협과 우선 표적을 우측 스트립에 정렬합니다.",
          },
        ],
        coreLoops: [
          "차체는 도로 축을 따라 전진하고 포탑은 별도로 표적을 추적합니다.",
          "주포는 즉응 타격, 보조 유도탄은 장거리 표적 제거에 사용합니다.",
          "발사 순간에는 미사일 또는 탄도를 따라가며 교전 결과를 끝까지 확인합니다.",
        ],
        missionPhases: [
          {
            id: "ingress",
            title: "도로 축 진입",
            objective: "전진 거점까지 기동해 교전 축을 확보합니다.",
            instruction:
              "차체를 도로 방향으로 맞추고 추적 시점에서 이동을 시작합니다.",
            cameraCue: "chase",
            successHint: "기동축에 올라서면 포수 큐가 활성화됩니다.",
          },
          {
            id: "designation",
            title: "우선 표적 지정",
            objective:
              "전차, IFV, 후방 화력 차량 중 먼저 제거할 대상을 선택합니다.",
            instruction: "클릭으로 우선 표적을 찍고 포수 시점으로 전환합니다.",
            cameraCue: "operator",
            successHint: "선택 표적은 HUD와 링 마커로 고정됩니다.",
          },
          {
            id: "engagement",
            title: "주포 / ATGM 교전",
            objective: "주포와 유도탄을 나눠 쓰며 축을 청소합니다.",
            instruction:
              "근거리 표적은 주포, 원거리 고위협 표적은 보조 무장을 사용합니다.",
            cameraCue: "projectile",
            successHint:
              "보조 무장 발사 시 미사일 추적 카메라가 자동으로 연결됩니다.",
          },
          {
            id: "freeplay",
            title: "축 확보 후 자유 기동",
            objective:
              "잔여 표적을 정리하고 원하는 각도에서 차량을 운용합니다.",
            instruction: "필요 시 상공 카메라로 돌아가 전장을 다시 훑습니다.",
            cameraCue: "topdown",
            successHint: "모든 표적 제거 후 자유 체험으로 전환됩니다.",
          },
        ],
        outcomes: [
          "도로 위 추적 주행과 포탑 교전이 동시에 살아 있어야 합니다.",
          "주포와 ATGM의 감각이 분리되어 보여야 합니다.",
          "폭발 결과를 바로 확인할 수 있어야 합니다.",
        ],
        freePlayLabel: "축 확보 후 자유 기동",
      };
    case "fires":
      return {
        title: `${option.label} Fires Mission`,
        operatorRole: "사격통제 / 포대장",
        pageIdentity:
          "지휘형 탑뷰와 발사체 추적 카메라가 핵심인 화력 통제 페이지",
        environmentLabel: "발사 진지 + 목표 격자 + 종심 표적지",
        hudModeLabel: "Fire Mission Board / Time-To-Impact / Strike Camera",
        defaultCameraMode: "topdown",
        launchLabel: "화력 임무 개시",
        briefingTitle: "화력 운용 브리프",
        briefingSummary: summary,
        missionStatement:
          "목표 격자를 지정하고, 발사에서 비행, 착탄, 폭발까지 하나의 연속 장면으로 보여줍니다.",
        interfaceBlocks: [
          {
            title: "Fire Mission Board",
            description:
              "현재 표적 격자, 살보 수, 다음 발사 준비 상태를 표시합니다.",
          },
          {
            title: "TTI Strip",
            description:
              "탄체 비행 중 남은 시간과 종말 방향을 실시간으로 보여줍니다.",
          },
          {
            title: "Strike Camera",
            description:
              "발사 후 자동으로 탄체를 추적하고 최종 폭발을 확대합니다.",
          },
        ],
        coreLoops: [
          "발사 전에는 지휘형 탑뷰로 포대와 목표 구역을 함께 봅니다.",
          "발사 후에는 카메라가 탄체를 따라가며 종말 구간과 착탄 폭발을 강조합니다.",
          "단발과 집중 살보의 템포가 서로 다르게 느껴져야 합니다.",
        ],
        missionPhases: [
          {
            id: "deploy",
            title: "발사 진지 정렬",
            objective: "포대 축과 발사 방향을 맞춥니다.",
            instruction: "탑뷰에서 목표 방위를 잡고 발사 가능 각을 확보합니다.",
            cameraCue: "topdown",
            successHint: "발사 방향이 확보되면 목표 격자가 강조됩니다.",
          },
          {
            id: "designation",
            title: "목표 격자 지정",
            objective: "지휘 차량, 보급대, 적 포대를 우선순위로 지정합니다.",
            instruction: "클릭으로 표적을 지정하면 통제 패널이 갱신됩니다.",
            cameraCue: "operator",
            successHint: "우선 표적은 발사 보드 상단에 고정됩니다.",
          },
          {
            id: "launch",
            title: "살보 발사",
            objective: "단발 또는 다연장 살보를 발사합니다.",
            instruction:
              "주무장과 보조무장을 나눠 쓰며 발사 템포를 조절합니다.",
            cameraCue: "projectile",
            successHint: "카메라는 자동으로 탄체를 따라갑니다.",
          },
          {
            id: "impact",
            title: "착탄 및 전과 확인",
            objective: "최종 폭발과 피해 범위를 확인합니다.",
            instruction:
              "폭발 직전에는 종말 카메라, 폭발 직후에는 영향 반경을 보여줍니다.",
            cameraCue: "impact",
            successHint: "폭발 후에는 다시 통제 탑뷰로 복귀합니다.",
          },
        ],
        outcomes: [
          "발사체 추적과 폭발 연출이 체험의 중심이어야 합니다.",
          "포대 지휘형 UI가 지상 기동 페이지와 명확히 달라야 합니다.",
          "목표 구역과 착탄 반경이 한눈에 읽혀야 합니다.",
        ],
        freePlayLabel: "전과 확인 후 자유 사격",
      };
    case "defense":
      return {
        title: `${option.label} Defense Mission`,
        operatorRole: "방공 통제관",
        pageIdentity: "레이더 스코프와 위협 큐가 중심인 요격 지휘형 페이지",
        environmentLabel: "보호 구역 + 센서 링 + 공중 침투 축",
        hudModeLabel: "Radar Scope / Threat Queue / Interceptor Board",
        defaultCameraMode: "radar",
        launchLabel: "방공망 전개",
        briefingTitle: "방공 체계 브리프",
        briefingSummary: summary,
        missionStatement:
          "보호 구역으로 들어오는 항공기, 드론, 순항미사일을 탐지하고 계층별로 요격합니다.",
        interfaceBlocks: [
          {
            title: "Radar Scope",
            description: "센서 커버리지와 접근 축을 상시 탑뷰로 보여줍니다.",
          },
          {
            title: "Threat Queue",
            description:
              "가장 위험한 표적부터 순서대로 정렬하고 우선순위를 고정합니다.",
          },
          {
            title: "Interceptor Board",
            description:
              "근접 요격 / 장거리 요격 재고와 발사 상태를 구분합니다.",
          },
        ],
        coreLoops: [
          "먼저 탐지하고, 그 다음 표적 우선순위를 정한 뒤 발사 여부를 결정합니다.",
          "요격탄 발사 후에는 미사일 추적 카메라가 공중 요격 순간까지 이어집니다.",
          "보호 구역을 뚫린 위협 없이 유지하는 것이 체험의 핵심입니다.",
        ],
        missionPhases: [
          {
            id: "search",
            title: "센서 탐색",
            objective: "보호 구역에 접근하는 공중 위협을 포착합니다.",
            instruction: "레이더 스코프로 접근 축을 먼저 읽습니다.",
            cameraCue: "radar",
            successHint: "레이더 링 안의 표적이 자동 큐에 적재됩니다.",
          },
          {
            id: "lock",
            title: "우선순위 지정",
            objective: "순항미사일과 침투기 중 먼저 막을 대상을 고릅니다.",
            instruction:
              "클릭으로 표적을 고정하고 필요 시 장거리 요격으로 전환합니다.",
            cameraCue: "topdown",
            successHint: "고정 표적은 위협 큐 최상단으로 이동합니다.",
          },
          {
            id: "intercept",
            title: "요격 발사",
            objective: "요격탄을 발사해 공중에서 제거합니다.",
            instruction: "근접과 장거리 요격을 섞어 쓰며 탄 재고를 관리합니다.",
            cameraCue: "projectile",
            successHint:
              "미사일 추적 카메라가 자동으로 목표 근처까지 따라갑니다.",
          },
          {
            id: "hold",
            title: "보호 구역 유지",
            objective: "남은 위협을 정리하고 보호 구역을 지켜냅니다.",
            instruction: "레이더 탑뷰로 복귀해 잔여 위협을 점검합니다.",
            cameraCue: "radar",
            successHint: "모든 웨이브를 막으면 자유 방공 체험으로 넘어갑니다.",
          },
        ],
        outcomes: [
          "레이더 기반 화면 구조가 다른 페이지와 명확히 달라야 합니다.",
          "요격 미사일 추적과 공중 폭발이 끝까지 보여야 합니다.",
          "보호 대상과 잔여 위협 상태가 항상 읽혀야 합니다.",
        ],
        freePlayLabel: "방어 성공 후 자유 요격",
      };
    case "maritime":
      return {
        title: `${option.label} Maritime Mission`,
        operatorRole: "함교 전술관",
        pageIdentity: "함교 추적 시점과 접촉 표가 결합된 해상 전술 페이지",
        environmentLabel: "초계 박스 + 해상 접촉 + 대함 교전 구역",
        hudModeLabel: "Bridge Feed / Contact Board / Strike Camera",
        defaultCameraMode: "bridge",
        launchLabel: "해상 임무 개시",
        briefingTitle: "해상 전력 브리프",
        briefingSummary: summary,
        missionStatement:
          "선택한 함형으로 초계 박스를 통과하고, 접촉 표를 정리하며 함포와 대함 미사일을 운용합니다.",
        interfaceBlocks: [
          {
            title: "Bridge Feed",
            description: "함정 진행 방향과 속력을 추적 시점에서 보여줍니다.",
          },
          {
            title: "Contact Board",
            description: "수상 / 공중 접촉을 구분해 우측 리스트에 정리합니다.",
          },
          {
            title: "Strike Camera",
            description:
              "미사일 발사 후 해상 스키밍 비행과 착탄 폭발을 추적합니다.",
          },
        ],
        coreLoops: [
          "함교 시점과 전술 탑뷰를 오가며 초계 박스를 유지합니다.",
          "수상 표적과 공중 위협을 분리해서 판단합니다.",
          "함포와 대함 미사일은 발사 템포와 카메라 연출이 달라야 합니다.",
        ],
        missionPhases: [
          {
            id: "patrol",
            title: "초계 항로 진입",
            objective: "초계 박스에 맞춰 함을 정렬합니다.",
            instruction: "함교 추적 시점에서 속력을 맞추고 항로를 잡습니다.",
            cameraCue: "bridge",
            successHint: "초계 박스 안으로 들어가면 접촉 표가 활성화됩니다.",
          },
          {
            id: "classify",
            title: "접촉 식별",
            objective: "고속정, 코르벳, 헬기 중 우선 위협을 구분합니다.",
            instruction:
              "클릭으로 접촉을 고정하고 탑뷰에서 거리를 재확인합니다.",
            cameraCue: "topdown",
            successHint: "선택 접촉은 함교 HUD에 고정됩니다.",
          },
          {
            id: "engage",
            title: "함포 / 대함미사일 교전",
            objective: "거리별로 무장을 바꿔 교전합니다.",
            instruction:
              "근접 표적은 함포, 원거리 위협은 보조 무장으로 처리합니다.",
            cameraCue: "projectile",
            successHint: "보조 무장은 해상 추적 카메라가 자동으로 연결됩니다.",
          },
          {
            id: "assess",
            title: "착탄 확인",
            objective: "해상 폭발과 잔여 위협을 평가합니다.",
            instruction: "착탄 직후에는 폭발 원형과 파편 반응을 확인합니다.",
            cameraCue: "impact",
            successHint: "평가 후 함교 시점으로 복귀합니다.",
          },
        ],
        outcomes: [
          "함정 특유의 느린 선회와 항속 감각이 살아 있어야 합니다.",
          "접촉 표 기반 UI가 지상/방공 페이지와 달라야 합니다.",
          "대함 미사일은 발사 후 끝까지 추적되어야 합니다.",
        ],
        freePlayLabel: "교전 종료 후 자유 항해",
      };
    case "base":
      return {
        title: `${option.label} Base Response Mission`,
        operatorRole: "기지 대응 통제관",
        pageIdentity:
          "상공 지휘 시점과 출격 큐를 중심으로 움직이는 기지 운영형 페이지",
        environmentLabel: "활주로 축 + 격납 라인 + 기지 외곽 경계",
        hudModeLabel: "Airfield Command Grid / Scramble Rack / Response Feed",
        defaultCameraMode: "command",
        launchLabel: "기지 대응 개시",
        briefingTitle: "기지 운용 브리프",
        briefingSummary: summary,
        missionStatement:
          "기지 경보가 울리면 선택한 항공 자산을 출격시키고, 동시에 기지 방호 체계로 주변 침투 위협을 막아냅니다.",
        interfaceBlocks: [
          {
            title: "Airfield Command Grid",
            description:
              "활주로, 격납고, 외곽 경계 구역을 상공에서 관리합니다.",
          },
          {
            title: "Scramble Rack",
            description:
              "현재 선택한 자산과 대기 / 출격 / 귀환 상태를 표시합니다.",
          },
          {
            title: "Response Feed",
            description:
              "포인트 디펜스와 출격 자산의 대응 결과를 함께 추적합니다.",
          },
        ],
        coreLoops: [
          "기본 카메라는 상공 지휘 시점이며, 직접 차량 조작 페이지처럼 보이면 안 됩니다.",
          "선택한 항공 자산은 기지에서 출발해 위협으로 향하고, 대응 후 복귀할 수 있어야 합니다.",
          "기지 외곽 위협은 포인트 디펜스와 출격 자산이 나눠 처리해야 합니다.",
        ],
        missionPhases: [
          {
            id: "alert",
            title: "경보 발령",
            objective: "기지 주변 위협과 침투 축을 파악합니다.",
            instruction:
              "상공 지휘 시점에서 활주로와 외곽 경계를 먼저 확인합니다.",
            cameraCue: "command",
            successHint: "위협이 감지되면 스크램블 랙이 활성화됩니다.",
          },
          {
            id: "scramble",
            title: "선택 자산 출격",
            objective: "선택한 전투기, 헬기, 드론을 대응 임무에 올립니다.",
            instruction:
              "보조 무장 키로 출격을 승인하면 자산이 자동으로 응답합니다.",
            cameraCue: "topdown",
            successHint:
              "출격 자산은 기지에서 실제로 이륙 또는 이륙에 준하는 동작으로 분리됩니다.",
          },
          {
            id: "response",
            title: "포인트 디펜스 / 출격 자산 대응",
            objective:
              "근거리 위협은 포인트 디펜스로, 외곽 위협은 출격 자산으로 처리합니다.",
            instruction: "직접 사격과 출격 자산 추적을 섞어 사용합니다.",
            cameraCue: "projectile",
            successHint: "대응 중에는 선택 자산 추적 시점으로 잠깐 전환됩니다.",
          },
          {
            id: "recover",
            title: "활주로 복구 및 자유 운영",
            objective: "잔여 위협 정리 후 기지 운영 상태를 회복합니다.",
            instruction:
              "상공 지휘 시점으로 돌아와 기지 전체 상태를 확인합니다.",
            cameraCue: "command",
            successHint: "위협 해소 후 자유 운용으로 전환됩니다.",
          },
        ],
        outcomes: [
          "기지 페이지는 다른 페이지와 달리 지휘형 시점이 기본이어야 합니다.",
          "선택한 항공 자산이 기지에서 출발해 실제로 대응하는 느낌이 있어야 합니다.",
          "포인트 디펜스와 출격 대응이 동시에 보이는 것이 중요합니다.",
        ],
        freePlayLabel: "위협 해소 후 자유 운영",
      };
  }
}

function createModelRuntime(
  selection: BundleModelSelection,
  values: Omit<ExperienceModelRuntime, "modelId" | "modelPath" | "label">
): ExperienceModelRuntime {
  return {
    modelId: selection.id,
    modelPath: selection.path,
    label: selection.label,
    ...values,
  };
}

function getProfileModelDefaults(
  selection: BundleModelSelection,
  profile: ImmersiveExperienceProfile
) {
  switch (profile) {
    case "ground":
      return createModelRuntime(selection, {
        movementType: "tracked",
        spawnMode: "road",
        scale: 1.6,
        minimumPixelSize: 78,
        maxSpeedMps: 15,
        reverseSpeedMps: 4,
        turnRateDeg: 46,
        chaseDistance: 34,
        chaseHeight: 13,
        operatorDistance: 18,
        operatorHeight: 6,
        topDownHeight: 540,
        projectileDistance: 42,
        projectileHeight: 16,
        impactDistance: 96,
        impactHeight: 46,
        threatOffsetM: 90,
      });
    case "fires":
      return createModelRuntime(selection, {
        movementType: "launcher",
        spawnMode: "battery",
        scale: 1.7,
        minimumPixelSize: 82,
        maxSpeedMps: 9,
        reverseSpeedMps: 2,
        turnRateDeg: 28,
        chaseDistance: 38,
        chaseHeight: 18,
        operatorDistance: 24,
        operatorHeight: 12,
        topDownHeight: 820,
        projectileDistance: 30,
        projectileHeight: 22,
        impactDistance: 124,
        impactHeight: 72,
        threatOffsetM: 120,
      });
    case "defense":
      return createModelRuntime(selection, {
        movementType: "air-defense",
        spawnMode: "defense-pad",
        scale: 1.8,
        minimumPixelSize: 88,
        maxSpeedMps: 6,
        reverseSpeedMps: 2,
        turnRateDeg: 24,
        chaseDistance: 36,
        chaseHeight: 18,
        operatorDistance: 26,
        operatorHeight: 14,
        topDownHeight: 1100,
        projectileDistance: 34,
        projectileHeight: 26,
        impactDistance: 130,
        impactHeight: 76,
        threatOffsetM: 140,
      });
    case "maritime":
      return createModelRuntime(selection, {
        movementType: "ship",
        spawnMode: "sea-lane",
        scale: 2,
        minimumPixelSize: 104,
        maxSpeedMps: 16,
        reverseSpeedMps: 4,
        turnRateDeg: 18,
        chaseDistance: 110,
        chaseHeight: 42,
        operatorDistance: 62,
        operatorHeight: 18,
        topDownHeight: 1450,
        projectileDistance: 46,
        projectileHeight: 26,
        impactDistance: 150,
        impactHeight: 82,
        threatOffsetM: 180,
      });
    case "base":
      return createModelRuntime(selection, {
        movementType: "rotary",
        spawnMode: "helipad",
        scale: 1.65,
        minimumPixelSize: 92,
        maxSpeedMps: 54,
        reverseSpeedMps: 0,
        turnRateDeg: 20,
        chaseDistance: 70,
        chaseHeight: 26,
        operatorDistance: 40,
        operatorHeight: 20,
        topDownHeight: 900,
        projectileDistance: 36,
        projectileHeight: 24,
        impactDistance: 116,
        impactHeight: 64,
        threatOffsetM: 150,
      });
  }
}

export function getExperienceModelRuntime(
  selection: BundleModelSelection,
  profile: ImmersiveExperienceProfile
): ExperienceModelRuntime {
  const defaults = getProfileModelDefaults(selection, profile);

  switch (selection.id) {
    case "tank-km900":
      return {
        ...defaults,
        movementType: "wheeled",
        scale: 1.45,
        maxSpeedMps: 17,
      };
    case "tank-m577":
      return {
        ...defaults,
        movementType: "wheeled",
        scale: 1.42,
        chaseDistance: 30,
      };
    case "artillery-patriot":
      return {
        ...defaults,
        scale: 1.95,
        minimumPixelSize: 96,
        topDownHeight: 1200,
      };
    case "artillery-nasams":
      return {
        ...defaults,
        scale: 1.78,
        chaseDistance: 34,
      };
    case "artillery-thaad":
      return {
        ...defaults,
        scale: 2.15,
        minimumPixelSize: 106,
        projectileHeight: 34,
        impactHeight: 96,
      };
    case "artillery-hyunmoo":
      return {
        ...defaults,
        movementType: "launcher",
        scale: 1.95,
        projectileDistance: 40,
      };
    case "ship-carrier":
      return {
        ...defaults,
        scale: 3.2,
        minimumPixelSize: 168,
        chaseDistance: 170,
        topDownHeight: 1800,
      };
    case "ship-submarine":
      return {
        ...defaults,
        scale: 2.15,
        chaseDistance: 90,
        operatorHeight: 12,
      };
    case "drone-animated":
    case "drone-quad":
      return {
        ...defaults,
        movementType: "drone",
        spawnMode: "drone-pad",
        scale: 2.8,
        minimumPixelSize: 74,
        maxSpeedMps: 38,
        turnRateDeg: 32,
        chaseDistance: 42,
        chaseHeight: 22,
        topDownHeight: 720,
      };
    case "aircraft-apache":
      return {
        ...defaults,
        movementType: "rotary",
        spawnMode: "helipad",
        scale: 2.05,
        maxSpeedMps: 72,
        turnRateDeg: 26,
      };
    case "aircraft-blackhawk":
      return {
        ...defaults,
        movementType: "rotary",
        spawnMode: "helipad",
        scale: 2.05,
        maxSpeedMps: 68,
        chaseDistance: 74,
      };
    case "aircraft-f15-basic":
    case "aircraft-f15-lowpoly":
    case "aircraft-f15-strike":
    case "aircraft-kf21":
    case "aircraft-f16":
    case "aircraft-f35":
      return {
        ...defaults,
        movementType: "jet",
        spawnMode: "runway",
        scale:
          selection.id === "aircraft-f15-lowpoly"
            ? 3.1
            : selection.id === "aircraft-kf21"
              ? 2.45
              : 2.6,
        minimumPixelSize: 112,
        maxSpeedMps: 120,
        turnRateDeg: 18,
        chaseDistance: 96,
        chaseHeight: 32,
        topDownHeight: 1100,
      };
    default:
      return defaults;
  }
}
