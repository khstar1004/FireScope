import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { findAvailablePort } from "./devServerPorts.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.resolve(scriptDir, "..");
const viteCli = path.join(clientRoot, "node_modules", "vite", "bin", "vite.js");
const host = "127.0.0.1";
const port = await findAvailablePort(49154, new Set(), host);

console.log(`Offline map: http://localhost:${port}/`);

const child = spawn(
  process.execPath,
  [
    viteCli,
    "--host",
    host,
    "--open",
    "--port",
    String(port),
    "--strictPort",
    "--mode",
    "standalone",
  ],
  {
    cwd: clientRoot,
    env: {
      ...process.env,
      VITE_MAP_MODE: "offline",
    },
    stdio: "inherit",
  }
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exitCode = code ?? 0;
});
