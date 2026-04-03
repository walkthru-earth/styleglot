import type { EsriLayerOutput, EsriStyleOutput } from "../types/dialect.ts";
import type { TransformContext } from "../types/options.ts";
import type { IRLayer, IRStyle } from "../types/style.ts";
import { WARNING_CODES } from "../types/warnings.ts";
import { appendToken } from "../url/token.ts";
import { createWarning } from "../utils.ts";

// ---------------------------------------------------------------------------
// Esri root.json emitter
// ---------------------------------------------------------------------------

const ESRI_RELATIVE_SPRITE = "../sprites/sprite";
const ESRI_RELATIVE_GLYPHS = "../fonts/{fontstack}/{range}.pbf";
const ESRI_SOURCE_NAME = "esri";

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

function buildEsriSource(ctx: TransformContext): Record<string, { type: "vector"; url: string }> {
  let url = "../../";

  if (ctx.esriToken) {
    url = appendToken(url, ctx.esriToken);
  }

  return {
    [ESRI_SOURCE_NAME]: { type: "vector", url },
  };
}

function toEsriLayer(layer: IRLayer): EsriLayerOutput {
  const out: EsriLayerOutput = {
    id: layer.id,
    type: layer.type,
  };

  // Background layers have no source
  if (layer.type !== "background") {
    out.source = ESRI_SOURCE_NAME;
  }

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
 */
export function emitEsri(ir: IRStyle, ctx: TransformContext): EsriStyleOutput {
  let sprite = reRelativizeSprite(typeof ir.sprite === "string" ? ir.sprite : undefined, ctx);
  let glyphs = reRelativizeGlyphs(ir.glyphs, ctx);

  if (ctx.esriToken) {
    sprite = appendToken(sprite, ctx.esriToken);
    glyphs = appendToken(glyphs, ctx.esriToken);
  }

  const sources = buildEsriSource(ctx);
  const layers = ir.layers.map(toEsriLayer);

  return {
    version: 8,
    sprite,
    glyphs,
    sources,
    layers,
  };
}
