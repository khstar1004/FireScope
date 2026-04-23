import { describe, expect, test } from "vitest";
import {
  buildTerrain3dHash,
  normalizeTerrain3dBounds,
  parseTerrain3dContinueSimulation,
  parseTerrain3dQueryParams,
} from "@/gui/map/terrain3dRoute";

function expectBoundsToMatch(
  actual: ReturnType<typeof normalizeTerrain3dBounds> | null,
  expected: ReturnType<typeof normalizeTerrain3dBounds>
) {
  expect(actual).not.toBeNull();
  expect(actual?.west).toBeCloseTo(expected.west, 6);
  expect(actual?.south).toBeCloseTo(expected.south, 6);
  expect(actual?.east).toBeCloseTo(expected.east, 6);
  expect(actual?.north).toBeCloseTo(expected.north, 6);
}

describe("terrain3dRoute", () => {
  test("normalizes unsorted bounds and enforces a minimum span", () => {
    expectBoundsToMatch(
      normalizeTerrain3dBounds({
        west: 127.001,
        south: 37.001,
        east: 127.0,
        north: 37.0,
      }),
      {
      west: 126.9995,
      south: 36.9995,
      east: 127.0015,
      north: 37.0015,
      }
    );
  });

  test("builds a stable terrain hash from normalized bounds", () => {
    expect(
      buildTerrain3dHash({
        west: 127.15,
        south: 37.42,
        east: 127.32,
        north: 37.56,
      })
    ).toBe("#/terrain-3d?west=127.150000&south=37.420000&east=127.320000&north=37.560000");
  });

  test("adds continueSimulation when live terrain runtime should keep running", () => {
    expect(
      buildTerrain3dHash(
        {
          west: 127.15,
          south: 37.42,
          east: 127.32,
          north: 37.56,
        },
        { continueSimulation: true }
      )
    ).toBe(
      "#/terrain-3d?west=127.150000&south=37.420000&east=127.320000&north=37.560000&continueSimulation=1"
    );
  });

  test("parses query params into normalized bounds", () => {
    expectBoundsToMatch(
      parseTerrain3dQueryParams(
        new URLSearchParams("west=127.3&south=37.6&east=127.1&north=37.4")
      ),
      {
      west: 127.1,
      south: 37.4,
      east: 127.3,
      north: 37.6,
      }
    );
  });

  test("returns null when any query param is missing or invalid", () => {
    expect(
      parseTerrain3dQueryParams(
        new URLSearchParams("west=127.3&south=37.6&east=bad&north=37.4")
      )
    ).toBeNull();
  });

  test("parses continueSimulation flag", () => {
    expect(
      parseTerrain3dContinueSimulation(
        new URLSearchParams("west=127.3&south=37.6&east=127.1&north=37.4&continueSimulation=1")
      )
    ).toBe(true);
    expect(parseTerrain3dContinueSimulation(new URLSearchParams(""))).toBe(false);
  });
});
