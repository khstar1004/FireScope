import type Dba from "@/game/db/Dba";
import type { BundleViewerSceneProp } from "@/gui/experience/bundleSceneProps";
import { buildBundleViewerSceneProps } from "@/gui/experience/bundleSceneProps";
import {
  getBundleModelById,
  selectAssetExperienceModel,
  type BundleModelSelection,
} from "@/gui/experience/bundleModels";
import type { AssetExperienceSummary } from "@/gui/experience/assetExperience";
import {
  type DefenseConceptVariant,
  type DefenseVisualizationPolicy,
  resolveDefenseVisualizationPolicy,
} from "@/utils/airDefenseModeling";
import { getDisplayName, getEntityTypeLabel } from "@/utils/koreanCatalog";

export type AssetPlacementPreviewUnitType =
  | "aircraft"
  | "airbase"
  | "facility"
  | "ship";

export interface AssetPlacementPresetContext {
  regionLabel?: string;
  coverageLabel?: string;
  representativeAssetLabel?: string;
  sourceLabel?: string;
  threatAxisLabel?: string;
}

export interface AssetPlacementDeploymentDefaults {
  headingDegrees: number;
  arcDegrees?: number;
  recommendationLabel?: string;
  formation?: {
    unitCount: number;
    lateralSpacingKm: number;
    depthSpacingKm?: number;
    templateLabel?: string;
  };
}

export interface AssetPlacementVisualPolicyDetail {
  label: string;
  value: string;
}

export interface AssetPlacementPreview {
  unitType: AssetPlacementPreviewUnitType;
  unitClassName: string;
  displayName: string;
  entityLabel: string;
  asset: AssetExperienceSummary;
  previewMode: "mapped" | "closest" | "concept";
  previewBadgeLabel: string;
  previewTitle: string;
  previewDescription: string;
  presetContext: AssetPlacementPresetContext | null;
  deploymentDefaults: AssetPlacementDeploymentDefaults | null;
  conceptVariant: "airbase" | DefenseConceptVariant | null;
  visualPolicyDetails: AssetPlacementVisualPolicyDetail[];
  model: BundleModelSelection | null;
  sceneProps: BundleViewerSceneProp[];
}

interface AssetPlacementPreviewOptions {
  displayName?: string;
  previewBadgeLabel?: string;
  previewTitle?: string;
  previewDescription?: string;
  presetContext?: AssetPlacementPresetContext;
  deploymentDefaults?: AssetPlacementDeploymentDefaults;
}

function buildPreviewId(
  unitType: AssetPlacementPreviewUnitType,
  unitClassName: string
) {
  return `preview-${unitType}-${unitClassName}`;
}

function buildPreviewAsset(
  unitDb: Dba,
  sideName: string,
  unitType: AssetPlacementPreviewUnitType,
  unitClassName: string
): AssetExperienceSummary {
  switch (unitType) {
    case "aircraft": {
      const aircraftModel = unitDb.findAircraftModel(unitClassName);

      return {
        kind: "aircraft",
        id: buildPreviewId(unitType, unitClassName),
        name: unitClassName,
        className: unitClassName,
        sideName,
        latitude: 0,
        longitude: 0,
        altitude: 0,
        speed: aircraftModel?.speed,
        range: aircraftModel?.range,
        currentFuel: aircraftModel?.maxFuel,
        maxFuel: aircraftModel?.maxFuel,
        fuelRate: aircraftModel?.fuelRate,
      };
    }
    case "airbase": {
      const airbaseModel = unitDb.findAirbaseModel(unitClassName);

      return {
        kind: "airbase",
        id: buildPreviewId(unitType, unitClassName),
        name: airbaseModel?.name ?? unitClassName,
        className: airbaseModel?.name ?? unitClassName,
        sideName,
        latitude: airbaseModel?.latitude ?? 0,
        longitude: airbaseModel?.longitude ?? 0,
        altitude: 0,
      };
    }
    case "facility": {
      const facilityModel = unitDb.findFacilityModel(unitClassName);

      return {
        kind: "facility",
        id: buildPreviewId(unitType, unitClassName),
        name: unitClassName,
        className: unitClassName,
        sideName,
        latitude: 0,
        longitude: 0,
        altitude: 0,
        range: facilityModel?.range,
        weaponCount: 0,
      };
    }
    case "ship": {
      const shipModel = unitDb.findShipModel(unitClassName);

      return {
        kind: "ship",
        id: buildPreviewId(unitType, unitClassName),
        name: unitClassName,
        className: unitClassName,
        sideName,
        latitude: 0,
        longitude: 0,
        altitude: 0,
        speed: shipModel?.speed,
        range: shipModel?.range,
        currentFuel: shipModel?.maxFuel,
        maxFuel: shipModel?.maxFuel,
        fuelRate: shipModel?.fuelRate,
        weaponCount: 0,
        aircraftCount: 0,
      };
    }
  }

  throw new Error(`Unsupported preview unit type: ${unitType}`);
}

