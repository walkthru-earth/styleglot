# Dialect Differences: Esri vs Mapbox vs MapLibre

## Top-level properties

| Property | Esri | Mapbox | MapLibre | Notes |
|----------|------|--------|----------|-------|
| `version` | 8 | 8 | 8 | Always 8 in all three |
| `name` | Never present | Optional | Optional | Esri styles have no name field |
| `metadata` | Never present | Mapbox Studio hints (`mapbox:groups`, `mapbox:autocomposite`) | Optional, free-form | |
| `center` | Never present | Optional `[lng, lat]` | Optional `[lng, lat]` | |
| `zoom` | Never present | Optional | Optional | |
| `bearing` | Never present | Optional | Optional | |
| `pitch` | Never present | Optional | Optional | |
| `roll` | Never | Never | Optional | MapLibre-only (v5+, 6DOF camera) |
| `centerAltitude` | Never | Never | Optional | MapLibre-only (v5+) |
| `sprite` | Relative (`../sprites/sprite`) | `mapbox://sprites/...` or HTTPS | HTTPS URL or `[{id, url}]` array | Three completely different patterns |
| `glyphs` | Relative (`../fonts/{fontstack}/{range}.pbf`) | `mapbox://fonts/...` | HTTPS `.../{fontstack}/{range}.pbf` | Three completely different patterns |
| `sources` | Single source named `"esri"` with relative `url` | `mapbox://` protocol or HTTPS | HTTPS URLs | |
| `layers` | Array | Array | Array | Core structure identical |
| `light` | Never present | Optional | Optional | Single light object |
| `lights` | Never | PBR ambient + directional array | Never | Mapbox-only (replaces `light`) |
| `fog` | Never | Optional | Never | Mapbox-only atmosphere |
| `sky` | Never | Optional | Optional | Different schemas (Mapbox vs MapLibre) |
| `terrain` | Never | Optional | Optional | Identical schema |
| `projection` | Never | `{name: "globe"}` etc. | Optional (string or expression) | Different schemas |
| `transition` | Never present | Optional | Optional | |
| `state` | Never | Never | Optional | MapLibre-only global state |
| `font-faces` | Never | Never | Optional | MapLibre-only direct font files |
| `imports` | Never | Style composition array | Never | Mapbox v3 only |
| `schema` | Never | Theming config schema | Never | Mapbox v3 only |
| `snow` / `rain` | Never | Experimental | Never | Mapbox-only |
| `camera` | Never | perspective/ortho | Never | Mapbox-only |
| `color-theme` | Never | Global color LUT | Never | Mapbox-only |
| `models` | Never | 3D model registry | Never | Mapbox-only |
| `indoor` | Never | Floor filtering | Never | Mapbox-only |

## Sources

### Esri pattern
```json
"sources": {
  "esri": {
    "type": "vector",
    "url": "../../"
  }
}
```
- Always a single source named `"esri"`
- `url` is always relative `"../../"` (from `resources/styles/` to VectorTileServer root)
- No `tiles`, `minzoom`, `maxzoom`, `attribution`, `bounds` in the style itself
- Tile URL is always `{base}/tile/{z}/{y}/{x}.pbf` (Esri uses **{z}/{y}/{x}** order)
- The VectorTileServer REST endpoint (`?f=json`) contains the TileJSON-like metadata

### Mapbox pattern
```json
"sources": {
  "composite": {
    "type": "vector",
    "url": "mapbox://mapbox.mapbox-streets-v8,mapbox.mapbox-terrain-v2"
  }
}
```
- `mapbox://` protocol requires expansion to `https://api.mapbox.com/v4/{tileset}.json`
- Composite sources: comma-separated tileset IDs in one `mapbox://` URL
- Access token required for all tile/metadata fetches
- Source types: `vector`, `raster`, `raster-dem`, `raster-array`, `geojson`, `video`, `image`, `model`, `batched-model`

### MapLibre pattern
```json
"sources": {
  "openmaptiles": {
    "type": "vector",
    "url": "https://tiles.example.com/data/v3.json",
    "attribution": "..."
  }
}
```
Or direct tiles:
```json
"sources": {
  "openmaptiles": {
    "type": "vector",
    "tiles": ["https://tiles.example.com/data/{z}/{x}/{y}.pbf"],
    "minzoom": 0,
    "maxzoom": 14
  }
}
```
- Always absolute HTTPS URLs
- Both `url` (TileJSON) and `tiles` (direct) patterns are valid
- Source types: `vector`, `raster`, `raster-dem`, `geojson`, `video`, `image`
- Supports `encoding: "mvt" | "mlt"` for vector sources (MapLibre Tiles format)

