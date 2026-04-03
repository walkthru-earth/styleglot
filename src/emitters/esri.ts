import type { EsriLayerOutput, EsriStyleOutput } from "../types/dialect.ts";
import type { TransformContext } from "../types/options.ts";
import type { IRLayer, IRStyle } from "../types/style.ts";
import { WARNING_CODES } from "../types/warnings.ts";
import { resolveEsriGlyphUrl, resolveEsriSourceUrl, resolveEsriSpriteUrl } from "../url/resolve.ts";
import { appendToken } from "../url/token.ts";
import { createWarning } from "../utils.ts";

// ---------------------------------------------------------------------------
// Esri root.json emitter
// ---------------------------------------------------------------------------

const ESRI_RELATIVE_SPRITE = "../sprites/sprite";
const ESRI_RELATIVE_GLYPHS = "../fonts/{fontstack}/{range}.pbf";
function reRelativizeSprite(sprite: string | undefined, ctx: TransformContext): string {
  if (ctx.baseUrl) {
    return ESRI_RELATIVE_SPRITE;
  }

  if (sprite) {
    ctx.warnings.push(
      createWarning(
        WARNING_CODES.ESRI_ITEM_URL_NEEDS_BASE,
        "Cannot re-relativize sprite URL without a baseUrl. Keeping absolute URL.",
        "sprite",
        "warn",
        ctx.sourceDialect,
        ctx.targetDialect,
      ),
    );
    return sprite;
  }

  return ESRI_RELATIVE_SPRITE;
}

function reRelativizeGlyphs(glyphs: string | undefined, ctx: TransformContext): string {
  if (ctx.baseUrl) {
    return ESRI_RELATIVE_GLYPHS;
  }

  if (glyphs) {
    ctx.warnings.push(
      createWarning(
        WARNING_CODES.ESRI_ITEM_URL_NEEDS_BASE,
        "Cannot re-relativize glyphs URL without a baseUrl. Keeping absolute URL.",
        "glyphs",
        "warn",
        ctx.sourceDialect,
        ctx.targetDialect,
      ),
    );
    return glyphs;
  }

  return ESRI_RELATIVE_GLYPHS;
}

/**
 * Check whether IR sources originate from a non-Esri provider (resolved tiles
 * or a TileJSON URL). When true, sprite/glyphs should stay absolute because
 * there is no Esri VTS directory structure to be relative to.
 */
function hasNonEsriSources(ir: IRStyle): boolean {
  for (const src of Object.values(ir.sources)) {
    if (src.type !== "vector") continue;
    if ("tiles" in src && Array.isArray(src.tiles) && src.tiles.length > 0) return true;
    if ("url" in src && typeof src.url === "string" && !/\/VectorTileServer\/?$/i.test(src.url))
      return true;
  }
  return false;
}

type EsriSource = {
  type: "vector";
  url?: string;
  tiles?: string[];
  minzoom?: number;
  maxzoom?: number;
};

function buildEsriSources(ir: IRStyle, ctx: TransformContext): Record<string, EsriSource> {
  const result: Record<string, EsriSource> = {};

  for (const [name, src] of Object.entries(ir.sources)) {
    if (src.type !== "vector") continue;

    // Prefer resolved tiles (from TileJSON resolution via transpileAsync)
    if ("tiles" in src && Array.isArray(src.tiles) && src.tiles.length > 0) {
      const entry: EsriSource = { type: "vector", tiles: src.tiles };
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
  const nonEsriSource = hasNonEsriSources(ir);

  let sprite: string;
  let glyphs: string;

  if (nonEsriSource) {
    // Sources were resolved from TileJSON, so there is no Esri VTS.
    // Keep absolute URLs from the IR as-is (no re-relativization needed).
    sprite = typeof ir.sprite === "string" ? ir.sprite : ESRI_RELATIVE_SPRITE;
    glyphs = ir.glyphs ?? ESRI_RELATIVE_GLYPHS;
  } else {
    sprite = reRelativizeSprite(typeof ir.sprite === "string" ? ir.sprite : undefined, ctx);
    glyphs = reRelativizeGlyphs(ir.glyphs, ctx);

    if (ctx.esriToken) {
      sprite = appendToken(sprite, ctx.esriToken);
      glyphs = appendToken(glyphs, ctx.esriToken);
    }
  }

  const layers = ir.layers.map(toEsriLayer);

  return {
    version: 8,
    sprite,
    glyphs,
    sources,
    layers,
  };
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
      if (src.url?.startsWith("..")) {
        newSources[key] = { ...src, url: resolveEsriSourceUrl(baseUrl) };
      } else {
        newSources[key] = src;
      }
    }
    resolved.sources = newSources;
  }

  return resolved;
}
