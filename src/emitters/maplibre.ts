import type { MaplibreStyleOutput } from "../types/dialect.ts";
import type { TransformContext } from "../types/options.ts";
import type { IRStyle } from "../types/style.ts";
import { deepClone } from "../utils.ts";

// ---------------------------------------------------------------------------
// MapLibre emitter
// ---------------------------------------------------------------------------

/**
 * Emit a MapLibre GL style from the intermediate representation.
 *
 * The IR is already in MapLibre format, so this emitter only needs to
 * deep-clone and strip the `_extensions` bucket.
 */
export function emitMaplibre(ir: IRStyle, _ctx: TransformContext): MaplibreStyleOutput {
  const style = deepClone(ir) as unknown as Record<string, unknown>;

  // Remove _extensions (dialect-specific stash)
  delete style._extensions;

  return style as unknown as MaplibreStyleOutput;
}
