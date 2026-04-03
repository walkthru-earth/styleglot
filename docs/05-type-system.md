# Type System

## Design goals

1. Full type safety from input to output
2. Discriminated unions for dialect-specific output types
3. Generic `transpile<D>()` function that returns the correct output type
4. No `any` types in the public API
5. Internal types mirror MapLibre style spec structure (our canonical IR)

## Core types

### Dialect

```typescript
type Dialect = "esri" | "mapbox" | "maplibre";
```

### Style types (IR = canonical form)

```typescript
// The canonical intermediate representation
interface IRStyle {
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
  // Lossless stash for dialect-specific extensions
  _extensions?: {
    esri?: Record<string, unknown>;
    mapbox?: Record<string, unknown>;
    maplibre?: Record<string, unknown>;
  };
}

// Sprite can be string or multi-sprite array
type IRSprite = string | Array<{ id: string; url: string }>;
```

### Source types

```typescript
type IRSource =
  | IRVectorSource
  | IRRasterSource
  | IRRasterDEMSource
  | IRGeoJSONSource
  | IRVideoSource
  | IRImageSource;

interface IRVectorSource {
  type: "vector";
  url?: string;              // TileJSON endpoint
  tiles?: string[];          // Direct tile URL templates
  minzoom?: number;
  maxzoom?: number;
  bounds?: [number, number, number, number];
  scheme?: "xyz" | "tms";
  attribution?: string;
  promoteId?: string | Record<string, string>;
  volatile?: boolean;
  encoding?: "mvt" | "mlt";  // MapLibre-specific
}

interface IRRasterSource {
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

interface IRRasterDEMSource {
  type: "raster-dem";
  url?: string;
  tiles?: string[];
  tileSize?: number;
  minzoom?: number;
  maxzoom?: number;
  bounds?: [number, number, number, number];
  encoding?: "terrarium" | "mapbox" | "custom";
  // MapLibre custom DEM decoding
  redFactor?: number;
  greenFactor?: number;
  blueFactor?: number;
  baseShift?: number;
}

interface IRGeoJSONSource {
  type: "geojson";
  data: unknown;  // GeoJSON object or URL string
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

interface IRVideoSource {
  type: "video";
  urls: string[];
  coordinates: [[number, number], [number, number], [number, number], [number, number]];
}

interface IRImageSource {
  type: "image";
  url: string;
  coordinates: [[number, number], [number, number], [number, number], [number, number]];
}
```

### Layer types

```typescript
type IRLayer =
  | IRBackgroundLayer
  | IRFillLayer
  | IRLineLayer
  | IRSymbolLayer
  | IRCircleLayer
  | IRRasterLayer
  | IRFillExtrusionLayer
  | IRHeatmapLayer
  | IRHillshadeLayer;

// Base layer interface
interface IRLayerBase {
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

// Each concrete layer type extends IRLayerBase with typed paint/layout
interface IRFillLayer extends IRLayerBase {
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

// ... similar for Line, Symbol, Circle, etc.
```

### Expression types

```typescript
// Expressions are JSON arrays or literal values
type IRExpression = unknown[];  // e.g. ["==", ["get", "type"], "park"]

// Property value can be a literal, a legacy stops object, or an expression
type PropertyValue<T> =
  | T                          // literal value
  | LegacyStopsFunction<T>    // {"stops": [[z, v], ...]}
  | IRExpression;              // ["interpolate", ...]

type DataDrivenPropertyValue<T> =
  | T
  | LegacyStopsFunction<T>
  | IRExpression;

interface LegacyStopsFunction<T> {
  stops: Array<[number, T]>;
  base?: number;
  type?: "identity" | "exponential" | "interval" | "categorical";
  property?: string;
  default?: T;
}
```

### Pipeline types

