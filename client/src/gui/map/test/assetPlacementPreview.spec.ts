import Dba from "@/game/db/Dba";
import { buildAssetPlacementPreview } from "@/gui/map/toolbar/assetPlacementPreview";

describe("assetPlacementPreview", () => {
  const unitDb = new Dba();

  test("maps F-15K placement preview to the strike eagle bundle", () => {
    const preview = buildAssetPlacementPreview(
      unitDb,
      "BLUE",
      "aircraft",
      "F-15K Slam Eagle"
    );

    expect(preview.asset.kind).toBe("aircraft");
    expect(preview.model?.id).toBe("aircraft-f15-strike");
    expect(preview.sceneProps).toEqual([]);
  });

  test("maps Patriot placement preview to the closest defense bundle", () => {
    const preview = buildAssetPlacementPreview(
      unitDb,
      "BLUE",
      "facility",
      "MIM-104 Patriot"
    );

    expect(preview.asset.kind).toBe("facility");
    expect(preview.model?.id).toBe("artillery-patriot");
  });

  test("maps Cheongung-II placement preview to a curated closest defense model", () => {
    const preview = buildAssetPlacementPreview(
      unitDb,
      "BLUE",
      "facility",
      "Cheongung-II (KM-SAM Block II)"
    );

    expect(preview.asset.kind).toBe("facility");
    expect(preview.previewMode).toBe("closest");
    expect(preview.model?.id).toBe("artillery-patriot");
    expect(preview.visualPolicyDetails).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "방공 계층",
          value: "구역 방공",
        }),
      ])
    );
  });

  test("maps foreign strategic SAM placement previews to closest defense proxies", () => {
    const preview = buildAssetPlacementPreview(
      unitDb,
      "RED",
      "facility",
      "S-400 Triumf"
    );

    expect(preview.asset.kind).toBe("facility");
    expect(preview.previewMode).toBe("closest");
    expect(preview.model?.id).toBe("artillery-patriot");
  });

  test("uses a concept preview for short-range SAM systems without a faithful GLB", () => {
    const preview = buildAssetPlacementPreview(
      unitDb,
      "RED",
      "facility",
      "Tor-M2"
    );

    expect(preview.asset.kind).toBe("facility");
    expect(preview.previewMode).toBe("concept");
    expect(preview.model).toBeNull();
    expect(preview.conceptVariant).toBe("defense-point-launcher");
    expect(preview.visualPolicyDetails).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "개념 형상",
          value: "미사일 중심 점방어",
        }),
      ])
    );
  });

  test("distinguishes hybrid point-defense systems from launcher-only concepts", () => {
    const preview = buildAssetPlacementPreview(
      unitDb,
      "RED",
      "facility",
      "Pantsir-S1"
    );

    expect(preview.previewMode).toBe("concept");
    expect(preview.model).toBeNull();
    expect(preview.conceptVariant).toBe("defense-point-hybrid");
    expect(preview.visualPolicyDetails).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "개념 형상",
          value: "포·미사일 복합 점방어",
        }),
      ])
    );
  });

  test("uses a concept preview for airbases instead of forcing a misleading 3D model", () => {
    const preview = buildAssetPlacementPreview(
      unitDb,
      "BLUE",
      "airbase",
      "Seoul Air Base"
    );

    expect(preview.asset.kind).toBe("airbase");
    expect(preview.previewMode).toBe("concept");
    expect(preview.model).toBeNull();
    expect(preview.sceneProps).toEqual([]);
    expect(preview.conceptVariant).toBe("airbase");
  });

  test("supports overriding the preview display name for curated presets", () => {
    const preview = buildAssetPlacementPreview(
      unitDb,
      "BLUE",
      "facility",
      "Chunmoo MRLS",
      {
        displayName: "수도포병여단",
        previewBadgeLabel: "포병 프리셋",
        previewTitle: "수도권 서부 화력 프리셋",
        previewDescription: "시흥 권역 기준 프리셋",
        presetContext: {
          regionLabel: "시흥 권역",
          coverageLabel: "인천·김포 축선",
          representativeAssetLabel: "천무 다연장로켓",
          sourceLabel: "위키피디아 Capital Artillery Brigade",
          threatAxisLabel: "현재 적 중심축 북동 (42deg)",
        },
        deploymentDefaults: {
          headingDegrees: 42,
          arcDegrees: 120,
          recommendationLabel: "현재 적 전력 6개 기준 자동 보정",
          formation: {
            unitCount: 3,
            lateralSpacingKm: 8,
            depthSpacingKm: 2,
            templateLabel: "수도권 서부 3개 포대 분산",
          },
        },
      }
    );

    expect(preview.displayName).toBe("수도포병여단");
    expect(preview.previewBadgeLabel).toBe("포병 프리셋");
    expect(preview.previewTitle).toBe("수도권 서부 화력 프리셋");
    expect(preview.previewDescription).toBe("시흥 권역 기준 프리셋");
    expect(preview.presetContext).toEqual({
      regionLabel: "시흥 권역",
      coverageLabel: "인천·김포 축선",
      representativeAssetLabel: "천무 다연장로켓",
      sourceLabel: "위키피디아 Capital Artillery Brigade",
      threatAxisLabel: "현재 적 중심축 북동 (42deg)",
    });
    expect(preview.deploymentDefaults).toEqual({
      headingDegrees: 42,
      arcDegrees: 120,
      recommendationLabel: "현재 적 전력 6개 기준 자동 보정",
      formation: {
        unitCount: 3,
        lateralSpacingKm: 8,
        depthSpacingKm: 2,
        templateLabel: "수도권 서부 3개 포대 분산",
      },
    });
    expect(preview.unitClassName).toBe("Chunmoo MRLS");
  });
});
