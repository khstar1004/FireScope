const VWORLD_HOST_PATTERN = /(^|\.)vworld\.kr$/i;

export function isVWorldHost(hostname = "") {
  return VWORLD_HOST_PATTERN.test(String(hostname).trim());
}

export function normalizeVWorldRuntimeUrl(resourceUrl, baseUrl) {
  const resolvedUrl = new URL(resourceUrl, baseUrl);

  if (resolvedUrl.protocol === "http:" && isVWorldHost(resolvedUrl.hostname)) {
    resolvedUrl.protocol = "https:";
  }

  return resolvedUrl.toString();
}
