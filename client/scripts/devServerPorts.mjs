import net from "node:net";

export function isPortAvailable(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.unref();
    server.once("error", () => {
      resolve(false);
    });
    server.listen({ host, port, exclusive: true }, () => {
      server.close(() => {
        resolve(true);
      });
    });
  });
}

export async function findAvailablePort(
  preferredPort,
  reservedPorts = new Set(),
  host = "127.0.0.1"
) {
  for (let port = preferredPort; port <= 65535; port += 1) {
    if (reservedPorts.has(port)) {
      continue;
    }

    if (await isPortAvailable(port, host)) {
      return port;
    }
  }

  throw new Error(`No available port found from ${preferredPort}.`);
}
