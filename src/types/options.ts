import type { Dialect } from "./dialect.ts";
import type { Plugin } from "./plugin.ts";
import type { IRStyle } from "./style.ts";
import type { ConversionWarning } from "./warnings.ts";

export type FetchAdapter = (url: string) => Promise<unknown>;

export interface TranspileOptions {
  /** Source dialect. Auto-detected if not provided. */
  fromDialect?: Dialect;
  /** Target dialect. Required. */
  toDialect: Dialect;
  /** Esri VectorTileServer base URL (required for Esri source/target). */
  baseUrl?: string;
  /** Esri token (API key, OAuth, or legacy). */
  token?: string;
  /** Mapbox access token (pk.eyJ1...). */
  mapboxAccessToken?: string;
  /** Font replacement map, e.g. { "Arial Regular": "Open Sans Regular" }. */
  fontMapping?: Record<string, string>;
  /** Convert legacy stops to modern expressions. Default: false. */
  modernizeExpressions?: boolean;
  /** Throw on lossy conversions instead of warning. Default: false. */
  strict?: boolean;
  /** Custom transform plugins. */
  plugins?: Plugin[];
  /** Optional fetch adapter for URL resolution requiring network access. */
  fetch?: FetchAdapter;
}

export interface TranspileResult<T = unknown> {
  /** The transpiled style JSON. */
  output: T;
  /** Warnings generated during transpilation. */
  warnings: ConversionWarning[];
  /** The intermediate representation (for debugging). */
  ir: IRStyle;
}

export interface TransformContext {
  sourceDialect: Dialect;
  targetDialect: Dialect;
  baseUrl?: string;
  esriToken?: string;
  mapboxAccessToken?: string;
  fontMapping?: Record<string, string>;
  plugins: Plugin[];
  warnings: ConversionWarning[];
  options: TranspileOptions;
}
