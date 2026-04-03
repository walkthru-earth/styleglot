# Dialect Detection Algorithm

## Goal

Given an arbitrary style JSON object, determine whether it's Esri, Mapbox, or MapLibre. Detection must be fast (no network), deterministic, and handle ambiguous cases gracefully.

## Detection signals (ordered by confidence)

### Esri indicators (high confidence)

| Signal | Confidence | Check |
|--------|------------|-------|
| Source `url` contains `/VectorTileServer` | Very high | `sources.*.url.includes("/VectorTileServer")` |
| Source `url` is `../../` | Very high | `sources.*.url === "../../"` |
| Sprite starts with `../` | High | `sprite.startsWith("../")` |
| Glyphs starts with `../` | High | `glyphs.startsWith("../")` |
| Source named exactly `"esri"` | Medium | `"esri" in sources` |
| Layer IDs contain `/` | Medium | `layers.some(l => l.id.includes("/"))` |
| Layers use `_symbol` filter | Medium | `layers.some(l => filterUses(l.filter, "_symbol"))` |
| No `name`, `metadata`, `center`, `zoom` | Low | Absence of standard MapLibre/Mapbox fields |
| Text fields reference `{_name}` | Medium | Layout `text-field` contains `{_name}` |

### Mapbox indicators (high confidence)

| Signal | Confidence | Check |
|--------|------------|-------|
| Source `url` starts with `mapbox://` | Very high | `sources.*.url.startsWith("mapbox://")` |
| Sprite starts with `mapbox://` | Very high | `sprite.startsWith("mapbox://")` |
| Glyphs starts with `mapbox://` | Very high | `glyphs.startsWith("mapbox://")` |
| Has `fog` top-level property | High | `"fog" in style` |
| Has `imports` top-level property | High | `"imports" in style` |
| Has `schema` top-level property | High | `"schema" in style` |
| Has `lights` (array) top-level property | High | `Array.isArray(style.lights)` |
| Metadata has `mapbox:` prefixed keys | High | `metadata["mapbox:autocomposite"]` etc. |
| Has `owner`, `visibility`, `draft` top-level | Medium | Mapbox Styles API fields |
| Layer types: `building`, `model`, `slot`, `clip` | High | Mapbox-proprietary layer types |
| Has `snow`, `rain`, `camera`, `color-theme` | High | Mapbox experimental features |

### MapLibre indicators (default fallback)

| Signal | Confidence | Check |
|--------|------------|-------|
| Sprite is `[{id, url}]` array | High | Multi-sprite = MapLibre v3+ |
| Has `state` top-level property | High | MapLibre global state |
| Has `font-faces` top-level property | High | MapLibre-only |
| Has `centerAltitude` or `roll` | High | MapLibre v5+ camera |
| Layer type `color-relief` | High | MapLibre-only |
| Expressions use `global-state` | Medium | MapLibre-only expression |
| Source `encoding: "mlt"` | High | MapLibre Tiles format |
| No Esri or Mapbox signals found | Default | Treat as MapLibre |

## Algorithm

```typescript
function detect(style: unknown): Dialect {
  if (typeof style !== "object" || style === null) {
    throw new DetectionError("Input must be a non-null object");
  }

  const s = style as Record<string, unknown>;
  let esriScore = 0;
  let mapboxScore = 0;
  let maplibreScore = 0;

  // --- Esri signals ---
  if (hasEsriSources(s)) esriScore += 10;
  if (hasRelativeSprite(s)) esriScore += 5;
  if (hasRelativeGlyphs(s)) esriScore += 5;
  if (hasEsriSourceName(s)) esriScore += 3;
  if (hasSlashLayerIds(s)) esriScore += 2;
  if (hasSymbolFilters(s)) esriScore += 2;

  // --- Mapbox signals ---
  if (hasMapboxProtocolUrls(s)) mapboxScore += 10;
  if (hasMapboxTopLevelProps(s)) mapboxScore += 5;
  if (hasMapboxMetadata(s)) mapboxScore += 3;
  if (hasMapboxApiFields(s)) mapboxScore += 3;
  if (hasMapboxProprietaryLayers(s)) mapboxScore += 5;

  // --- MapLibre signals ---
  if (hasMultiSprite(s)) maplibreScore += 5;
  if (hasMaplibreTopLevelProps(s)) maplibreScore += 5;
  if (hasMaplibreProprietaryLayers(s)) maplibreScore += 5;
  if (hasMaplibreExpressions(s)) maplibreScore += 3;

  // Highest score wins
  const max = Math.max(esriScore, mapboxScore, maplibreScore);

  if (max === 0) return "maplibre"; // default fallback
  if (esriScore === max) return "esri";
  if (mapboxScore === max) return "mapbox";
  return "maplibre";
}
```

## Edge cases

### Esri style that has been partially resolved
A user may have already resolved Esri relative paths to absolute URLs. In that case the `../` signals are gone. Detection still works via:
- Source URL containing `/VectorTileServer`
- Layer IDs with slashes
- `_symbol` filters

### Mapbox style served without `mapbox://` URLs
Some Mapbox styles are exported with resolved HTTPS URLs (e.g., via Mapbox Studio export). Detection relies on:
- `fog`, `lights`, `imports`, `schema` top-level
- Mapbox-proprietary layer types
- `mapbox:` metadata keys

### Already-converted styles
If a style was previously transpiled from Esri to MapLibre, it will detect as MapLibre (which is correct, as it is now in MapLibre format).

### PMTiles sources
A style with `pmtiles://` source URLs detects as MapLibre (PMTiles is only supported by MapLibre).

### Manual override
Users can bypass detection by specifying `fromDialect` in options:
```typescript
transpile(style, { fromDialect: "esri", toDialect: "maplibre" })
```
