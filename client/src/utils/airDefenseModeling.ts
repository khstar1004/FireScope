export type DefenseProxyVisualProfileId =
  | "artillery-patriot"
  | "artillery-nasams-battery"
  | "artillery-thaad";

const DEFENSE_SIGNATURE_PATTERN =
  /\b(sam|patriot|nasams|thaad|cheongung|km-sam|m-sam|l-sam|pegasus|biho|vads|chaparral|radar|air defense|surface-to-air|surface to air|antiair|anti-air|interceptor|s-400|s-300|s-500|buk|tor|pantsir|hq-9|hq-19|hq-16|hq-17|hq-7|aster|barak|manpads|chiron)\b/i;

const CONCEPT_ONLY_DEFENSE_PATTERN =
  /\b(pegasus|k-sam|biho|tor-m2|pantsir|hq-17|hq-7|vads|chaparral|manpads|chiron)\b/i;

const PATRIOT_PROXY_PATTERN =
  /\b(cheongung|km-sam|m-sam|s-400|s-300|hq-9|aster 30|barak 8)\b/i;

const NASAMS_BATTERY_PROXY_PATTERN = /\b(buk-m3|hq-16)\b/i;

const THAAD_PROXY_PATTERN = /\b(l-sam|s-500|hq-19)\b/i;

export function buildAssetSignature(className: string, name = "") {
  return `${className} ${name}`.trim().toLowerCase();
}

export function isDefenseAssetSignature(signature: string) {
  return DEFENSE_SIGNATURE_PATTERN.test(signature);
}

export function isConceptOnlyDefenseAssetSignature(signature: string) {
  return CONCEPT_ONLY_DEFENSE_PATTERN.test(signature);
}

export function inferDefenseProxyVisualProfileId(
  signature: string
): DefenseProxyVisualProfileId | null {
  if (PATRIOT_PROXY_PATTERN.test(signature)) {
    return "artillery-patriot";
  }
  if (NASAMS_BATTERY_PROXY_PATTERN.test(signature)) {
    return "artillery-nasams-battery";
  }
  if (THAAD_PROXY_PATTERN.test(signature)) {
    return "artillery-thaad";
  }

  return null;
}