```typescript
interface TranspileOptions {
  fromDialect?: Dialect;       // Auto-detected if not provided
  toDialect: Dialect;          // Required
  baseUrl?: string;            // Esri VectorTileServer base URL
  token?: string;              // Esri token
  mapboxAccessToken?: string;  // Mapbox access token
  fontMapping?: Record<string, string>;
  modernizeExpressions?: boolean;  // Convert legacy stops to expressions
  strict?: boolean;            // Throw on lossy conversions
  plugins?: Plugin[];
  fetch?: FetchAdapter;        // Optional fetch for URL resolution
}

// Generic output type based on target dialect
type DialectOutput<D extends Dialect> =
  D extends "esri" ? EsriStyleOutput :
  D extends "mapbox" ? MapboxStyleOutput :
  D extends "maplibre" ? MaplibreStyleOutput :
  never;

interface TranspileResult<T = unknown> {
  output: T;                   // The transpiled style JSON
  warnings: ConversionWarning[];
  ir: IRStyle;                 // The intermediate representation (for debugging)
}

// Fully typed transpile function
function transpile<D extends Dialect>(
  input: unknown,
  options: TranspileOptions & { toDialect: D }
): TranspileResult<DialectOutput<D>>;
```

### Plugin types

```typescript
interface Plugin {
  name: string;
  beforeTransform?: (style: IRStyle, ctx: TransformContext) => IRStyle;
  afterTransform?: (style: IRStyle, ctx: TransformContext) => IRStyle;
  onLossyFeature?: (
    path: string,
    value: unknown,
    ctx: TransformContext
  ) => unknown | undefined;  // return substitute or undefined to drop
}
```

### Warning types

```typescript
interface ConversionWarning {
  code: string;             // e.g. "LOSSY_FOG", "UNSUPPORTED_LAYER_TYPE"
  message: string;
  path: string;             // JSON path, e.g. "layers[3].paint.fill-pattern"
  severity: "info" | "warn" | "drop";
  sourceDialect: Dialect;
  targetDialect: Dialect;
}
```

### Dialect-specific output types

```typescript
// Esri output: only the fields Esri root.json supports
interface EsriStyleOutput {
  version: 8;
  sprite: string;
  glyphs: string;
  sources: Record<string, { type: "vector"; url: string }>;
  layers: Array<{
    id: string;
    type: string;
    source: string;
    "source-layer"?: string;
    minzoom?: number;
    maxzoom?: number;
    filter?: unknown;
    layout?: Record<string, unknown>;
    paint?: Record<string, unknown>;
  }>;
}

// Mapbox output: full Mapbox style spec including proprietary extensions
interface MapboxStyleOutput extends IRStyle {
  fog?: Record<string, unknown>;
  lights?: Array<Record<string, unknown>>;
  // ... other Mapbox-specific top-level properties
}

// MapLibre output: full MapLibre style spec
interface MaplibreStyleOutput extends IRStyle {
  sky?: Record<string, unknown>;
  terrain?: Record<string, unknown>;
  projection?: unknown;
  state?: Record<string, unknown>;
  "font-faces"?: Array<Record<string, unknown>>;
}
```

## Type guards

```typescript
// Source type guards
function isVectorSource(s: IRSource): s is IRVectorSource { return s.type === "vector"; }
function isRasterSource(s: IRSource): s is IRRasterSource { return s.type === "raster"; }
function isGeoJSONSource(s: IRSource): s is IRGeoJSONSource { return s.type === "geojson"; }

// Layer type guards
function isFillLayer(l: IRLayer): l is IRFillLayer { return l.type === "fill"; }
function isLineLayer(l: IRLayer): l is IRLineLayer { return l.type === "line"; }
function isSymbolLayer(l: IRLayer): l is IRSymbolLayer { return l.type === "symbol"; }

// Dialect guards
function isEsriStyle(s: unknown): s is EsriStyleOutput { ... }
function isMapboxStyle(s: unknown): s is MapboxStyleOutput { ... }
function isMaplibreStyle(s: unknown): s is MaplibreStyleOutput { ... }

// Expression guards
function isExpression(v: unknown): v is IRExpression { return Array.isArray(v) && typeof v[0] === "string"; }
function isLegacyStops(v: unknown): v is LegacyStopsFunction<unknown> {
  return typeof v === "object" && v !== null && "stops" in v;
}
```
