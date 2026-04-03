# Styleglot

Babel for map styles. A zero-dependency TypeScript library that transpiles between Esri, Mapbox, and MapLibre vector tile style specifications.

Parse any dialect into a canonical intermediate representation (IR), run transforms, emit any target dialect. 6 conversion directions, fully typed, lossy-aware.


## Install

```bash
pnpm add styleglot
```

Also works with npm and yarn. Requires Node 18+.


## Quick start

```typescript
import { transpile } from "styleglot";

// Esri -> MapLibre
const result = transpile(esriRootJson, {
  toDialect: "maplibre",
  baseUrl: "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer",
});

console.log(result.output);   // valid MapLibre style JSON
console.log(result.warnings);  // any lossy conversions
console.log(result.ir);        // intermediate representation for debugging
```

The output type is inferred from `toDialect`:

```typescript
// Fully typed - result.output is MaplibreStyleOutput
const a = transpile<"maplibre">(style, { toDialect: "maplibre" });

// result.output is EsriStyleOutput (exactly 5 keys)
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

### `detect(input)`

Auto-detect which dialect a style JSON belongs to.

```typescript
import { detect } from "styleglot";

detect(style); // "esri" | "mapbox" | "maplibre"
```

Uses a scoring algorithm based on dialect-specific signals (URL patterns, proprietary properties, metadata keys). Falls back to `"maplibre"` when ambiguous.

### `validate(style)`

Structural validation of a style object.

```typescript
import { validate } from "styleglot";

const { valid, errors } = validate(style);
```

### `parse(input, dialect, ctx)` / `emit(ir, dialect, ctx)`

Low-level access to individual pipeline stages. Useful for custom workflows.

```typescript
import { parse, emit } from "styleglot";
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
import type { Plugin } from "styleglot";

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
pnpm lint          # type-check (tsc --noEmit)
pnpm test          # run all tests
pnpm test:watch    # watch mode
pnpm build         # build CJS + ESM + .d.ts to dist/
```

Tests include:
- Unit tests for every module (URL utils, detection, validation, parsers, transforms, emitters)
- Integration tests for all 6 conversion directions with round-trip verification
- Live network tests against real public tile services (Esri Living Atlas, OpenFreeMap, Stadia Maps, MapLibre demo)
- Spec validation using `@maplibre/maplibre-gl-style-spec` to confirm output conforms to the official style spec

To run tests that hit real URLs, just have network access. No tokens needed for public URLs. For Mapbox tests, create a `.env` file:

```bash
cp .env.example .env
# add your MAPBOX_ACCESS_TOKEN
```

### Tech stack

- TypeScript 5.9 (ES2024 target, strict mode, erasableSyntaxOnly)
- tsup (CJS + ESM + .d.ts builds)
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


## Limitations

1. No tile data transformation. Only style JSON is transpiled, not vector tile content.
2. No runtime mutation. The library produces static style JSON, not a live style object.
3. No network fetching by default. The core library is fetch-free. Pass a `fetch` adapter for URL resolution that needs network.
4. Font and sprite assets are not bundled. Font mapping translates names, but the actual font PBF/sprite PNG files must be hosted separately.
5. Proprietary features are lossy. Mapbox fog, lights, imports, style composition, PBR properties. MapLibre multi-sprite, global-state, font-faces. These are dropped (with warnings) when targeting a dialect that does not support them.
6. Esri styles with non-Web Mercator projections are not supported.
7. PMTiles sources only work natively in MapLibre. A warning is emitted for other targets.

See `docs/06-edge-cases-and-limitations.md` for the full list.


## License

CC-BY-4.0. See LICENSE file.
