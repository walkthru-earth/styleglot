# Styleglot

[![npm version](https://img.shields.io/npm/v/@walkthru-earth/styleglot)](https://www.npmjs.com/package/@walkthru-earth/styleglot)
[![CI](https://github.com/walkthru-earth/styleglot/actions/workflows/ci.yml/badge.svg)](https://github.com/walkthru-earth/styleglot/actions/workflows/ci.yml)
[![License: CC-BY-4.0](https://img.shields.io/badge/License-CC--BY--4.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](https://www.npmjs.com/package/@walkthru-earth/styleglot)

Babel for map styles. A zero-dependency TypeScript library that transpiles between Esri, Mapbox, and MapLibre vector tile style specifications.

Parse any dialect into a canonical intermediate representation (IR), run transforms, emit any target dialect. 6 conversion directions, fully typed, lossy-aware.


## Install

```bash
pnpm add @walkthru-earth/styleglot
```

Also works with npm and yarn. Requires Node 18+.


## Quick start

```typescript
import { transpile } from "@walkthru-earth/styleglot";

// Pass a style object directly (no fetching needed)
const result = transpile(esriRootJson, {
  toDialect: "maplibre",
  baseUrl: "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer",
});

console.log(result.output);    // valid MapLibre style JSON
console.log(result.warnings);  // any lossy conversions
console.log(result.ir);        // intermediate representation for debugging
```

The input can be a plain JS object or a JSON string. The library does not fetch URLs, so you fetch the style yourself and pass the result directly.

The output type is inferred from `toDialect`:

```typescript
// Fully typed - result.output is MaplibreStyleOutput
const a = transpile<"maplibre">(style, { toDialect: "maplibre" });

// result.output is EsriStyleOutput
const b = transpile<"esri">(style, { toDialect: "esri", baseUrl: "..." });

// result.output is MapboxStyleOutput
const c = transpile<"mapbox">(style, { toDialect: "mapbox" });
```


## Supported conversions

| From / To   | Esri | Mapbox | MapLibre |
|-------------|------|--------|----------|
| **Esri**    | --   | Yes    | Yes      |
| **Mapbox**  | Yes  | --     | Yes      |
| **MapLibre**| Yes  | Yes    | --       |

All 6 directions work. Some conversions are lossy (Mapbox fog, MapLibre multi-sprite, Esri-only 5-key constraint). Lossy features are tracked in `result.warnings` with severity levels: `info`, `warn`, `drop`.


## API

### `transpile(input, options)`

The main entry point. Accepts a style JSON object or string.

```typescript
transpile(input: unknown, options: TranspileOptions): TranspileResult
```

**Options:**

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `toDialect` | `"esri" \| "mapbox" \| "maplibre"` | Yes | Target dialect |
| `fromDialect` | `"esri" \| "mapbox" \| "maplibre"` | No | Source dialect (auto-detected if omitted) |
| `baseUrl` | `string` | For Esri | Esri VectorTileServer base URL |
| `token` | `string` | No | Esri API key or token |
| `mapboxAccessToken` | `string` | For Mapbox | Mapbox access token (pk.eyJ1...) |
| `fontMapping` | `Record<string, string>` | No | Font name replacements |
| `modernizeExpressions` | `boolean` | No | Convert legacy stops to expressions |
| `strict` | `boolean` | No | Throw on lossy conversions |
| `plugins` | `Plugin[]` | No | Custom transform plugins |

### `transpileAsync(input, options)`

Async version that resolves TileJSON source URLs before transpiling. This allows non-Esri styles (Stadia, OpenFreeMap, etc.) to produce Esri output with real tile URLs.

```typescript
import { transpileAsync } from "@walkthru-earth/styleglot";

const result = await transpileAsync(stadiaStyle, {
  toDialect: "esri",
  resolveSources: true,  // fetch TileJSON URLs and inline tile arrays
});
```

Accepts the same options as `transpile()` plus:

| Option | Type | Description |
|--------|------|-------------|
| `resolveSources` | `boolean` | Fetch TileJSON URLs and inline resolved tile arrays |
| `fetch` | `typeof fetch` | Custom fetch function (defaults to global `fetch`) |

### `resolveEsriStyleUrls(style, baseUrl)`

Resolves relative URLs in Esri style output to absolute URLs. Useful when consuming the style directly without a VectorTileServer endpoint.

```typescript
import { transpile, resolveEsriStyleUrls } from "@walkthru-earth/styleglot";

const { output } = transpile(esriStyle, { toDialect: "esri", baseUrl });
const resolved = resolveEsriStyleUrls(output, baseUrl);
// resolved.sprite, .glyphs, .sources now have absolute URLs
```

### `detect(input)`

Auto-detect which dialect a style JSON belongs to.

```typescript
import { detect } from "@walkthru-earth/styleglot";

detect(style); // "esri" | "mapbox" | "maplibre"
```

Uses a scoring algorithm based on dialect-specific signals (URL patterns, proprietary properties, metadata keys). Falls back to `"maplibre"` when ambiguous.

### `validate(style)`

Structural validation of a style object.

```typescript
import { validate } from "@walkthru-earth/styleglot";

const { valid, errors } = validate(style);
```

### `parse(input, dialect, ctx)` / `emit(ir, dialect, ctx)`

Low-level access to individual pipeline stages. Useful for custom workflows.

```typescript
import { parse, emit } from "@walkthru-earth/styleglot";
```


## Font mapping

Esri uses Arial, Mapbox uses DIN Pro, MapLibre typically uses Open Sans. Pass a `fontMapping` to handle this:

```typescript
transpile(style, {
  toDialect: "maplibre",
  fontMapping: {
    "Arial Regular": "Open Sans Regular",
    "Arial Bold": "Open Sans Bold",
    "DIN Pro Regular": "Open Sans Regular",
    "DIN Pro Medium": "Open Sans Semibold",
    "DIN Pro Bold": "Open Sans Bold",
  },
});
```


## Plugins

Extend the transform pipeline without forking:

```typescript
import type { Plugin } from "@walkthru-earth/styleglot";

const myPlugin: Plugin = {
  name: "custom-source-rewrite",
  afterTransform(style, ctx) {
    // modify style here
    return style;
  },
};

transpile(style, {
  toDialect: "maplibre",
  plugins: [myPlugin],
});
```


## Tokens and authentication

**Esri:** Public Living Atlas basemaps require no token. Private services need a token passed via `options.token` or embedded in the `baseUrl` query string. The transpiler extracts, strips, and re-injects tokens automatically.

**Mapbox:** All `mapbox://` URL expansion requires `mapboxAccessToken`. The token is stripped from the IR and re-injected when emitting Mapbox output.

**MapLibre / open sources:** Most open providers (OpenFreeMap, MapLibre demo tiles) need no token. Existing query parameters on URLs are preserved.


## Architecture

```
Input (any dialect)
  |
  detect()    -> auto-detect source dialect
  |
  parse()     -> normalize to canonical IR (MapLibre Style Spec v8)
  |
  transform() -> 9 sequential transforms (URL rewriting, fonts, expressions, lossy stripping)
  |
  validate()  -> structural validation
  |
  emit()      -> dialect-specific output generation
  |
Output (target dialect)
```

The IR is MapLibre Style Spec v8 because it is the most open (BSD-licensed), a strict superset of what Esri styles use, and ~95% identical to Mapbox v8.


## Project structure

```
src/
  index.ts              public API barrel
  pipeline.ts           transpile() orchestrator
  utils.ts              deepClone, type guards, helpers
  types/                IR type system (7 files)
  detect/               dialect detection scoring (4 files)
  url/                  URL resolution, tokens, protocol expansion (5 files)
  validate/             structural validator (5 files)
  parsers/              Esri, Mapbox, MapLibre -> IR (4 files)
  transforms/           9 transform modules + pipeline builder (10 files)
  emitters/             IR -> Esri, Mapbox, MapLibre (4 files)
tests/
  fixtures/             minimal style fixtures for each dialect
  integration/          full pipeline tests, real URL tests, spec validation
```


## Development

```bash
pnpm install
pnpm lint          # biome check (lint + format)
pnpm typecheck     # tsc --noEmit
pnpm test          # run all tests
pnpm test:watch    # watch mode
pnpm build         # build CJS + ESM + .d.ts to dist/
pnpm check         # all three in sequence
```

Tests include:
- Unit tests for every module (URL utils, detection, validation, parsers, transforms, emitters)
- Integration tests for all 6 conversion directions with round-trip verification
- Live network tests against real public tile services (Esri Living Atlas, OpenFreeMap, Stadia Maps, MapLibre demo)
- Spec validation using `@maplibre/maplibre-gl-style-spec` to confirm output conforms to the official style spec

To run tests that hit real URLs, just have network access. No tokens needed for public URLs. For Mapbox tests, create a `.env` file:

```bash
cp .env.example .env
# add your VITE_MAPBOX_ACCESS_TOKEN
```

### Tech stack

- TypeScript 6.0 (ES2024 target, strict mode, erasableSyntaxOnly)
- tsdown (CJS + ESM + .d.ts builds)
- Vitest (test runner)
- Zero runtime dependencies


## Contributing

The codebase follows a few conventions:

- All transforms are pure functions: `(style, ctx) => style`. No mutation of input.
- All file imports use `.ts` extensions.
- No enums anywhere (`erasableSyntaxOnly`). Use string literal unions.
- `import type` for all type-only imports (`verbatimModuleSyntax`).
- Type guards use discriminated unions on `type` fields.

To add a new transform, create a file in `src/transforms/`, add it to the pipeline in `src/transforms/index.ts`, and write tests.

To add a new dialect, you need a parser in `src/parsers/`, an emitter in `src/emitters/`, a detection scorer in `src/detect/`, and corresponding type definitions.


## Conversion warnings

Every lossy or unsupported feature produces a warning in `result.warnings` with a code, message, and severity (`info`, `warn`, or `drop`). The table below lists all known warning codes.

### Lossy top-level features

These properties exist in one dialect but not another. They are stashed in `_extensions` and dropped from the output.

| Code | Severity | Description |
|------|----------|-------------|
| `LOSSY_FOG` | drop | Mapbox `fog` dropped when targeting MapLibre or Esri |
| `LOSSY_LIGHTS` | drop | Mapbox `lights` dropped when targeting MapLibre or Esri |
| `LOSSY_IMPORTS` | drop | Mapbox `imports` / style composition dropped |
| `LOSSY_SCHEMA` | drop | Mapbox-only top-level keys (`name`, `metadata`, `center`, `zoom`, `bearing`, `pitch`, `transition`) dropped for Esri |
| `LOSSY_SNOW` | drop | Mapbox `snow` dropped |
| `LOSSY_RAIN` | drop | Mapbox `rain` dropped |
| `LOSSY_CAMERA` | drop | Mapbox `centerAltitude` / `roll` dropped |
| `LOSSY_COLOR_THEME` | drop | Mapbox `colorTheme` dropped |
| `LOSSY_MODELS` | drop | Mapbox `models` dropped |
| `LOSSY_STATE` | drop | MapLibre `state` dropped when targeting Mapbox or Esri |
| `LOSSY_FONT_FACES` | drop | MapLibre `font-faces` dropped when targeting Mapbox or Esri |
| `LOSSY_TERRAIN` | drop | MapLibre `terrain` dropped when targeting Esri |
| `LOSSY_SKY` | drop | MapLibre `sky` dropped when targeting Esri |
| `LOSSY_LIGHT` | drop | Top-level `light` dropped when targeting Esri |

### Layer and property issues

| Code | Severity | Description |
|------|----------|-------------|
| `UNSUPPORTED_LAYER_TYPE` | drop | Layer type not supported by target (e.g., `heatmap`, `hillshade`, `raster` for Esri) |
| `UNSUPPORTED_PROPERTY` | warn | Paint/layout property not recognized by target dialect |
| `UNSUPPORTED_EXPRESSION` | warn | Expression operator stripped (e.g., Mapbox-only operators targeting MapLibre) |

### Font issues

| Code | Severity | Description |
|------|----------|-------------|
| `PROPRIETARY_FONT` | warn | Proprietary font stack detected with no mapping provided (e.g., `DIN Pro` without `fontMapping`) |

### Source and URL issues

| Code | Severity | Description |
|------|----------|-------------|
| `PMTILES_UNSUPPORTED_TARGET` | warn | PMTiles source used but target is not MapLibre (only MapLibre supports `pmtiles://` natively) |
| `MAPBOX_COMPOSITE_SOURCE` | info | Mapbox composite source detected |
| `MULTI_SPRITE_COLLAPSED` | info | MapLibre multi-sprite array collapsed to a single string for Mapbox/Esri |
| `MLT_ENCODING_UNSUPPORTED` | warn | MLT tile encoding not supported by target |

### Esri-specific

| Code | Severity | Description |
|------|----------|-------------|
| `ESRI_ITEM_URL_NEEDS_BASE` | info | Esri `/items/` URL detected, may need a `baseUrl` for correct resolution |
| `ESRI_TOKEN_DETECTED` | info | Esri API token found in input URL |
| `ESRI_TOKEN_IN_OUTPUT` | warn | Esri token present in output URLs (review before publishing) |
| `NON_MERCATOR_PROJECTION` | warn | Non-Web Mercator projection detected, not supported |

### Other

| Code | Severity | Description |
|------|----------|-------------|
| `GLOBAL_STATE_DROPPED` | drop | MapLibre global `state` dropped |
| `VALIDATION_ERROR` | warn | Structural validation error in the output (added by the pipeline) |


## Limitations

1. No tile data transformation. Only style JSON is transpiled, not vector tile content.
2. No runtime mutation. The library produces static style JSON, not a live style object.
3. No network fetching by default. The core `transpile()` is fetch-free. Use `transpileAsync()` with `resolveSources: true` for TileJSON resolution.
4. Font and sprite assets are not bundled. Font mapping translates names, but the actual font PBF/sprite PNG files must be hosted separately.
5. Proprietary features are lossy. Mapbox fog, lights, imports, style composition, PBR properties. MapLibre multi-sprite, global-state, font-faces. These are dropped (with warnings) when targeting a dialect that does not support them.
6. Esri styles with non-Web Mercator projections are not supported.
7. PMTiles sources only work natively in MapLibre. A warning is emitted for other targets.

See `docs/06-edge-cases-and-limitations.md` for the full list.


## Trademarks and third-party notices

This library transpiles between style specifications documented by:
- [MapLibre](https://maplibre.org/) (maplibre-style-spec, ISC license)
- [Mapbox](https://www.mapbox.com/) (Mapbox Style Specification)
- [Esri](https://www.esri.com/) (ArcGIS Vector Tile Style)

This project is not affiliated with, endorsed by, or sponsored by Mapbox, Esri, or the MapLibre Organization. All trademarks and registered trademarks are the property of their respective owners.

Users are responsible for complying with the terms of service of whatever tile providers they access, including Esri attribution requirements, Mapbox account terms, and any applicable data licensing. This library is a format converter and does not grant rights to use any third-party services, tiles, fonts, or sprites.


## License

CC-BY-4.0. See LICENSE file.
