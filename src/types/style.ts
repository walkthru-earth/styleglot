import type { DataDrivenPropertyValue, IRExpression, PropertyValue } from "./expressions.ts";

// ---------------------------------------------------------------------------
// Sprite
// ---------------------------------------------------------------------------

/** Single URL string or MapLibre multi-sprite array. */
export type IRSprite = string | Array<{ id: string; url: string }>;

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

export type IRSource =
  | IRVectorSource
  | IRRasterSource
  | IRRasterDEMSource
  | IRGeoJSONSource
  | IRVideoSource
  | IRImageSource;

export interface IRVectorSource {
  type: "vector";
  url?: string;
  tiles?: string[];
  minzoom?: number;
  maxzoom?: number;
  bounds?: [number, number, number, number];
  scheme?: "xyz" | "tms";
  attribution?: string;
  promoteId?: string | Record<string, string>;
  volatile?: boolean;
  encoding?: "mvt" | "mlt";
}

export interface IRRasterSource {
  type: "raster";
  url?: string;
  tiles?: string[];
  tileSize?: number;
  minzoom?: number;
  maxzoom?: number;
  bounds?: [number, number, number, number];
  scheme?: "xyz" | "tms";
  attribution?: string;
}

export interface IRRasterDEMSource {
  type: "raster-dem";
  url?: string;
  tiles?: string[];
  tileSize?: number;
  minzoom?: number;
  maxzoom?: number;
  bounds?: [number, number, number, number];
  encoding?: "terrarium" | "mapbox" | "custom";
  redFactor?: number;
  greenFactor?: number;
  blueFactor?: number;
  baseShift?: number;
}

export interface IRGeoJSONSource {
  type: "geojson";
  data: unknown;
  maxzoom?: number;
  attribution?: string;
  buffer?: number;
  tolerance?: number;
  cluster?: boolean;
  clusterRadius?: number;
  clusterMaxZoom?: number;
  clusterMinPoints?: number;
  clusterProperties?: Record<string, unknown>;
  lineMetrics?: boolean;
  generateId?: boolean;
  promoteId?: string;
}

export interface IRVideoSource {
  type: "video";
  urls: string[];
  coordinates: [[number, number], [number, number], [number, number], [number, number]];
}

export interface IRImageSource {
  type: "image";
  url: string;
  coordinates: [[number, number], [number, number], [number, number], [number, number]];
}

// ---------------------------------------------------------------------------
// Layers
// ---------------------------------------------------------------------------

export type IRLayer =
  | IRBackgroundLayer
  | IRFillLayer
  | IRLineLayer
  | IRSymbolLayer
  | IRCircleLayer
  | IRRasterLayer
  | IRFillExtrusionLayer
  | IRHeatmapLayer
  | IRHillshadeLayer;

