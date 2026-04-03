import type { TransformContext } from "../types/options.ts";
import type {
  IRLayer,
  IRLight,
  IRSky,
  IRSource,
  IRSprite,
  IRStyle,
  IRTerrain,
  IRTransition,
} from "../types/style.ts";
import { deepClone } from "../utils.ts";

/**
 * Parses a MapLibre GL style into the IR format.
 *
 * MapLibre IS the IR format, so this parser simply picks known properties
 * and discards anything unrecognised.
 */
export function parseMaplibre(input: Record<string, unknown>, _ctx: TransformContext): IRStyle {
  const raw = deepClone(input);

  const result: IRStyle = {
    version: 8,
    sources: (raw.sources ?? {}) as Record<string, IRSource>,
    layers: (raw.layers ?? []) as IRLayer[],
  };

  if (raw.name !== undefined) result.name = raw.name as string;
  if (raw.metadata !== undefined) result.metadata = raw.metadata as Record<string, unknown>;
  if (raw.center !== undefined) result.center = raw.center as [number, number];
  if (raw.zoom !== undefined) result.zoom = raw.zoom as number;
  if (raw.bearing !== undefined) result.bearing = raw.bearing as number;
  if (raw.pitch !== undefined) result.pitch = raw.pitch as number;
  if (raw.sprite !== undefined) result.sprite = raw.sprite as IRSprite;
  if (raw.glyphs !== undefined) result.glyphs = raw.glyphs as string;
  if (raw.light !== undefined) result.light = raw.light as IRLight;
  if (raw.sky !== undefined) result.sky = raw.sky as IRSky;
  if (raw.terrain !== undefined) result.terrain = raw.terrain as IRTerrain;
  if (raw.transition !== undefined) result.transition = raw.transition as IRTransition;

  return result;
}
