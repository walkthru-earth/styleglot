import type { TransformContext } from "../types/options.ts";
import type { IRStyle } from "../types/style.ts";
import { convertExpressions } from "./convert-expressions.ts";
import { derefLayers } from "./deref-layers.ts";
import { mapLayerProperties } from "./map-layer-properties.ts";
import { normalizePMTiles } from "./normalize-pmtiles.ts";
import { normalizeSources } from "./normalize-sources.ts";
import { rewriteFonts } from "./rewrite-fonts.ts";
import { rewriteGlyphs } from "./rewrite-glyphs.ts";
import { rewriteSprites } from "./rewrite-sprites.ts";
import { stripLossy } from "./strip-lossy.ts";

export type TransformFn = (style: IRStyle, ctx: TransformContext) => IRStyle;

/** The built-in transform pipeline in fixed execution order. */
const BUILT_IN_TRANSFORMS: readonly TransformFn[] = [
  derefLayers,
  normalizeSources,
  rewriteSprites,
  rewriteGlyphs,
  rewriteFonts,
  mapLayerProperties,
  convertExpressions,
  normalizePMTiles,
  stripLossy,
];

/**
 * Run the full transform pipeline: plugins (before), built-in transforms,
 * then plugins (after).
 *
 * Each transform is a pure function that returns a new IRStyle.
 */
export function applyTransforms(style: IRStyle, ctx: TransformContext): IRStyle {
  let current = style;

  // Run beforeTransform plugins.
  for (const plugin of ctx.plugins) {
    if (plugin.beforeTransform != null) {
      current = plugin.beforeTransform(current, ctx);
    }
  }

  // Run built-in transforms in fixed order.
  for (const transform of BUILT_IN_TRANSFORMS) {
    current = transform(current, ctx);
  }

  // Run afterTransform plugins.
  for (const plugin of ctx.plugins) {
    if (plugin.afterTransform != null) {
      current = plugin.afterTransform(current, ctx);
    }
  }

  return current;
}

export { convertExpressions } from "./convert-expressions.ts";
export { derefLayers } from "./deref-layers.ts";
export { mapLayerProperties } from "./map-layer-properties.ts";
export { normalizePMTiles } from "./normalize-pmtiles.ts";
export { normalizeSources } from "./normalize-sources.ts";
export { rewriteFonts } from "./rewrite-fonts.ts";
export { rewriteGlyphs } from "./rewrite-glyphs.ts";
export { rewriteSprites } from "./rewrite-sprites.ts";
export { stripLossy } from "./strip-lossy.ts";
