interface TerrainIntelLocationLike {
  hostname?: string;
  host?: string;
  origin?: string;
}

export function shouldUseVworldProxy(locationLike?: {
  hostname?: string;
  origin?: string;
} | null): boolean;
export function buildVworldServiceUrl(
  pathname: string,
  locationLike?: TerrainIntelLocationLike | null
): URL;
export function resolveOllamaApiBaseUrl(
  runtimeConfig: {
    ollamaBaseUrl?: string;
  },
  searchParams: URLSearchParams,
  locationLike?: TerrainIntelLocationLike | null
): string;
export function extractOllamaModelNames(payload: unknown): string[];
export function selectOllamaVisionModel(
  preferredModel: string,
  availableModels?: string[]
): string;
