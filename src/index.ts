// Styleglot - Map style transpiler
// Public API

export { detect } from "./detect/index.ts";
export { emit, resolveEsriStyleUrls } from "./emitters/index.ts";
export { parse } from "./parsers/index.ts";
// Core functions
export { transpile, transpileAsync } from "./pipeline.ts";
// Types
export type {
  Dialect,
  DialectOutput,
  EsriLayerOutput,
  EsriStyleOutput,
  MapboxStyleOutput,
  MaplibreStyleOutput,
} from "./types/dialect.ts";
export { DIALECTS } from "./types/dialect.ts";
export type {
  DataDrivenPropertyValue,
  IRExpression,
  LegacyStopsFunction,
  PropertyValue,
} from "./types/expressions.ts";
export type {
  FetchAdapter,
  TransformContext,
  TranspileOptions,
  TranspileResult,
} from "./types/options.ts";
export type { Plugin } from "./types/plugin.ts";
export type {
  IRBackgroundLayer,
  IRCircleLayer,
  IRFillExtrusionLayer,
  IRFillLayer,
  IRGeoJSONSource,
  IRHeatmapLayer,
  IRHillshadeLayer,
  IRImageSource,
  IRLayer,
  IRLayerBase,
  IRLight,
  IRLineLayer,
  IRRasterDEMSource,
  IRRasterLayer,
  IRRasterSource,
  IRSky,
  IRSource,
  IRSprite,
  IRStyle,
  IRSymbolLayer,
  IRTerrain,
  IRTransition,
  IRVectorSource,
  IRVideoSource,
} from "./types/style.ts";
export type { ConversionWarning, WarningSeverity } from "./types/warnings.ts";
export { WARNING_CODES } from "./types/warnings.ts";
export {
  expandMapboxGlyphUrl,
  expandMapboxSourceUrl,
  expandMapboxSpriteUrl,
  isMapboxUrl,
} from "./url/mapbox-protocol.ts";
export { isPMTilesUrl, stripPMTilesProtocol } from "./url/pmtiles-protocol.ts";
// URL utilities
export {
  getResourceBaseUrl,
  getStyleBaseUrl,
  resolveEsriGlyphUrl,
  resolveEsriSourceUrl,
  resolveEsriSpriteUrl,
  resolveRelativeUrl,
} from "./url/resolve.ts";
export {
  appendToken,
  extractToken,
  resolveEsriToken,
  stripToken,
} from "./url/token.ts";
// Type guards
export {
  deepClone,
  isBackgroundLayer,
  isCircleLayer,
  isExpression,
  isFillExtrusionLayer,
  isFillLayer,
  isGeoJSONSource,
  isLegacyStops,
  isLineLayer,
  isRasterDEMSource,
  isRasterSource,
  isSymbolLayer,
  isVectorSource,
} from "./utils.ts";
export type { ValidationResult } from "./validate/index.ts";
export { validate } from "./validate/index.ts";
