import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { findAvailablePort, isPortAvailable } from "./devServerPorts.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.resolve(scriptDir, "..");
const viteCli = path.join(clientRoot, "node_modules", "vite", "bin", "vite.js");
const host = "127.0.0.1";
const openBrowser = process.env.FIRESCOPE_NO_OPEN !== "1";

function buildViteArgs(port) {
  return [
    "--host",
    host,
    ...(openBrowser ? ["--open"] : []),
    "--port",
    String(port),
    "--strictPort",
    "--mode",
    "standalone",
  ];
}

const serverConfigs = [
  {
    name: "api",
    label: "API map",
    preferredPort: 49153,
    fallbackPort: 49155,
    env: {},
  },
  {
    name: "offline",
    label: "Offline map",
    preferredPort: 49154,
    fallbackPort: 49164,
    env: {
      VITE_MAP_MODE: "offline",
    },
  },
];

function buildApiEnv() {
  const env = { ...process.env };
  delete env.VITE_MAP_MODE;
  delete env.VITE_OFFLINE_MAP_REGION;
  return env;
}

async function resolveServerPorts() {
  const assignedPorts = new Set();
  const preferredPorts = new Set(
    serverConfigs.map((server) => server.preferredPort)
  );
  const resolvedServers = [];

  for (const server of serverConfigs) {
    const preferredAvailable =
      !assignedPorts.has(server.preferredPort) &&
      (await isPortAvailable(server.preferredPort, host));
    const port = preferredAvailable
      ? server.preferredPort
      : await findAvailablePort(
          server.fallbackPort,
          new Set([...assignedPorts, ...preferredPorts]),
          host
        );

    assignedPorts.add(port);
    resolvedServers.push({
      ...server,
      port,
      url: `http://localhost:${port}/`,
      args: buildViteArgs(port),
    });
  }

  return resolvedServers;
}

function prefixStream(stream, prefix, writer) {
  let pending = "";
  stream.on("data", (chunk) => {
    pending += chunk.toString();
    const lines = pending.split(/\r?\n/);
    pending = lines.pop() ?? "";
    for (const line of lines) {
      if (line.trim().length > 0) {
        writer(`[${prefix}] ${line}\n`);
      }
    }
  });
  stream.on("end", () => {
    if (pending.trim().length > 0) {
      writer(`[${prefix}] ${pending}\n`);
    }
  });
}

const servers = await resolveServerPorts();
const children = [];
let stopping = false;

function stopChildren() {
  stopping = true;
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
}

for (const server of servers) {
  const env =
    server.name === "api"
      ? { ...buildApiEnv(), ...server.env }
      : { ...process.env, ...server.env };
  const child = spawn(process.execPath, [viteCli, ...server.args], {
    cwd: clientRoot,
    env,
    stdio: ["inherit", "pipe", "pipe"],
    windowsHide: false,
  });

  children.push(child);
  prefixStream(
    child.stdout,
    server.name,
    process.stdout.write.bind(process.stdout)
  );
  prefixStream(
    child.stderr,
    server.name,
    process.stderr.write.bind(process.stderr)
  );
  console.log(`${server.label}: ${server.url}`);

  child.on("exit", (code, signal) => {
    if (stopping) {
      return;
    }
    const detail = signal ? `signal ${signal}` : `exit ${code ?? 0}`;
    console.error(`[${server.name}] stopped (${detail}).`);
    if (code && code !== 0) {
      process.exitCode = code;
      stopChildren();
    }
  });
}

process.on("SIGINT", () => {
  stopChildren();
});

process.on("SIGTERM", () => {
  stopChildren();
});
