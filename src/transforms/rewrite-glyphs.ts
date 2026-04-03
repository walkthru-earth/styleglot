import type { TransformContext } from "../types/options.ts";
import type { IRStyle } from "../types/style.ts";
import { appendToken } from "../url/token.ts";
import { deepClone } from "../utils.ts";

/**
 * Normalize glyph URLs.
 *
 * Preserves `{fontstack}` and `{range}` placeholders. Appends authentication
 * token when available.
 */
export function rewriteGlyphs(style: IRStyle, ctx: TransformContext): IRStyle {
  const result = deepClone(style);

  if (result.glyphs == null) return result;

  const token = ctx.esriToken ?? ctx.mapboxAccessToken ?? null;

  if (token != null) {
    result.glyphs = appendToken(result.glyphs, token);
  }

  return result;
}
