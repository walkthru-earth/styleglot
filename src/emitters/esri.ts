import type { EsriLayerOutput, EsriStyleOutput } from "../types/dialect.ts";
import type { TransformContext } from "../types/options.ts";
import type { IRLayer, IRStyle } from "../types/style.ts";
import { resolveEsriGlyphUrl, resolveEsriSourceUrl, resolveEsriSpriteUrl } from "../url/resolve.ts";
import { appendToken } from "../url/token.ts";

// ---------------------------------------------------------------------------
// Esri root.json emitter
// ---------------------------------------------------------------------------

/**
 * Check whether all vector sources point to an Esri VTS endpoint.
 * When false, sprite/glyphs should use the IR values because there is no
 * Esri directory structure to resolve against.
 */
function isEsriVtsOnly(ir: IRStyle): boolean {
  for (const src of Object.values(ir.sources)) {
    if (src.type !== "vector") continue;
    if ("tiles" in src && Array.isArray(src.tiles) && src.tiles.length > 0) return false;
    if ("url" in src && typeof src.url === "string" && !/\/VectorTileServer\/?$/i.test(src.url))
      return false;
  }
  return true;
}

type EsriVectorSource = {
  type: "vector";
  url?: string;
  tiles?: string[];
  minzoom?: number;
  maxzoom?: number;
};

type EsriGeoJSONSource = {
  type: "geojson";
  data: unknown;
  [key: string]: unknown;
};

type EsriSource = EsriVectorSource | EsriGeoJSONSource;

function buildEsriSources(ir: IRStyle, ctx: TransformContext): Record<string, EsriSource> {
  const result: Record<string, EsriSource> = {};

  for (const [name, src] of Object.entries(ir.sources)) {
    if (src.type === "geojson") {
      const { type, data, ...rest } = src;
      result[name] = { type: "geojson", data, ...rest };
      continue;
    }

    if (src.type !== "vector") continue;

    // Tiles resolved from the same Esri VTS baseUrl: emit absolute tile URL
    const tilesFromVts =
      ctx.baseUrl &&
      "tiles" in src &&
      Array.isArray(src.tiles) &&
      src.tiles.length > 0 &&
      src.tiles[0].startsWith(ctx.baseUrl);

    if (tilesFromVts && ctx.baseUrl) {
      let url = resolveEsriSourceUrl(ctx.baseUrl);
      if (ctx.esriToken) url = appendToken(url, ctx.esriToken);
      result[name] = { type: "vector", url };
      continue;
    }

    // Prefer resolved tiles (from TileJSON resolution via transpileAsync)
    if ("tiles" in src && Array.isArray(src.tiles) && src.tiles.length > 0) {
      const entry: EsriVectorSource = { type: "vector", tiles: src.tiles };
      if (src.minzoom !== undefined) entry.minzoom = src.minzoom;
      if (src.maxzoom !== undefined) entry.maxzoom = src.maxzoom;
      result[name] = entry;
      continue;
    }

    // Pass through TileJSON URL if present (Esri JS API can resolve it)
    if ("url" in src && typeof src.url === "string" && !/\/VectorTileServer\/?$/i.test(src.url)) {
      result[name] = { type: "vector", url: src.url };
      continue;
    }

    // Esri VTS source with baseUrl: emit absolute tile URL
    if (ctx.baseUrl) {
      let url = resolveEsriSourceUrl(ctx.baseUrl);
      if (ctx.esriToken) url = appendToken(url, ctx.esriToken);
      result[name] = { type: "vector", url };
    } else {
      // No baseUrl: emit relative as last resort
      result[name] = { type: "vector" };
    }
  }

  return result;
}

function toEsriLayer(layer: IRLayer): EsriLayerOutput {
  const out: EsriLayerOutput = {
    id: layer.id,
    type: layer.type,
  };

  if (layer.source !== undefined) out.source = layer.source;
  if (layer["source-layer"] !== undefined) out["source-layer"] = layer["source-layer"];
  if (layer.minzoom !== undefined) out.minzoom = layer.minzoom;
  if (layer.maxzoom !== undefined) out.maxzoom = layer.maxzoom;
  if (layer.filter !== undefined) out.filter = layer.filter;
  if (layer.layout !== undefined) out.layout = layer.layout;
  if (layer.paint !== undefined) out.paint = layer.paint;

  return out;
}

/**
 * Emit an Esri root.json style from the intermediate representation.
 *
 * When a `baseUrl` is available, all URLs (sources, sprite, glyphs) are
 * emitted as fully resolved absolute URLs. No relative `../` paths.
 */
export function emitEsri(ir: IRStyle, ctx: TransformContext): EsriStyleOutput {
  const sources = buildEsriSources(ir, ctx);
  const esriOnly = isEsriVtsOnly(ir);

  const irSprite = typeof ir.sprite === "string" ? ir.sprite : undefined;
  let sprite: string | undefined;
  let glyphs: string | undefined;

  if (esriOnly && ctx.baseUrl) {
    // All sources are Esri VTS: resolve to absolute Esri resource URLs
    sprite = resolveEsriSpriteUrl(ctx.baseUrl, "../sprites/sprite");
    glyphs = resolveEsriGlyphUrl(ctx.baseUrl, "../fonts/{fontstack}/{range}.pbf");
  } else {
    // Non-Esri sources or no baseUrl: keep input URLs as-is
    sprite = irSprite;
    glyphs = ir.glyphs;
  }

  if (ctx.esriToken) {
    if (sprite) sprite = appendToken(sprite, ctx.esriToken);
    if (glyphs) glyphs = appendToken(glyphs, ctx.esriToken);
  }

  const layers = ir.layers.map(toEsriLayer);

  const output: EsriStyleOutput = { version: 8, sources, layers };
  if (sprite !== undefined) output.sprite = sprite;
  if (glyphs !== undefined) output.glyphs = glyphs;

  return output;
}

/**
 * Resolve relative URLs in an Esri style output to absolute URLs.
 *
 * Kept for backward compatibility. If you use `emitEsri` with a `baseUrl`,
 * the output already contains absolute URLs and this function is a no-op.
 *
 * For styles loaded from external sources that contain relative `../` paths,
 * this utility resolves them against the given baseUrl.
 */
export function resolveEsriStyleUrls(style: EsriStyleOutput, baseUrl: string): EsriStyleOutput {
  const resolved = { ...style };

  if (typeof resolved.sprite === "string" && resolved.sprite.startsWith("..")) {
    resolved.sprite = resolveEsriSpriteUrl(baseUrl, resolved.sprite);
  }

  if (typeof resolved.glyphs === "string" && resolved.glyphs.startsWith("..")) {
    resolved.glyphs = resolveEsriGlyphUrl(baseUrl, resolved.glyphs);
  }

  if (resolved.sources) {
    const newSources: typeof resolved.sources = {};
    for (const [key, src] of Object.entries(resolved.sources)) {
      if (src.type === "vector" && src.url?.startsWith("..")) {
        newSources[key] = { ...src, url: resolveEsriSourceUrl(baseUrl) };
      } else {
        newSources[key] = src;
      }
    }
    resolved.sources = newSources;
  }

  return resolved;
}
