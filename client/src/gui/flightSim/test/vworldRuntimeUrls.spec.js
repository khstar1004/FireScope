import { describe, expect, test } from "vitest";
import {
  isVWorldHost,
  normalizeVWorldRuntimeUrl,
} from "../../../../flight-sim-source/src/world/vworldRuntimeUrls";

describe("VWorld runtime URLs", () => {
  test("upgrades VWorld HTTP runtime scripts to HTTPS", () => {
    expect(
      normalizeVWorldRuntimeUrl(
        "http://map.vworld.kr/js/ws3dmap/WS3DRelease3/WSViewerStartup.js",
        "https://map.vworld.kr/js/webglMapInit.js.do?version=3.0"
      )
    ).toBe(
      "https://map.vworld.kr/js/ws3dmap/WS3DRelease3/WSViewerStartup.js"
    );
  });

  test("keeps non-VWorld HTTP URLs unchanged", () => {
    expect(
      normalizeVWorldRuntimeUrl(
        "http://example.test/runtime.js",
        "https://map.vworld.kr/js/webglMapInit.js.do?version=3.0"
      )
    ).toBe("http://example.test/runtime.js");
  });

  test("matches VWorld hosts without matching lookalike domains", () => {
    expect(isVWorldHost("map.vworld.kr")).toBe(true);
    expect(isVWorldHost("xdworld.vworld.kr")).toBe(true);
    expect(isVWorldHost("notvworld.kr")).toBe(false);
  });
});
