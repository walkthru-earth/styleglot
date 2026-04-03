import type { MapboxStyleOutput } from "../types/dialect.ts";
import type { TransformContext } from "../types/options.ts";
import type { IRStyle } from "../types/style.ts";
import { appendToken } from "../url/token.ts";
import { deepClone } from "../utils.ts";

// ---------------------------------------------------------------------------
// Mapbox emitter
// ---------------------------------------------------------------------------

/** Keys that are MapLibre-specific and should not appear in Mapbox output. */
const MAPLIBRE_ONLY_KEYS = ["state", "font-faces"] as const;

function appendAccessTokenToUrls(style: Record<string, unknown>, token: string): void {
  // Sprite
  if (typeof style.sprite === "string") {
    style.sprite = appendToken(style.sprite, token);
  } else if (Array.isArray(style.sprite)) {
    for (const entry of style.sprite as Array<{ id: string; url: string }>) {
      entry.url = appendToken(entry.url, token);
    }
  }

  // Glyphs
  if (typeof style.glyphs === "string") {
    style.glyphs = appendToken(style.glyphs, token);
  }

  // Sources
  if (style.sources && typeof style.sources === "object") {
    const sources = style.sources as Record<string, Record<string, unknown>>;
    for (const src of Object.values(sources)) {
      if (typeof src.url === "string") {
        src.url = appendToken(src.url, token);
      }
      if (Array.isArray(src.tiles)) {
        src.tiles = (src.tiles as string[]).map((t) => appendToken(t, token));
      }
    }
  }
}

/**
 * Emit a Mapbox GL style from the intermediate representation.
 *
 * Restores Mapbox-specific extensions (fog, lights, imports, schema, etc.)
 * from `_extensions.mapbox` and strips MapLibre-only properties.
 */
export function emitMapbox(ir: IRStyle, ctx: TransformContext): MapboxStyleOutput {
  const style = deepClone(ir) as unknown as Record<string, unknown>;

  // Restore Mapbox-specific extensions to top level
  const mapboxExt = (style._extensions as Record<string, unknown> | undefined)?.mapbox as
    | Record<string, unknown>
    | undefined;

  if (mapboxExt) {
    for (const [key, value] of Object.entries(mapboxExt)) {
      style[key] = value;
    }
  }

  // Remove _extensions
  delete style._extensions;

  // Remove MapLibre-specific properties
  for (const key of MAPLIBRE_ONLY_KEYS) {
    delete style[key];
  }

  // Append Mapbox access token to URLs if provided
  if (ctx.mapboxAccessToken) {
    appendAccessTokenToUrls(style, ctx.mapboxAccessToken);
  }

  return style as unknown as MapboxStyleOutput;
}
