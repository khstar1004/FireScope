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
  buildAssetSignature,
  inferDefenseProxyVisualProfileId,
  isConceptOnlyDefenseAssetSignature,
} from "@/utils/airDefenseModeling";
import { getDisplayName, getEntityTypeLabel } from "@/utils/koreanCatalog";

export type AssetPlacementPreviewUnitType =
  | "aircraft"
  | "airbase"
  | "facility"
  | "ship";

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
  model: BundleModelSelection | null;
  sceneProps: BundleViewerSceneProp[];
}

interface AssetPlacementPreviewOptions {
  displayName?: string;
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

function buildSignature(asset: AssetExperienceSummary) {
  return buildAssetSignature(asset.className, asset.name);
}

function buildClosestDefensePreview(modelId: string) {
  const model = getBundleModelById(modelId);
  const proxyLabel =
    modelId === "artillery-thaad"
      ? "THAAD"
      : modelId === "artillery-nasams-battery"
        ? "NASAMS Battery"
        : "Patriot";

  return {
    previewMode: "closest" as const,
    previewBadgeLabel: "근접 대체 3D",
    previewTitle: "가장 가까운 방공 모델",
    previewDescription: `전용 GLB가 없어, 형상과 역할이 가장 가까운 ${proxyLabel} 계열 모델로 대체 표시합니다.`,
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
  | "model"
> {
  const signature = buildSignature(asset);

  if (asset.kind === "airbase") {
    return {
      previewMode: "concept",
      previewBadgeLabel: "개념 프리뷰",
      previewTitle: "개념형 기지 프리뷰",
      previewDescription:
        "공군기지 전체를 나타내는 단일 3D 번들이 없어, 오해를 줄이기 위해 개념형 프리뷰로 표시합니다.",
      model: null,
    };
  }

  if (asset.kind === "facility") {
    const defenseProxyModelId = inferDefenseProxyVisualProfileId(signature);
    if (defenseProxyModelId) {
      return buildClosestDefensePreview(defenseProxyModelId);
    }

    if (isConceptOnlyDefenseAssetSignature(signature)) {
      return {
        previewMode: "concept",
        previewBadgeLabel: "개념 프리뷰",
        previewTitle: "개념형 방공 프리뷰",
        previewDescription:
          "단거리 대공체계 전용 GLB가 없어, 틀린 장비를 보여주지 않도록 개념형 프리뷰로 표시합니다.",
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
    previewBadgeLabel: presentation.previewBadgeLabel,
    previewTitle: presentation.previewTitle,
    previewDescription: presentation.previewDescription,
    model: presentation.model,
    sceneProps:
      presentation.model && asset.kind !== "airbase"
        ? buildBundleViewerSceneProps(asset, presentation.model, "detail")
        : [],
  };
}
