import type { FetchAdapter } from "./types/options.ts";
import type { IRSource, IRStyle } from "./types/style.ts";
import { deepClone } from "./utils.ts";

/**
 * TileJSON response subset (only the fields we need).
 */
interface TileJSON {
  tiles?: string[];
  minzoom?: number;
  maxzoom?: number;
  bounds?: [number, number, number, number];
  attribution?: string;
  name?: string;
  scheme?: string;
}

/**
 * Check if a URL looks like an Esri VectorTileServer endpoint.
 */
function isEsriServiceUrl(url: string): boolean {
  return /\/VectorTileServer\/?$/i.test(url) || /\/rest\/services\//i.test(url);
}

/**
 * Check if a source has a TileJSON-like `url` that can be resolved.
 */
function hasResolvableUrl(source: IRSource): source is IRSource & { url: string } {
  if (!("url" in source) || typeof source.url !== "string") return false;
  if ("tiles" in source && Array.isArray(source.tiles) && source.tiles.length > 0) return false;
  if (isEsriServiceUrl(source.url)) return false;
  return true;
}

/**
 * Resolve TileJSON source URLs to inline `tiles` arrays.
 *
 * For sources that have a `url` pointing to a TileJSON endpoint (not an Esri
 * VectorTileServer), fetches the TileJSON and inlines the `tiles`, `minzoom`,
 * `maxzoom`, `bounds`, and `attribution` into the source.
 *
 * Sources that already have `tiles` or point to Esri services are left untouched.
 */
export async function resolveTileJsonSources(
  style: IRStyle,
  fetchFn: FetchAdapter,
): Promise<IRStyle> {
  const result = deepClone(style);
  const entries = Object.entries(result.sources);

  await Promise.all(
    entries.map(async ([key, source]) => {
      if (!hasResolvableUrl(source)) return;

      try {
        const tileJson = (await fetchFn(source.url)) as TileJSON;
        if (!tileJson || !Array.isArray(tileJson.tiles) || tileJson.tiles.length === 0) return;

        const resolved: Record<string, unknown> = { ...source };
        resolved.tiles = tileJson.tiles;

        if (tileJson.minzoom !== undefined && !("minzoom" in source)) {
          resolved.minzoom = tileJson.minzoom;
        }
        if (tileJson.maxzoom !== undefined && !("maxzoom" in source)) {
          resolved.maxzoom = tileJson.maxzoom;
        }
        if (tileJson.bounds && !("bounds" in source)) {
          resolved.bounds = tileJson.bounds;
        }
        if (tileJson.attribution && !("attribution" in source)) {
          resolved.attribution = tileJson.attribution;
        }

        result.sources[key] = resolved as unknown as IRSource;
      } catch {
        // If fetch fails, leave the source as-is
      }
    }),
  );

  return result;
}