### PMTiles sources (MapLibre-specific)
```json
"sources": {
  "buildings": {
    "type": "vector",
    "url": "pmtiles://https://example.com/buildings.pmtiles"
  }
}
```
- Uses `pmtiles://` protocol prefix
- Requires client-side protocol handler registration
- Not natively supported by Mapbox or Esri

## Sprites

### Esri
```json
"sprite": "../sprites/sprite"
```
- Always relative to `resources/styles/root.json`
- Resolves to `{VectorTileServer}/resources/sprites/sprite`
- Renderer fetches `sprite.json` (index) and `sprite.png` (sheet)
- Also `sprite@2x.json` / `sprite@2x.png` for HiDPI
- Sprite icon names use slashes: `"railway (tunnel)/disused"`, `"natural cliff/0"`

### Mapbox
```json
"sprite": "mapbox://sprites/mapbox/streets-v12"
```
- `mapbox://sprites/{owner}/{style-id}` protocol
- Resolves to `https://api.mapbox.com/styles/v1/{owner}/{style-id}/sprite{@2x}{.json|.png}?access_token=...`
- Icon names follow Maki conventions: `airport-11`, `restaurant-15`

### MapLibre
```json
"sprite": "https://tiles.example.com/sprites/sprite"
```
Or multi-sprite (MapLibre v3+):
```json
"sprite": [
  {"id": "default", "url": "https://tiles.example.com/sprites/default"},
  {"id": "maki", "url": "https://tiles.example.com/sprites/maki"}
]
```
- Always absolute HTTPS URLs
- Multi-sprite array is MapLibre-only (Mapbox does not support it)
- Same `{url}.json` / `{url}.png` / `{url}@2x.json` / `{url}@2x.png` fetch pattern

## Glyphs / Fonts

### Esri
```json
"glyphs": "../fonts/{fontstack}/{range}.pbf"
```
- Always relative to `resources/styles/root.json`
- Resolves to `{VectorTileServer}/resources/fonts/{fontstack}/{range}.pbf`
- Font stacks used: `Arial Regular`, `Arial Bold`, `Arial Italic`, `Arial Unicode MS Regular`, `Arial Unicode MS Bold`
- These are Esri-hosted SDF PBF glyph files
- `{fontstack}` and `{range}` are template placeholders substituted by the renderer

### Mapbox
```json
"glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf"
```
- `mapbox://fonts/{owner}/{fontstack}/{range}.pbf` protocol
- Resolves to `https://api.mapbox.com/fonts/v1/{owner}/{fontstack}/{range}.pbf?access_token=...`
- Proprietary fonts: `DIN Pro Regular`, `DIN Pro Medium`, `DIN Pro Bold` (licensed, not freely available)
- Fallback fonts: `Arial Unicode MS Regular`

### MapLibre
```json
"glyphs": "https://fonts.example.com/{fontstack}/{range}.pbf"
```
- Always absolute HTTPS
- Common free font servers: OpenFreeMap, Protomaps, MapTiler (free tier)
- Common open fonts: `Open Sans`, `Noto Sans`, `Roboto`, `Inter`
- MapLibre also supports `font-faces` (direct font file URLs, no SDF needed, v5+)

### Font compatibility matrix

| Font family | Esri | Mapbox | MapLibre | Notes |
|-------------|------|--------|----------|-------|
| Arial Regular/Bold | Yes (native) | No | No | Esri-hosted only |
| Arial Unicode MS | Yes | Yes (fallback) | Rare | Common fallback |
| DIN Pro | No | Yes (proprietary) | No | Mapbox-licensed |
| Open Sans | No | Yes (older styles) | Yes (common) | Freely available |
| Noto Sans | No | No | Yes (common) | Google open font |
| Roboto | No | No | Yes (common) | Google open font |

**Implication for transpiler:** Font stacks cannot be transparently converted. The transpiler should:
1. Preserve original font stacks by default (they may work if the target has the same fonts)
2. Provide a `fontMapping` option for users to specify replacements
3. Warn when proprietary fonts (DIN Pro) or Esri-specific fonts (Arial) are used in a target that likely doesn't host them