export interface IRLayerBase {
  id: string;
  type: string;
  source?: string;
  "source-layer"?: string;
  minzoom?: number;
  maxzoom?: number;
  filter?: IRExpression;
  layout?: Record<string, unknown>;
  paint?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface IRBackgroundLayer extends IRLayerBase {
  type: "background";
  paint?: {
    "background-color"?: PropertyValue<string>;
    "background-opacity"?: PropertyValue<number>;
    "background-pattern"?: PropertyValue<string>;
  };
}

export interface IRFillLayer extends IRLayerBase {
  type: "fill";
  paint?: {
    "fill-antialias"?: PropertyValue<boolean>;
    "fill-opacity"?: DataDrivenPropertyValue<number>;
    "fill-color"?: DataDrivenPropertyValue<string>;
    "fill-outline-color"?: DataDrivenPropertyValue<string>;
    "fill-translate"?: PropertyValue<[number, number]>;
    "fill-translate-anchor"?: PropertyValue<"map" | "viewport">;
    "fill-pattern"?: DataDrivenPropertyValue<string>;
  };
}

export interface IRLineLayer extends IRLayerBase {
  type: "line";
  paint?: {
    "line-opacity"?: DataDrivenPropertyValue<number>;
    "line-color"?: DataDrivenPropertyValue<string>;
    "line-translate"?: PropertyValue<[number, number]>;
    "line-translate-anchor"?: PropertyValue<"map" | "viewport">;
    "line-width"?: DataDrivenPropertyValue<number>;
    "line-gap-width"?: DataDrivenPropertyValue<number>;
    "line-offset"?: DataDrivenPropertyValue<number>;
    "line-blur"?: DataDrivenPropertyValue<number>;
    "line-dasharray"?: PropertyValue<number[]>;
    "line-pattern"?: DataDrivenPropertyValue<string>;
  };
  layout?: {
    "line-cap"?: PropertyValue<"butt" | "round" | "square">;
    "line-join"?: DataDrivenPropertyValue<"bevel" | "round" | "miter">;
    "line-miter-limit"?: PropertyValue<number>;
    "line-round-limit"?: PropertyValue<number>;
    "line-sort-key"?: DataDrivenPropertyValue<number>;
    visibility?: "visible" | "none";
  };
}

export interface IRSymbolLayer extends IRLayerBase {
  type: "symbol";
  paint?: Record<string, unknown>;
  layout?: Record<string, unknown>;
}

export interface IRCircleLayer extends IRLayerBase {
  type: "circle";
  paint?: {
    "circle-radius"?: DataDrivenPropertyValue<number>;
    "circle-color"?: DataDrivenPropertyValue<string>;
    "circle-blur"?: DataDrivenPropertyValue<number>;
    "circle-opacity"?: DataDrivenPropertyValue<number>;
    "circle-translate"?: PropertyValue<[number, number]>;
    "circle-translate-anchor"?: PropertyValue<"map" | "viewport">;
    "circle-pitch-scale"?: PropertyValue<"map" | "viewport">;
    "circle-pitch-alignment"?: PropertyValue<"map" | "viewport">;
    "circle-stroke-width"?: DataDrivenPropertyValue<number>;
    "circle-stroke-color"?: DataDrivenPropertyValue<string>;
    "circle-stroke-opacity"?: DataDrivenPropertyValue<number>;
  };
}

export interface IRRasterLayer extends IRLayerBase {
  type: "raster";
  paint?: {
    "raster-opacity"?: PropertyValue<number>;
    "raster-hue-rotate"?: PropertyValue<number>;
    "raster-brightness-min"?: PropertyValue<number>;
    "raster-brightness-max"?: PropertyValue<number>;
    "raster-saturation"?: PropertyValue<number>;
    "raster-contrast"?: PropertyValue<number>;
    "raster-resampling"?: PropertyValue<"linear" | "nearest">;
    "raster-fade-duration"?: PropertyValue<number>;
  };
}

export interface IRFillExtrusionLayer extends IRLayerBase {
  type: "fill-extrusion";
  paint?: {
    "fill-extrusion-opacity"?: PropertyValue<number>;
    "fill-extrusion-color"?: DataDrivenPropertyValue<string>;
    "fill-extrusion-translate"?: PropertyValue<[number, number]>;
    "fill-extrusion-translate-anchor"?: PropertyValue<"map" | "viewport">;
    "fill-extrusion-pattern"?: DataDrivenPropertyValue<string>;
    "fill-extrusion-height"?: DataDrivenPropertyValue<number>;
    "fill-extrusion-base"?: DataDrivenPropertyValue<number>;
    "fill-extrusion-vertical-gradient"?: PropertyValue<boolean>;
  };
}

export interface IRHeatmapLayer extends IRLayerBase {
  type: "heatmap";
  paint?: {
    "heatmap-radius"?: DataDrivenPropertyValue<number>;
    "heatmap-weight"?: DataDrivenPropertyValue<number>;
    "heatmap-intensity"?: PropertyValue<number>;
    "heatmap-color"?: PropertyValue<string>;
    "heatmap-opacity"?: PropertyValue<number>;
  };
}

export interface IRHillshadeLayer extends IRLayerBase {
  type: "hillshade";
  paint?: {
    "hillshade-illumination-direction"?: PropertyValue<number>;
    "hillshade-illumination-anchor"?: PropertyValue<"map" | "viewport">;
    "hillshade-exaggeration"?: PropertyValue<number>;
    "hillshade-shadow-color"?: PropertyValue<string>;
    "hillshade-highlight-color"?: PropertyValue<string>;
    "hillshade-accent-color"?: PropertyValue<string>;
  };
}

// ---------------------------------------------------------------------------
// Top-level style components
// ---------------------------------------------------------------------------

export type IRLight = Record<string, unknown>;
export type IRSky = Record<string, unknown>;
export type IRTerrain = Record<string, unknown>;
export type IRTransition = {
  duration?: number;
  delay?: number;
};

// ---------------------------------------------------------------------------
// The canonical intermediate representation
// ---------------------------------------------------------------------------

export interface IRStyle {
  version: 8;
  name?: string;
  metadata?: Record<string, unknown>;
  center?: [number, number];
  zoom?: number;
  bearing?: number;
  pitch?: number;
  sources: Record<string, IRSource>;
  layers: IRLayer[];
  sprite?: IRSprite;
  glyphs?: string;
  light?: IRLight;
  sky?: IRSky;
  terrain?: IRTerrain;
  transition?: IRTransition;
  _extensions?: {
    esri?: Record<string, unknown>;
    mapbox?: Record<string, unknown>;
    maplibre?: Record<string, unknown>;
  };
}
