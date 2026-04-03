import type { TransformContext } from "../types/options.ts";
import type { IRLayer, IRSource, IRSprite, IRStyle } from "../types/style.ts";
import {
  expandMapboxGlyphUrl,
  expandMapboxSourceUrl,
  expandMapboxSpriteUrl,
  isMapboxUrl,
} from "../url/mapbox-protocol.ts";
import { deepClone } from "../utils.ts";

/** Mapbox proprietary top-level keys that get stashed into _extensions.mapbox. */
const MAPBOX_EXTENSION_KEYS = [
  "fog",
  "lights",
  "imports",
  "schema",
  "snow",
  "rain",
  "camera",
  "color-theme",
  "models",
  "iconsets",
  "featuresets",
  "indoor",
] as const;

/** Mapbox API metadata fields stripped from the style root. */
const MAPBOX_METADATA_KEYS = ["owner", "visibility", "draft", "created", "modified", "id"] as const;

/**
 * Parses a Mapbox GL style into the IR format.
 *
 * Expands `mapbox://` protocol URLs and stashes proprietary extensions.
 */
export function parseMapbox(input: Record<string, unknown>, ctx: TransformContext): IRStyle {
  const raw = deepClone(input);

  const accessToken = ctx.mapboxAccessToken ?? ctx.options.mapboxAccessToken ?? "";

  // --- Expand mapbox:// source URLs ---
  const rawSources = (raw.sources ?? {}) as Record<string, Record<string, unknown>>;
  const sources: Record<string, IRSource> = {};

  for (const [key, src] of Object.entries(rawSources)) {
    if (typeof src.url === "string" && isMapboxUrl(src.url)) {
      sources[key] = {
        ...src,
        url: expandMapboxSourceUrl(src.url, accessToken),
      } as unknown as IRSource;
    } else {
      sources[key] = src as unknown as IRSource;
    }
  }

  // --- Expand sprite ---
  let sprite: IRSprite | undefined;
  if (typeof raw.sprite === "string") {
    sprite = isMapboxUrl(raw.sprite) ? expandMapboxSpriteUrl(raw.sprite, accessToken) : raw.sprite;
  } else if (raw.sprite !== undefined) {
    sprite = raw.sprite as IRSprite;
  }

  // --- Expand glyphs ---
  let glyphs: string | undefined;
  if (typeof raw.glyphs === "string") {
    glyphs = isMapboxUrl(raw.glyphs) ? expandMapboxGlyphUrl(raw.glyphs, accessToken) : raw.glyphs;
  }

  // --- Stash proprietary extensions ---
  const extensions: Record<string, unknown> = {};
  for (const key of MAPBOX_EXTENSION_KEYS) {
    if (key in raw) {
      extensions[key] = raw[key];
    }
  }

  // --- Strip API metadata ---
  for (const key of MAPBOX_METADATA_KEYS) {
    delete raw[key];
  }

  // --- Build IRStyle ---
  const result: IRStyle = {
    version: 8,
    sources,
    layers: (raw.layers ?? []) as IRLayer[],
  };

  if (raw.name !== undefined) result.name = raw.name as string;
  if (raw.metadata !== undefined) result.metadata = raw.metadata as Record<string, unknown>;
  if (raw.center !== undefined) result.center = raw.center as [number, number];
  if (raw.zoom !== undefined) result.zoom = raw.zoom as number;
  if (raw.bearing !== undefined) result.bearing = raw.bearing as number;
  if (raw.pitch !== undefined) result.pitch = raw.pitch as number;
  if (sprite !== undefined) result.sprite = sprite;
  if (glyphs !== undefined) result.glyphs = glyphs;
  if (raw.light !== undefined) result.light = raw.light as Record<string, unknown>;
  if (raw.transition !== undefined)
    result.transition = raw.transition as { duration?: number; delay?: number };

  if (Object.keys(extensions).length > 0) {
    result._extensions = { mapbox: extensions };
  }

  return result;
}
