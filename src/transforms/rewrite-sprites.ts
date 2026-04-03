import type { TransformContext } from "../types/options.ts";
import type { IRSprite, IRStyle } from "../types/style.ts";
import { WARNING_CODES } from "../types/warnings.ts";
import { appendToken } from "../url/token.ts";
import { createWarning, deepClone } from "../utils.ts";

/**
 * Handle sprite URL normalization for the target dialect.
 *
 * Collapses multi-sprite arrays when the target does not support them,
 * and appends authentication tokens to sprite URLs.
 */
export function rewriteSprites(style: IRStyle, ctx: TransformContext): IRStyle {
  const result = deepClone(style);

  if (result.sprite == null) return result;

  const token = ctx.esriToken ?? ctx.mapboxAccessToken ?? null;

  // Collapse multi-sprite array for targets that don't support it.
  if (ctx.targetDialect !== "maplibre" && Array.isArray(result.sprite)) {
    const entries = result.sprite as Array<{ id: string; url: string }>;
    const defaultEntry = entries.find((e) => e.id === "default") ?? entries[0];

    if (defaultEntry != null) {
      result.sprite = defaultEntry.url;
    }

    ctx.warnings.push(
      createWarning(
        WARNING_CODES.MULTI_SPRITE_COLLAPSED,
        "Multi-sprite array collapsed to single URL for target dialect",
        "sprite",
        "warn",
        ctx.sourceDialect,
        ctx.targetDialect,
      ),
    );
  }

  // Append token to sprite URL(s).
  if (token != null) {
    if (typeof result.sprite === "string") {
      result.sprite = appendToken(result.sprite, token);
    } else if (Array.isArray(result.sprite)) {
      result.sprite = (result.sprite as Array<{ id: string; url: string }>).map((entry) => ({
        ...entry,
        url: appendToken(entry.url, token),
      })) as IRSprite;
    }
  }

  return result;
}
