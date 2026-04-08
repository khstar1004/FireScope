import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.resolve(testDir, "../../../..");
const viewerLibDir = path.join(clientRoot, "public", "3d-bundles", "viewer", "lib");

describe("viewer assets", () => {
  test("ships the core Three.js module required by the static viewer", () => {
    const threeModulePath = path.join(viewerLibDir, "three.module.js");
    const threeCorePath = path.join(viewerLibDir, "three.core.js");
    const source = readFileSync(threeModulePath, "utf8");

    expect(source).toContain("./three.core.js");
    expect(existsSync(threeCorePath)).toBe(true);
  });
});