## Layer types

| Type | Esri | Mapbox | MapLibre | Notes |
|------|------|--------|----------|-------|
| `background` | Yes | Yes | Yes | |
| `fill` | Yes | Yes | Yes | |
| `line` | Yes | Yes | Yes | |
| `symbol` | Yes | Yes | Yes | |
| `circle` | Yes | Yes | Yes | |
| `raster` | No | Yes | Yes | Esri tiles are always vector |
| `fill-extrusion` | Yes (rare) | Yes | Yes | |
| `heatmap` | No | Yes | Yes | |
| `hillshade` | No | Yes | Yes | MapLibre has extended `hillshade-method` |
| `building` | No | Yes (proprietary) | No | Mapbox 3D buildings |
| `model` | No | Yes (proprietary) | No | Mapbox 3D models |
| `raster-particle` | No | Yes (proprietary) | No | Mapbox animated particles |
| `slot` | No | Yes (proprietary) | No | Mapbox style composition |
| `clip` | No | Yes (proprietary) | No | Mapbox masking |
| `sky` | No | Yes | Yes | Different schemas |
| `color-relief` | No | No | Yes (MapLibre-only) | Elevation coloring |

## Expressions

### Shared (all three dialects)
All three support the core Mapbox expression language: `get`, `has`, `at`, `length`, `in`, `case`, `match`, `coalesce`, `step`, `interpolate`, `interpolate-hcl`, `interpolate-lab`, `literal`, `all`, `any`, `!`, `==`, `!=`, `<`, `>`, `<=`, `>=`, `to-boolean`, `to-color`, `to-number`, `to-string`, `typeof`, `geometry-type`, `id`, `properties`, `feature-state`, `zoom`, `heatmap-density`, `line-progress`, `format`, `image`, `number-format`, `upcase`, `downcase`, `concat`, `index-of`, `slice`, `resolved-locale`, `let`, `var`, `rgb`, `rgba`, etc.

### Esri only
- Uses legacy `{"stops": [[z, value], ...]}` syntax exclusively (never modern expressions)
- Uses `_symbol` integer attribute for feature classification
- Uses `{_name}`, `{_name_global}` text field tokens

### Mapbox only
- `config` (reads theming schema values)
- `distance` (distance to GeoJSON geometry)
- `worldview` (geopolitical boundary variant)
- `measure-light` (PBR light query)
- `sky-radial-progress` (sky rendering)
- `raster-particle-speed`, `raster-value` (raster-particle layer)
- `is-active-floor` (indoor)
- `pitch` (camera pitch as expression input)
- `random` (deterministic pseudorandom)
- `distance-from-center` (distance from map center)

### MapLibre only
- `distance` (also added independently, compatible with Mapbox's)
- `elevation` (current pixel elevation)
- `global-state` (reads from style `state` schema)
- `split` (string split)
- `join` (array join to string)

### Legacy filter syntax
All three still accept legacy filters (`["==", "field", "value"]`). Modern expressions use `["==", ["get", "field"], "value"]`. The transpiler should handle both.

## Text field tokens

| Token pattern | Esri | Mapbox | MapLibre |
|---------------|------|--------|----------|
| `{_name}` | Yes (primary) | No | No |
| `{_name_global}` | Yes | No | No |
| `{_name1}` through `{_name42}` | Yes (OSM v2) | No | No |
| `{name}` | No | Yes | Yes |
| `{name_en}` | No | Yes | Yes |
| `{name:latin}` | No | No | Yes (some) |
| Expression: `["get", "name"]` | No | Yes | Yes |
| Expression: `["coalesce", ...]` | No | Yes | Yes |

## Metadata conventions

### Esri
No metadata in root.json. Ever.

### Mapbox
```json
"metadata": {
  "mapbox:autocomposite": true,
  "mapbox:type": "template",
  "mapbox:groups": { "group-id": { "name": "Roads", "collapsed": true } }
}
```
Layer-level:
```json
"metadata": {
  "mapbox:featureComponent": "land-and-water",
  "mapbox:group": "Land & water, land"
}
```

### MapLibre
Free-form. Common patterns:
```json
"metadata": {
  "maptiler:copyright": "...",
  "openmaptiles:version": "3.x"
}
```
