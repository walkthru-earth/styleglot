# Architecture Overview: Map Style Transpiler

## Document index

| Doc | Topic |
|-----|-------|
| [00-overview.md](00-overview.md) | This file. Vision, pipeline, file structure, API |
| [01-dialect-differences.md](01-dialect-differences.md) | Full comparison: Esri vs Mapbox vs MapLibre (sources, sprites, glyphs, fonts, layers, expressions) |
| [02-detection-algorithm.md](02-detection-algorithm.md) | Auto-detection scoring algorithm with signal tables |
| [03-url-resolution.md](03-url-resolution.md) | URL rewriting for sprites, glyphs, sources, tiles across all dialects |
| [04-transform-pipeline.md](04-transform-pipeline.md) | All 10 transform steps with font mapping and PMTiles handling |
| [05-type-system.md](05-type-system.md) | Full TypeScript types, generics, type guards |
| [06-edge-cases-and-limitations.md](06-edge-cases-and-limitations.md) | PMTiles, projections, composite sources, 10 known limitations |
| [07-implementation-plan.md](07-implementation-plan.md) | 7-phase plan with Gantt chart, test strategy, migration guide |
| [08-esri-style-anatomy.md](08-esri-style-anatomy.md) | Deep analysis of real Esri root.json files |
| [09-esri-authentication.md](09-esri-authentication.md) | Esri token types, auth patterns, security, ArcGIS Online vs Enterprise |

## Vision

A zero-dependency, type-safe TypeScript library that parses, validates, detects, and transpiles between three map style dialects:

- **Esri** (ArcGIS VectorTileServer `root.json`)
- **Mapbox** (Mapbox GL Style Spec, including proprietary extensions)
- **MapLibre** (MapLibre GL Style Spec, the open fork)

Think of it as **Babel for map styles**: parse any dialect into a canonical intermediate representation (IR), run transforms, emit any target dialect.

## Why an IR-based pipeline?

Direct A-to-B converters between 3 dialects = 6 converters (N*(N-1)). Every bug fix applies to multiple paths. Adding a 4th dialect (e.g., Protomaps, MapTiler) would mean 12 converters.

With a canonical IR: N parsers + N emitters + shared transforms. Bug fixes apply once. This is how Babel, PostCSS, and ESLint work.

**The IR is MapLibre Style Spec v8** because:

- Most open (BSD-licensed, no proprietary cloud features)
- Strict superset of what Esri VectorTileServer styles use
- ~95% identical to Mapbox v8
- Fully documented with existing TypeScript types to reference

## Pipeline

```
Input (any dialect)
  |
  v
[1] detect(input) -> Dialect        // auto-detect which dialect the JSON is
  |
  v
[2] parse(input, dialect) -> IR      // dialect-specific normalization to canonical form
  |
  v
[3] transform(IR, transforms[]) -> IR  // sequential transform pipeline
  |
  v
[4] validate(IR) -> warnings/errors  // structural validation
  |
  v
[5] emit(IR, targetDialect) -> output  // dialect-specific output generation
  |
  v
Output (target dialect)
```

## Package structure

```
src/
  index.ts                    // Public API
  types/
    style.ts                  // IRStyle, IRSource, IRLayer, etc.
    dialect.ts                // Dialect enum, DialectOutput<D>
    options.ts                // TranspileOptions, TranspileResult
    plugin.ts                 // Plugin interface
    warnings.ts               // ConversionWarning
  detect/
    index.ts                  // detect() entry point
    esri.ts                   // Esri detection heuristics
    mapbox.ts                 // Mapbox detection heuristics
    maplibre.ts               // MapLibre detection (default)
  parsers/
    index.ts                  // Parser registry
    esri.ts                   // Esri -> IR
    mapbox.ts                 // Mapbox -> IR
    maplibre.ts               // MapLibre -> IR
  emitters/
    index.ts                  // Emitter registry
    esri.ts                   // IR -> Esri
    mapbox.ts                 // IR -> Mapbox
    maplibre.ts               // IR -> MapLibre
  transforms/
    index.ts                  // Default transform pipeline builder
    deref-layers.ts           // Resolve layer ref inheritance
    normalize-sources.ts      // url <-> tiles, TileJSON resolution
    rewrite-sprites.ts        // Sprite URL normalization
    rewrite-glyphs.ts         // Glyph/font URL normalization
    rewrite-fonts.ts          // Font stack mapping and fallback
    map-layer-properties.ts   // Property name/value dialect differences
    convert-expressions.ts    // Expression compatibility
    strip-lossy.ts            // Annotate or strip incompatible features
    normalize-pmtiles.ts      // PMTiles source handling
  url/
    index.ts                  // URL utilities
    resolve.ts                // Path resolution (../, relative)
    token.ts                  // Token/API key injection
    mapbox-protocol.ts        // mapbox:// -> HTTPS expansion
    pmtiles-protocol.ts       // pmtiles:// protocol handling
  validate/
    index.ts                  // Structural validator
    sources.ts                // Source validation
    layers.ts                 // Layer validation
    sprites.ts                // Sprite URL validation
    glyphs.ts                 // Glyph URL validation
  pipeline.ts                 // transpile() orchestrator
  utils.ts                    // Deep clone, type guards, etc.
```

## Public API surface

```typescript
// Core
transpile(input, options): TranspileResult
detect(input): Dialect
validate(style): ValidationResult

// Individual steps (for advanced usage)
parse(input, dialect, context): IRStyle
emit(ir, dialect, context): DialectOutput<D>

// Utilities
resolveEsriUrls(baseUrl, style): IRStyle
expandMapboxUrls(style, accessToken): IRStyle
isEsriStyle(input): boolean
isMapboxStyle(input): boolean
isMaplibreStyle(input): boolean

// Types (re-exported)
IRStyle, IRSource, IRLayer, Dialect, Plugin, TranspileOptions, ...
```

## Design principles

1. **Zero dependencies.** No runtime deps. Build with tsdown for CJS + ESM + .d.ts.
2. **Type-safe throughout.** Full TypeScript generics so `transpile<"maplibre">(...)` returns the correct output type.
3. **Pure functions.** No mutation of input. Every step returns a new object.
4. **Lossy-aware.** Every dropped feature produces a warning. Strict mode throws.
5. **Pluggable.** Plugin interface for custom transforms without forking.
6. **Fetch-free by default.** Core library does not fetch URLs. An optional `fetch` adapter can be passed for URL resolution that requires network access (like fetching Esri VectorTileServer metadata or TileJSON).
