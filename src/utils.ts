import type { Dialect } from "./types/dialect.ts";
import type { IRExpression, LegacyStopsFunction } from "./types/expressions.ts";
import type {
  IRBackgroundLayer,
  IRCircleLayer,
  IRFillExtrusionLayer,
  IRFillLayer,
  IRGeoJSONSource,
  IRLayer,
  IRLineLayer,
  IRRasterDEMSource,
  IRRasterSource,
  IRSource,
  IRSymbolLayer,
  IRVectorSource,
} from "./types/style.ts";
import type { ConversionWarning, WarningSeverity } from "./types/warnings.ts";

// ---------------------------------------------------------------------------
// Deep clone
// ---------------------------------------------------------------------------

/** Deep-clone any serialisable value using the built-in `structuredClone`. */
export function deepClone<T>(obj: T): T {
  return structuredClone(obj);
}

// ---------------------------------------------------------------------------
// Source type guards
// ---------------------------------------------------------------------------

export function isVectorSource(s: IRSource): s is IRVectorSource {
  return s.type === "vector";
}

export function isRasterSource(s: IRSource): s is IRRasterSource {
  return s.type === "raster";
}

export function isRasterDEMSource(s: IRSource): s is IRRasterDEMSource {
  return s.type === "raster-dem";
}

export function isGeoJSONSource(s: IRSource): s is IRGeoJSONSource {
  return s.type === "geojson";
}

// ---------------------------------------------------------------------------
// Layer type guards
// ---------------------------------------------------------------------------

export function isFillLayer(l: IRLayer): l is IRFillLayer {
  return l.type === "fill";
}

export function isLineLayer(l: IRLayer): l is IRLineLayer {
  return l.type === "line";
}

export function isSymbolLayer(l: IRLayer): l is IRSymbolLayer {
  return l.type === "symbol";
}

export function isCircleLayer(l: IRLayer): l is IRCircleLayer {
  return l.type === "circle";
}

export function isBackgroundLayer(l: IRLayer): l is IRBackgroundLayer {
  return l.type === "background";
}

export function isFillExtrusionLayer(l: IRLayer): l is IRFillExtrusionLayer {
  return l.type === "fill-extrusion";
}

// ---------------------------------------------------------------------------
// Expression guards
// ---------------------------------------------------------------------------

/** Returns `true` when the value looks like a MapLibre/Mapbox expression. */
export function isExpression(v: unknown): v is IRExpression {
  return Array.isArray(v) && typeof v[0] === "string";
}

/** Returns `true` when the value is a legacy stops-based function. */
export function isLegacyStops(v: unknown): v is LegacyStopsFunction<unknown> {
  return v !== null && typeof v === "object" && Array.isArray((v as Record<string, unknown>).stops);
}

// ---------------------------------------------------------------------------
// Warning factory
// ---------------------------------------------------------------------------

/** Create a `ConversionWarning` object with the given fields. */
export function createWarning(
  code: string,
  message: string,
  path: string,
  severity: WarningSeverity,
  sourceDialect: Dialect,
  targetDialect: Dialect,
): ConversionWarning {
  return { code, message, path, severity, sourceDialect, targetDialect };
}
