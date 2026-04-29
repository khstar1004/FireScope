import { describe, expect, test } from "vitest";
import {
  buildAssetTerrainRecommendations,
  buildRuntimeAssetTerrainContext,
  buildTerrainVlmPrompt,
} from "../../../../public/terrain-3d/terrainIntel.js";

describe("terrainIntel runtime assets", () => {
  test("builds selected-bounds runtime asset context", () => {
    const context = buildRuntimeAssetTerrainContext({
      bounds: {
        west: 127,
        south: 38,
        east: 127.2,
        north: 38.2,
      },
      selectedUnitId: "k9-1",
      units: [
        {
          id: "k9-1",
          name: "K9 Alpha",
          className: "K9 Thunder artillery",
          entityType: "army",
          sideName: "Blue",
          longitude: 127.08,
          latitude: 38.08,
          weaponCount: 1,
        },
        {
          id: "outside-1",
          name: "Outside",
          longitude: 128,
          latitude: 39,
        },
      ],
      weapons: [
        {
          id: "round-1",
          name: "155mm",
          longitude: 127.1,
          latitude: 38.1,
        },
      ],
    });

    expect(context.unitCount).toBe(1);
    expect(context.weaponCount).toBe(1);
    expect(context.selectedUnit.name).toBe("K9 Alpha");
    expect(context.visibleUnits[0].role).toBe("fires");
  });

  test("recommends terrain markers for selected live assets", () => {
    const runtimeContext = buildRuntimeAssetTerrainContext({
      bounds: {
        west: 127,
        south: 38,
        east: 127.2,
        north: 38.2,
      },
      selectedUnitId: "k9-1",
      units: [
        {
          id: "k9-1",
          name: "K9 Alpha",
          className: "K9 Thunder artillery",
          entityType: "army",
          sideName: "Blue",
          longitude: 127.08,
          latitude: 38.08,
          weaponCount: 1,
        },
      ],
    });

    const recommendations = buildAssetTerrainRecommendations({
      runtimeContext,
      widthMeters: 12000,
      heightMeters: 9000,
      markers: [
        {
          id: "A1",
          type: "artillery",
          title: "고지 화력 후보",
          lon: 127.09,
          lat: 38.09,
          heightMeters: 220,
          score: 0.86,
        },
        {
          id: "C1",
          type: "concealment",
          title: "차폐 후보",
          lon: 127.19,
          lat: 38.19,
          heightMeters: 180,
          score: 0.52,
        },
      ],
    });

    expect(recommendations[0]).toEqual(
      expect.objectContaining({
        unitId: "k9-1",
        markerId: "A1",
        actionLabel: "사격 진지 보정",
        selectedUnit: true,
      })
    );
  });

  test("includes runtime asset recommendations in the VLM prompt", () => {
    const prompt = buildTerrainVlmPrompt({
      bounds: {
        west: 127,
        south: 38,
        east: 127.2,
        north: 38.2,
      },
      widthMeters: 1000,
      heightMeters: 1000,
      minElevation: 10,
      maxElevation: 120,
      meanElevation: 60,
      reliefMeters: 110,
      meanSlopeDegrees: 9,
      steepSampleRatio: 0.2,
      riverSampleRatio: 0.1,
      roadSampleRatio: 0.3,
      forestSampleRatio: 0.25,
      hazardSampleRatio: 0.05,
      drainageSampleRatio: 0.04,
      meanVisibilityRatio: 0.62,
      meanExposureScore: 0.48,
      meanConcealmentScore: 0.57,
      maxArtilleryScore: 0.86,
      maxCrossingScore: 0.42,
      terrainClass: "구릉지",
      markers: [],
      firePlans: [],
      topConcealmentCells: [],
      topExposureCells: [],
      crossingIntersections: [],
      layerSummary: [],
      engineBrief: {
        overview: [],
        artillery: [],
        maneuver: [],
        risks: [],
        opportunities: [],
      },
      runtimeContext: {
        hasContext: true,
        unitCount: 1,
        weaponCount: 0,
        selectedUnit: {
          id: "k9-1",
          name: "K9 Alpha",
          className: "K9 Thunder",
          roleLabel: "화력",
          sideName: "Blue",
          selected: true,
          lon: 127.08,
          lat: 38.08,
          altitudeMeters: 0,
          speedKts: 0,
          weaponCount: 1,
        },
        visibleUnits: [],
        visibleWeapons: [],
        sideCounts: { Blue: 1 },
        roleCounts: { fires: 1 },
      },
      assetRecommendations: [
        {
          unitId: "k9-1",
          unitName: "K9 Alpha",
          unitType: "K9 Thunder",
          markerId: "A1",
          markerType: "artillery",
          actionLabel: "사격 진지 보정",
          distanceMeters: 1200,
          priority: 0.91,
          summary: "K9 Alpha에서 A1까지 1.2km.",
        },
      ],
    });

    expect(prompt).toContain("assetRecommendations");
    expect(prompt).toContain("K9 Alpha");
    expect(prompt).toContain("사격 진지 보정");
  });
});
