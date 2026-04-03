import type { Dialect } from "../types/dialect.ts";
import type { TransformContext } from "../types/options.ts";
import type { IRStyle } from "../types/style.ts";
import { emitEsri } from "./esri.ts";
import { emitMapbox } from "./mapbox.ts";
import { emitMaplibre } from "./maplibre.ts";

export { emitEsri, emitMapbox, emitMaplibre };

// ---------------------------------------------------------------------------
// Emitter dispatcher
// ---------------------------------------------------------------------------

/**
 * Emit a dialect-specific style from the intermediate representation.
 *
 * Routes to the appropriate emitter based on the target dialect.
 */
export function emit(ir: IRStyle, dialect: Dialect, ctx: TransformContext): unknown {
  switch (dialect) {
    case "esri":
      return emitEsri(ir, ctx);
    case "mapbox":
      return emitMapbox(ir, ctx);
    case "maplibre":
      return emitMaplibre(ir, ctx);
    default:
      throw new Error(`Unknown target dialect: ${dialect as string}`);
  }
}
