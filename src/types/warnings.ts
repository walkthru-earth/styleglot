import type { Dialect } from "./dialect.ts";

export type WarningSeverity = "info" | "warn" | "drop";

export interface ConversionWarning {
  code: string;
  message: string;
  path: string;
  severity: WarningSeverity;
  sourceDialect: Dialect;
  targetDialect: Dialect;
}

/**
 * Known warning codes. Using a const object (not an enum) per erasableSyntaxOnly.
 */
export const WARNING_CODES = {
  // Lossy top-level features
  LOSSY_FOG: "LOSSY_FOG",
  LOSSY_LIGHTS: "LOSSY_LIGHTS",
  LOSSY_IMPORTS: "LOSSY_IMPORTS",
  LOSSY_SCHEMA: "LOSSY_SCHEMA",
  LOSSY_SNOW: "LOSSY_SNOW",
  LOSSY_RAIN: "LOSSY_RAIN",
  LOSSY_CAMERA: "LOSSY_CAMERA",
  LOSSY_COLOR_THEME: "LOSSY_COLOR_THEME",
  LOSSY_MODELS: "LOSSY_MODELS",
  LOSSY_STATE: "LOSSY_STATE",
  LOSSY_FONT_FACES: "LOSSY_FONT_FACES",
  LOSSY_TERRAIN: "LOSSY_TERRAIN",
  LOSSY_SKY: "LOSSY_SKY",
  LOSSY_LIGHT: "LOSSY_LIGHT",

  // Layer and property issues
  UNSUPPORTED_LAYER_TYPE: "UNSUPPORTED_LAYER_TYPE",
  UNSUPPORTED_PROPERTY: "UNSUPPORTED_PROPERTY",
  UNSUPPORTED_EXPRESSION: "UNSUPPORTED_EXPRESSION",

  // Font issues
  PROPRIETARY_FONT: "PROPRIETARY_FONT",

  // Source and URL issues
  PMTILES_UNSUPPORTED_TARGET: "PMTILES_UNSUPPORTED_TARGET",
  MAPBOX_COMPOSITE_SOURCE: "MAPBOX_COMPOSITE_SOURCE",
  MULTI_SPRITE_COLLAPSED: "MULTI_SPRITE_COLLAPSED",
  MLT_ENCODING_UNSUPPORTED: "MLT_ENCODING_UNSUPPORTED",

  // Esri-specific
  ESRI_ITEM_URL_NEEDS_BASE: "ESRI_ITEM_URL_NEEDS_BASE",
  ESRI_TOKEN_DETECTED: "ESRI_TOKEN_DETECTED",
  ESRI_TOKEN_IN_OUTPUT: "ESRI_TOKEN_IN_OUTPUT",
  NON_MERCATOR_PROJECTION: "NON_MERCATOR_PROJECTION",

  // MapLibre-specific
  GLOBAL_STATE_DROPPED: "GLOBAL_STATE_DROPPED",
} as const satisfies Record<string, string>;