function buildDefensePolicyDetails(policy: DefenseVisualizationPolicy) {
  const specLabel =
    policy.threatRangeNm !== null && policy.detectionArcDegrees !== null
      ? `${policy.threatRangeNm} NM / ${policy.detectionArcDegrees}°`
      : policy.reasonLabel;
  const presentationLabel =
    policy.mode === "closest" && policy.proxyModelLabel
      ? `${policy.proxyModelLabel} 프록시`
      : `${policy.categoryLabel} 개념형`;

  return [
    { label: "방공 계층", value: policy.categoryLabel },
    { label: "표현 방식", value: presentationLabel },
    ...(policy.mode === "concept"
      ? [{ label: "개념 형상", value: policy.silhouetteLabel }]
      : []),
    { label: "제원 기준", value: specLabel },
    ...(policy.sourceLabel
      ? [{ label: "자료 근거", value: policy.sourceLabel }]
      : []),
  ];
}

function buildClosestDefensePreview(policy: DefenseVisualizationPolicy) {
  const model = policy.proxyVisualProfileId
    ? getBundleModelById(policy.proxyVisualProfileId)
    : null;

  return {
    previewMode: "closest" as const,
    previewBadgeLabel: "근접 대체 3D",
    previewTitle: policy.title,
    previewDescription: policy.description,
    conceptVariant: null,
    visualPolicyDetails: buildDefensePolicyDetails(policy),
    model,
  };
}

function resolvePreviewPresentation(
  asset: AssetExperienceSummary
): Pick<
  AssetPlacementPreview,
  | "previewMode"
  | "previewBadgeLabel"
  | "previewTitle"
  | "previewDescription"
  | "conceptVariant"
  | "visualPolicyDetails"
  | "model"
> {
  if (asset.kind === "airbase") {
    return {
      previewMode: "concept",
      previewBadgeLabel: "개념 프리뷰",
      previewTitle: "개념형 기지 프리뷰",
      previewDescription:
        "공군기지 전체를 나타내는 단일 3D 번들이 없어, 오해를 줄이기 위해 개념형 프리뷰로 표시합니다.",
      conceptVariant: "airbase",
      visualPolicyDetails: [
        { label: "표현 방식", value: "개념형 기지 레이아웃" },
        { label: "판단 기준", value: "단일 기지 GLB 부재" },
      ],
      model: null,
    };
  }

  if (asset.kind === "facility") {
    const defensePolicy = resolveDefenseVisualizationPolicy(
      asset.className,
      asset.name
    );
    if (defensePolicy?.mode === "closest") {
      return buildClosestDefensePreview(defensePolicy);
    }
    if (defensePolicy?.mode === "concept") {
      return {
        previewMode: "concept",
        previewBadgeLabel: "개념 프리뷰",
        previewTitle: defensePolicy.title,
        previewDescription: defensePolicy.description,
        conceptVariant: defensePolicy.conceptVariant,
        visualPolicyDetails: buildDefensePolicyDetails(defensePolicy),
        model: null,
      };
    }
  }

  const model = selectAssetExperienceModel(asset);

  return {
    previewMode: "mapped",
    previewBadgeLabel: model ? "3D 모델 연결" : "개념 프리뷰",
    previewTitle: model ? "연결된 3D 모델" : "개념형 프리뷰",
    previewDescription: model
      ? model.note
      : "정확하거나 충분히 가까운 GLB가 없어 개념형 프리뷰로 표시합니다.",
    conceptVariant: null,
    visualPolicyDetails: [],
    model,
  };
}

export function buildAssetPlacementPreview(
  unitDb: Dba,
  sideName: string,
  unitType: AssetPlacementPreviewUnitType,
  unitClassName: string,
  options?: AssetPlacementPreviewOptions
): AssetPlacementPreview {
  const asset = buildPreviewAsset(unitDb, sideName, unitType, unitClassName);
  const presentation = resolvePreviewPresentation(asset);

  return {
    unitType,
    unitClassName,
    displayName: options?.displayName ?? getDisplayName(unitClassName),
    entityLabel: getEntityTypeLabel(unitType),
    asset,
    previewMode: presentation.previewMode,
    previewBadgeLabel:
      options?.previewBadgeLabel ?? presentation.previewBadgeLabel,
    previewTitle: options?.previewTitle ?? presentation.previewTitle,
    previewDescription:
      options?.previewDescription ?? presentation.previewDescription,
    presetContext: options?.presetContext ?? null,
    deploymentDefaults: options?.deploymentDefaults ?? null,
    conceptVariant: presentation.conceptVariant,
    visualPolicyDetails: presentation.visualPolicyDetails,
    model: presentation.model,
    sceneProps:
      presentation.model && asset.kind !== "airbase"
        ? buildBundleViewerSceneProps(asset, presentation.model, "detail")
        : [],
  };
}
