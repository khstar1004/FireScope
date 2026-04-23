// @ts-ignore The flight sim source tree is bundled separately from the app.
import { resolveTerrainAltitudeSafety } from "../../../../flight-sim-source/src/plane/terrainSafety";

describe("drone terrain safety", () => {
  const droneProfile = {
    mode: "drone",
    crashClearance: 3,
    terrainSafetyFloor: 48,
    terrainAutoRecoverDepth: 72,
    terrainAutoRecoverMaxSinkRate: 4.5,
  } as const;

  test("recovers a drone when terrain detail rises underneath a level flight path", () => {
    expect(
      resolveTerrainAltitudeSafety({
        craftProfile: droneProfile,
        altitude: 512,
        terrainHeight: 490,
        verticalSpeed: 0,
      })
    ).toEqual({
      adjustedAltitude: 538,
      aboveGround: 48,
      shouldCrash: false,
      wasRecovered: true,
    });
  });

  test("keeps the crash outcome when the drone is descending into terrain", () => {
    expect(
      resolveTerrainAltitudeSafety({
        craftProfile: droneProfile,
        altitude: 492,
        terrainHeight: 490,
        verticalSpeed: -8,
      })
    ).toEqual({
      adjustedAltitude: 492,
      aboveGround: 2,
      shouldCrash: true,
      wasRecovered: false,
    });
  });

  test("does not auto-lift non-drone craft", () => {
    expect(
      resolveTerrainAltitudeSafety({
        craftProfile: {
          mode: "jet",
          crashClearance: 5,
          terrainSafetyFloor: 48,
        },
        altitude: 992,
        terrainHeight: 990,
        verticalSpeed: 0,
      })
    ).toEqual({
      adjustedAltitude: 992,
      aboveGround: 2,
      shouldCrash: true,
      wasRecovered: false,
    });
  });
});
