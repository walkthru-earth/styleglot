import type { TransformContext } from "../types/options.ts";
import type { IRStyle } from "../types/style.ts";
import { WARNING_CODES } from "../types/warnings.ts";
import { createWarning, deepClone } from "../utils.ts";

/** Layer types to drop when targeting Mapbox. */
const MAPBOX_UNSUPPORTED_LAYER_TYPES = new Set(["color-relief"]);

/** Layer types to drop when targeting MapLibre (Mapbox-proprietary). */
const MAPLIBRE_UNSUPPORTED_LAYER_TYPES = new Set([
  "building",
  "model",
  "slot",
  "clip",
  "raster-particle",
]);

/** Layer types to drop when targeting Esri (complement of supported set). */
const ESRI_UNSUPPORTED_LAYER_TYPES = new Set([
  "raster",
  "heatmap",
  "hillshade",
  "sky",
  "color-relief",
  "building",
  "model",
  "raster-particle",
  "slot",
  "clip",
]);

/** Top-level keys to strip when targeting Mapbox. */
const MAPBOX_STRIP_KEYS = ["state", "font-faces", "centerAltitude", "roll"] as const;

/** Top-level keys to strip when targeting Esri. */
const ESRI_STRIP_KEYS = [
  "name",
  "metadata",
  "center",
  "zoom",
  "bearing",
  "pitch",
  "light",
  "sky",
  "terrain",
  "transition",
  "state",
  "font-faces",
  "centerAltitude",
  "roll",
] as const;

/**
 * Final cleanup. Remove features incompatible with the target dialect.
 */
export function stripLossy(style: IRStyle, ctx: TransformContext): IRStyle {
  const result = deepClone(style);
  const record = result as unknown as Record<string, unknown>;

  // Initialize extensions stash for recovery.
  if (result._extensions == null) {
    result._extensions = {};
  }
  const stash: Record<string, unknown> =
    (result._extensions as Record<string, Record<string, unknown>>)[ctx.sourceDialect] ?? {};
  (result._extensions as Record<string, Record<string, unknown>>)[ctx.sourceDialect] = stash;

  // Strip top-level properties based on target dialect.
  if (ctx.targetDialect === "mapbox") {
    stripTopLevelKeys(record, MAPBOX_STRIP_KEYS, stash, ctx);
  } else if (ctx.targetDialect === "esri") {
    stripTopLevelKeys(record, ESRI_STRIP_KEYS, stash, ctx);
  }

  // Filter layers by type.
  let unsupportedTypes: Set<string> | null = null;

  if (ctx.targetDialect === "mapbox") {
    unsupportedTypes = MAPBOX_UNSUPPORTED_LAYER_TYPES;
  } else if (ctx.targetDialect === "esri") {
    unsupportedTypes = ESRI_UNSUPPORTED_LAYER_TYPES;
  } else if (ctx.targetDialect === "maplibre") {
    unsupportedTypes = MAPLIBRE_UNSUPPORTED_LAYER_TYPES;
  }

  if (unsupportedTypes != null) {
    const filteredLayers: typeof result.layers = [];

    for (const layer of result.layers) {
      if (unsupportedTypes.has(layer.type)) {
        if (ctx.options.strict === true) {
          throw new Error(
            `Lossy conversion: layer "${layer.id}" of type "${layer.type}" is not supported by ${ctx.targetDialect}`,
          );
        }

        ctx.warnings.push(
          createWarning(
            WARNING_CODES.UNSUPPORTED_LAYER_TYPE,
            `Layer "${layer.id}" of type "${layer.type}" dropped (not supported by ${ctx.targetDialect})`,
            `layers[${layer.id}]`,
            "drop",
            ctx.sourceDialect,
            ctx.targetDialect,
          ),
        );
        continue;
      }

      filteredLayers.push(layer);
    }

    result.layers = filteredLayers;
  }

  return result;
}

/**
 * Strip the given top-level keys, stashing their values for potential recovery.
 */
function stripTopLevelKeys(
  record: Record<string, unknown>,
  keys: readonly string[],
  stash: Record<string, unknown>,
  ctx: TransformContext,
): void {
  for (const key of keys) {
    if (record[key] === undefined) continue;

    if (ctx.options.strict === true) {
      throw new Error(
        `Lossy conversion: top-level property "${key}" is not supported by ${ctx.targetDialect}`,
      );
    }

    // Stash for potential recovery.
    stash[key] = record[key];

    delete record[key];

    ctx.warnings.push(
      createWarning(
        warningCodeForKey(key),
        `Top-level property "${key}" dropped (not supported by ${ctx.targetDialect})`,
        key,
        "drop",
        ctx.sourceDialect,
        ctx.targetDialect,
      ),
    );
  }
}

/**
 * Map a top-level key to the most appropriate warning code.
 */
function warningCodeForKey(key: string): string {
  switch (key) {
    case "state":
      return WARNING_CODES.LOSSY_STATE;
    case "font-faces":
      return WARNING_CODES.LOSSY_FONT_FACES;
    case "terrain":
      return WARNING_CODES.LOSSY_TERRAIN;
    case "sky":
      return WARNING_CODES.LOSSY_SKY;
    case "light":
      return WARNING_CODES.LOSSY_LIGHT;
    case "centerAltitude":
    case "roll":
      return WARNING_CODES.LOSSY_CAMERA;
    default:
      return WARNING_CODES.LOSSY_SCHEMA;
  }
}
