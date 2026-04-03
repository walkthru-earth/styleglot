import type { TransformContext } from "../types/options.ts";
import type { IRLayer, IRSource, IRStyle } from "../types/style.ts";
import { WARNING_CODES } from "../types/warnings.ts";
import { resolveEsriGlyphUrl, resolveEsriSourceUrl, resolveEsriSpriteUrl } from "../url/resolve.ts";
import { appendToken, resolveEsriToken } from "../url/token.ts";
import { createWarning, deepClone } from "../utils.ts";

/**
 * Parses an Esri Vector Tile Server root.json into the IR format.
 *
 * Resolves relative sprite, glyph, and source URLs against the provided
 * `baseUrl`. Detects and propagates tokens when present.
 */
export function parseEsri(input: Record<string, unknown>, ctx: TransformContext): IRStyle {
  const raw = deepClone(input);
  const baseUrl = ctx.baseUrl;

  // --- Token resolution ---
  const token = resolveEsriToken(baseUrl, ctx.options.token);
  ctx.esriToken = token ?? undefined;

  // --- Sources ---
  const rawSources = (raw.sources ?? {}) as Record<string, Record<string, unknown>>;
  const sources: Record<string, IRSource> = {};

  for (const [key, src] of Object.entries(rawSources)) {
    if (src.type === "vector" && typeof src.url === "string" && baseUrl) {
      let tileUrl = resolveEsriSourceUrl(baseUrl);
      if (token) {
        tileUrl = appendToken(tileUrl, token);
      }
      sources[key] = {
        type: "vector",
        tiles: [tileUrl],
      };
    } else if (src.type === "vector" && typeof src.url === "string" && !baseUrl) {
      // No baseUrl, keep source as-is and warn
      sources[key] = src as unknown as IRSource;
      ctx.warnings.push(
        createWarning(
          WARNING_CODES.ESRI_ITEM_URL_NEEDS_BASE,
          "Esri source URL could not be resolved without a baseUrl.",
          `sources.${key}`,
          "warn",
          ctx.sourceDialect,
          ctx.targetDialect,
        ),
      );
    } else {
      sources[key] = src as unknown as IRSource;
    }
  }

  // --- Sprite ---
  let sprite: string | undefined;
  if (typeof raw.sprite === "string") {
    if (raw.sprite.startsWith("../") && baseUrl) {
      sprite = resolveEsriSpriteUrl(baseUrl, raw.sprite);
    } else if (raw.sprite.startsWith("http")) {
      sprite = raw.sprite;
    } else {
      sprite = raw.sprite;
    }
    if (token && sprite) {
      sprite = appendToken(sprite, token);
    }
  }

  // --- Glyphs ---
  let glyphs: string | undefined;
  if (typeof raw.glyphs === "string") {
    if (raw.glyphs.startsWith("../") && baseUrl) {
      glyphs = resolveEsriGlyphUrl(baseUrl, raw.glyphs);
    } else if (raw.glyphs.startsWith("http")) {
      glyphs = raw.glyphs;
    } else {
      glyphs = raw.glyphs;
    }
    if (token && glyphs) {
      glyphs = appendToken(glyphs, token);
    }
  }

  // --- Warnings ---
  if (baseUrl && baseUrl.includes("/items/")) {
    ctx.warnings.push(
      createWarning(
        WARNING_CODES.ESRI_ITEM_URL_NEEDS_BASE,
        "Base URL contains /items/ (ArcGIS Online item pattern). Ensure the VectorTileServer URL is used, not the item URL.",
        "baseUrl",
        "warn",
        ctx.sourceDialect,
        ctx.targetDialect,
      ),
    );
  }

  if (token) {
    ctx.warnings.push(
      createWarning(
        WARNING_CODES.ESRI_TOKEN_DETECTED,
        "An Esri access token was detected and appended to resource URLs.",
        "token",
        "info",
        ctx.sourceDialect,
        ctx.targetDialect,
      ),
    );
  }

  // --- Layers ---
  const layers = (raw.layers ?? []) as IRLayer[];

  // --- Build IRStyle ---
  const result: IRStyle = {
    version: 8,
    sources,
    layers,
  };

  if (sprite !== undefined) result.sprite = sprite;
  if (glyphs !== undefined) result.glyphs = glyphs;

  return result;
}
