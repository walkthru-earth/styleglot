import type { TransformContext } from "../types/options.ts";
import type { IRStyle } from "../types/style.ts";
import { deepClone } from "../utils.ts";

const VALID_SCHEMES = new Set(["xyz", "tms"]);

/**
 * Ensure all sources are in canonical form.
 *
 * For vector and raster sources: if they have `url` but no `tiles`, keep both
 * (some renderers prefer TileJSON). Validates the `scheme` property when present.
 */
export function normalizeSources(style: IRStyle, _ctx: TransformContext): IRStyle {
  const result = deepClone(style);

  for (const source of Object.values(result.sources)) {
    // Validate scheme if present on sources that support it.
    const record = source as unknown as Record<string, unknown>;
    if (record.scheme !== undefined && !VALID_SCHEMES.has(record.scheme as string)) {
      // Silently remove invalid scheme values, falling back to renderer default.
      delete record.scheme;
    }
  }

  return result;
}
