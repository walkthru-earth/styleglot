import type { EsriLayerOutput, EsriStyleOutput } from "../types/dialect.ts";
import type { TransformContext } from "../types/options.ts";
import type { IRLayer, IRStyle } from "../types/style.ts";
import { resolveEsriGlyphUrl, resolveEsriSourceUrl, resolveEsriSpriteUrl } from "../url/resolve.ts";
import { appendToken } from "../url/token.ts";

// ---------------------------------------------------------------------------
// Esri root.json emitter
// ---------------------------------------------------------------------------

const ESRI_RELATIVE_SPRITE = "../sprites/sprite";
const ESRI_RELATIVE_GLYPHS = "../fonts/{fontstack}/{range}.pbf";

/**
 * Check whether all vector sources point to an Esri VTS endpoint.
 * When false, sprite/glyphs should stay absolute because there is no
 * Esri directory structure to be relative to.
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

    // Esri VTS source: use relative URL
    let url = "../../";
    if (ctx.esriToken) {
      url = appendToken(url, ctx.esriToken);
    }
    result[name] = { type: "vector", url };
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
 * The output contains exactly 5 top-level keys:
 * `version`, `sprite`, `glyphs`, `sources`, `layers`.
 *
 * When IR sources have resolved tile URLs (from TileJSON), sprite and glyphs
 * are kept as absolute URLs from the IR since there is no Esri VTS to be
 * relative to. Otherwise they are re-relativized for the Esri directory layout.
 */
export function emitEsri(ir: IRStyle, ctx: TransformContext): EsriStyleOutput {
  const sources = buildEsriSources(ir, ctx);
  const esriOnly = isEsriVtsOnly(ir);

  const irSprite = typeof ir.sprite === "string" ? ir.sprite : undefined;
  let sprite: string | undefined;
  let glyphs: string | undefined;

  if (esriOnly && ctx.baseUrl) {
    // Esri VTS with a baseUrl: re-relativize for the Esri directory layout
    sprite = ESRI_RELATIVE_SPRITE;
    glyphs = ESRI_RELATIVE_GLYPHS;
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
 * Esri root.json uses paths relative to `{baseUrl}/resources/styles/root.json`.
 * This utility resolves them so the style can be consumed directly by
 * `VectorTileLayer({ style })` without needing a VectorTileServer endpoint.
 *
 * Only resolves URLs that start with `..` (relative paths). Absolute URLs
 * and styles with resolved tiles are left untouched.
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
