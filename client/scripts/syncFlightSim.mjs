import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.resolve(scriptDir, "..");
const flightSimSourceRoot = path.join(clientRoot, "flight-sim-source");
const flightSimDist = path.join(flightSimSourceRoot, "dist");
const flightSimFontDir = path.join(
  flightSimSourceRoot,
  "public",
  "assets",
  "fonts"
);
const flightSimCesiumDirCandidates = [
  path.join(flightSimDist, "flight-sim", "cesium"),
  path.join(flightSimDist, "cesium"),
];

const flightSimPublicDir = path.join(clientRoot, "public", "flight-sim");
const rootFontDir = path.join(clientRoot, "public", "assets", "fonts");
const envFiles = [
  path.join(clientRoot, ".env"),
  path.join(clientRoot, ".env.standalone"),
  path.join(clientRoot, ".env.development"),
  path.join(clientRoot, ".env.production"),
];

function assertExists(targetPath, label) {
  if (!existsSync(targetPath)) {
    throw new Error(`${label} not found at ${targetPath}`);
  }
}

function copyDirectory(sourcePath, targetPath) {
  mkdirSync(targetPath, { recursive: true });
  for (const entry of readdirSync(sourcePath, { withFileTypes: true })) {
    cpSync(path.join(sourcePath, entry.name), path.join(targetPath, entry.name), {
      recursive: true,
      force: true,
    });
  }
}

function collectFilesByExtension(targetPath, extension, collectedFiles = []) {
  for (const entry of readdirSync(targetPath, { withFileTypes: true })) {
    const entryPath = path.join(targetPath, entry.name);

    if (entry.isDirectory()) {
      collectFilesByExtension(entryPath, extension, collectedFiles);
      continue;
    }

    if (entry.name.endsWith(extension)) {
      collectedFiles.push(entryPath);
    }
  }

  return collectedFiles;
}

function rewriteFlightSimPublicPaths(fileContents) {
  return fileContents
    .replaceAll('src="/config.js"', 'src="/flight-sim/config.js"')
    .replaceAll('src="/assets/', 'src="/flight-sim/assets/')
    .replaceAll('href="/assets/', 'href="/flight-sim/assets/')
    .replaceAll('src="/cesium/', 'src="/flight-sim/cesium/')
    .replaceAll('href="/cesium/', 'href="/flight-sim/cesium/')
    .replaceAll('href="/favicon.ico"', 'href="/flight-sim/favicon.ico"')
    .replaceAll('url("/assets/', 'url("/flight-sim/assets/')
    .replaceAll("url('/assets/", "url('/flight-sim/assets/")
    .replaceAll("url(/assets/", "url(/flight-sim/assets/");
}

for (const envFile of envFiles) {
  if (existsSync(envFile)) {
    dotenv.config({ path: envFile, override: false });
  }
}

assertExists(flightSimDist, "Built flight simulator dist");
assertExists(flightSimFontDir, "Flight simulator font directory");

const flightSimCesiumDir = flightSimCesiumDirCandidates.find((targetPath) =>
  existsSync(targetPath)
);

if (!flightSimCesiumDir) {
  throw new Error(
    `Flight simulator Cesium assets not found. Checked: ${flightSimCesiumDirCandidates.join(", ")}`
  );
}

rmSync(flightSimPublicDir, { recursive: true, force: true });
mkdirSync(flightSimPublicDir, { recursive: true });

cpSync(
  path.join(flightSimDist, "index.html"),
  path.join(flightSimPublicDir, "index.html")
);
cpSync(
  path.join(flightSimDist, "favicon.ico"),
  path.join(flightSimPublicDir, "favicon.ico")
);
copyDirectory(
  path.join(flightSimDist, "assets"),
  path.join(flightSimPublicDir, "assets")
);
copyDirectory(
  flightSimCesiumDir,
  path.join(flightSimPublicDir, "cesium")
);
rmSync(path.join(flightSimPublicDir, "assets", "models"), {
  recursive: true,
  force: true,
});

copyDirectory(flightSimFontDir, rootFontDir);

const syncedIndexPath = path.join(flightSimPublicDir, "index.html");
const syncedIndexHtml = rewriteFlightSimPublicPaths(
  readFileSync(syncedIndexPath, "utf8")
);
writeFileSync(syncedIndexPath, syncedIndexHtml);

for (const cssFilePath of collectFilesByExtension(
  path.join(flightSimPublicDir, "assets"),
  ".css"
)) {
  writeFileSync(
    cssFilePath,
    rewriteFlightSimPublicPaths(readFileSync(cssFilePath, "utf8"))
  );
}

const vworldApiKey =
  process.env.VWORLD_API_KEY ?? process.env.VITE_VWORLD_API_KEY ?? "";
const vworldDomain =
  process.env.VWORLD_DOMAIN ?? process.env.VITE_VWORLD_DOMAIN ?? "";
const mapTilerApiKey =
  process.env.MAPTILER_API_KEY ??
  process.env.VITE_MAPTILER_DEFAULT_KEY ??
  "";
const configScript = `window.__FLIGHT_SIM_CONFIG__ = Object.freeze({
  vworldApiKey: ${JSON.stringify(vworldApiKey)},
  vworldDomain: ${JSON.stringify(vworldDomain)},
  mapTilerApiKey: ${JSON.stringify(mapTilerApiKey)}
});
`;

writeFileSync(path.join(flightSimPublicDir, "config.js"), configScript);

console.log("Flight simulator bundle synced into client/public.");
