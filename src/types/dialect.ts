import type { IRStyle } from "./style.ts";

/** The three supported map style dialects. */
export type Dialect = "esri" | "mapbox" | "maplibre";

/** All supported dialects as a readonly tuple. */
export const DIALECTS = ["esri", "mapbox", "maplibre"] as const satisfies readonly Dialect[];

// ---------------------------------------------------------------------------
// Dialect-specific output types
// ---------------------------------------------------------------------------

/** Esri output: only the 5 fields an Esri root.json supports. */
export interface EsriStyleOutput {
  version: 8;
  sprite: string;
  glyphs: string;
  sources: Record<string, { type: "vector"; url: string }>;
  layers: EsriLayerOutput[];
}

export interface EsriLayerOutput {
  id: string;
  type: string;
  source?: string;
  "source-layer"?: string;
  minzoom?: number;
  maxzoom?: number;
  filter?: unknown;
  layout?: Record<string, unknown>;
  paint?: Record<string, unknown>;
}

/** Mapbox output: full style spec including proprietary extensions. */
export interface MapboxStyleOutput extends IRStyle {
  fog?: Record<string, unknown>;
  lights?: Array<Record<string, unknown>>;
}

/** MapLibre output: full MapLibre style spec. */
export interface MaplibreStyleOutput extends IRStyle {
  sky?: Record<string, unknown>;
  terrain?: Record<string, unknown>;
  projection?: unknown;
  state?: Record<string, unknown>;
  "font-faces"?: Array<Record<string, unknown>>;
}

// ---------------------------------------------------------------------------
// Conditional output type
// ---------------------------------------------------------------------------

/**
 * Maps a `Dialect` literal to its corresponding output interface.
 * Enables `transpile<"maplibre">(...)` to return `MaplibreStyleOutput`.
 */
export type DialectOutput<D extends Dialect> = D extends "esri"
  ? EsriStyleOutput
  : D extends "mapbox"
    ? MapboxStyleOutput
    : D extends "maplibre"
      ? MaplibreStyleOutput
      : never;
