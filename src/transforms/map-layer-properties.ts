import type { TransformContext } from "../types/options.ts";
import type { IRStyle } from "../types/style.ts";
import { WARNING_CODES } from "../types/warnings.ts";
import { createWarning, deepClone } from "../utils.ts";

/** Mapbox PBR property suffixes to strip when targeting MapLibre or Esri. */
const MAPBOX_PBR_SUFFIXES = ["-emissive-strength", "-use-theme", "-occlusion-opacity"];

/** MapLibre-only property names to strip when targeting Mapbox or Esri. */
const MAPLIBRE_ONLY_PROPERTIES = new Set(["hillshade-method"]);

/**
 * Remove dialect-specific paint/layout properties not supported by the target.
 */
export function mapLayerProperties(style: IRStyle, ctx: TransformContext): IRStyle {
  const result = deepClone(style);

  const stripMapboxPbr = ctx.targetDialect === "maplibre" || ctx.targetDialect === "esri";
  const stripMaplibreOnly = ctx.targetDialect === "mapbox" || ctx.targetDialect === "esri";

  for (const layer of result.layers) {
    const sections = ["paint", "layout"] as const;
    for (const section of sections) {
      const props = layer[section] as Record<string, unknown> | undefined;
      if (props == null) continue;

      const keysToRemove: string[] = [];

      for (const key of Object.keys(props)) {
        let shouldStrip = false;

        if (stripMapboxPbr) {
          for (const suffix of MAPBOX_PBR_SUFFIXES) {
            if (key.endsWith(suffix)) {
              shouldStrip = true;
              break;
            }
          }
        }

        if (!shouldStrip && stripMaplibreOnly && MAPLIBRE_ONLY_PROPERTIES.has(key)) {
          shouldStrip = true;
        }

        if (shouldStrip) {
          keysToRemove.push(key);
        }
      }

      for (const key of keysToRemove) {
        delete props[key];
        ctx.warnings.push(
          createWarning(
            WARNING_CODES.UNSUPPORTED_PROPERTY,
            `Property "${key}" is not supported by ${ctx.targetDialect}`,
            `layers[${layer.id}].${section}.${key}`,
            "warn",
            ctx.sourceDialect,
            ctx.targetDialect,
          ),
        );
      }
    }
  }

  return result;
}
