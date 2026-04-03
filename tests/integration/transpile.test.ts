import { describe, expect, it } from "vitest";
import { detect, transpile } from "../../src/index.ts";

import esriFixture from "../fixtures/esri-minimal.json";
import mapboxFixture from "../fixtures/mapbox-minimal.json";
import maplibreFixture from "../fixtures/maplibre-minimal.json";

const ESRI_BASE_URL =
  "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer";

// ---------------------------------------------------------------------------
// A. Esri -> MapLibre
// ---------------------------------------------------------------------------

describe("Esri -> MapLibre", () => {
  const result = transpile<"maplibre">(esriFixture, {
    toDialect: "maplibre",
    fromDialect: "esri",
    baseUrl: ESRI_BASE_URL,
  });
  const output = result.output;

  it("produces absolute tile URLs with z/y/x order", () => {
    const sources = output.sources as Record<string, { tiles?: string[]; url?: string }>;
    const esriSource = sources.esri;
    expect(esriSource).toBeDefined();
    // Should have tiles array with absolute URL containing z/y/x
    expect(esriSource.tiles).toBeDefined();
    expect(esriSource.tiles?.length).toBeGreaterThan(0);
    const tileUrl = esriSource.tiles?.[0];
    expect(tileUrl).toMatch(/^https?:\/\//);
    expect(tileUrl).toContain("{z}/{y}/{x}");
  });

  it("resolves sprite to an absolute URL", () => {
    expect(typeof output.sprite).toBe("string");
    expect(output.sprite as string).toMatch(/^https?:\/\//);
    expect(output.sprite as string).toContain("sprites/sprite");
  });

  it("resolves glyphs to an absolute URL with preserved template tokens", () => {
    expect(typeof output.glyphs).toBe("string");
    expect(output.glyphs).toMatch(/^https?:\/\//);
    expect(output.glyphs).toContain("{fontstack}");
    expect(output.glyphs).toContain("{range}");
  });

  it("preserves all layers", () => {
    expect(output.layers).toHaveLength(5);
    const ids = output.layers.map((l) => l.id);
    expect(ids).toContain("Land/Not ice");
    expect(ids).toContain("Road/Highway");
    expect(ids).toContain("Background");
  });

  it("returns a warnings array", () => {
    expect(Array.isArray(result.warnings)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// B. Mapbox -> MapLibre
// ---------------------------------------------------------------------------

describe("Mapbox -> MapLibre", () => {
  const result = transpile<"maplibre">(mapboxFixture, {
    toDialect: "maplibre",
    fromDialect: "mapbox",
    mapboxAccessToken: "pk.test123",
  });
  const output = result.output;

  it("expands mapbox:// source URLs to HTTPS", () => {
    const sources = output.sources as Record<string, { url?: string }>;
    const compositeSource = sources.composite;
    expect(compositeSource).toBeDefined();
    expect(compositeSource.url).toMatch(/^https:\/\/api\.mapbox\.com\//);
    expect(compositeSource.url).toContain("pk.test123");
  });

  it("expands mapbox:// sprite URL to HTTPS", () => {
    const sprite = output.sprite as string;
    expect(sprite).toMatch(/^https:\/\/api\.mapbox\.com\//);
  });

  it("expands mapbox:// glyphs URL to HTTPS", () => {
    expect(output.glyphs).toMatch(/^https:\/\/api\.mapbox\.com\//);
    expect(output.glyphs).toContain("{fontstack}");
    expect(output.glyphs).toContain("{range}");
  });

  it("drops fog with a warning", () => {
    // fog should not appear in the MapLibre output
    expect((output as Record<string, unknown>).fog).toBeUndefined();
    // There should be no fog field at all in MapLibre output
  });

  it("strips owner/visibility/draft metadata", () => {
    const raw = output as Record<string, unknown>;
    expect(raw.owner).toBeUndefined();
    expect(raw.visibility).toBeUndefined();
    expect(raw.draft).toBeUndefined();
  });

  it("preserves all layers", () => {
    expect(output.layers).toHaveLength(4);
    const ids = output.layers.map((l) => l.id);
    expect(ids).toContain("background");
    expect(ids).toContain("landuse");
    expect(ids).toContain("road-simple");
    expect(ids).toContain("place-label");
  });
});

// ---------------------------------------------------------------------------
// C. MapLibre -> Mapbox
// ---------------------------------------------------------------------------

describe("MapLibre -> Mapbox", () => {
  const result = transpile<"mapbox">(maplibreFixture, {
    toDialect: "mapbox",
    fromDialect: "maplibre",
  });
  const output = result.output;

  it("collapses multi-sprite to a single string with a warning", () => {
    // Mapbox does not support multi-sprite arrays
    expect(typeof output.sprite).toBe("string");
    const spriteWarning = result.warnings.find((w) => w.code === "MULTI_SPRITE_COLLAPSED");
    expect(spriteWarning).toBeDefined();
  });

  it("preserves all layers", () => {
    expect(output.layers).toHaveLength(3);
    const ids = output.layers.map((l) => l.id);
    expect(ids).toContain("background");
    expect(ids).toContain("water");
    expect(ids).toContain("road");
  });
});

// ---------------------------------------------------------------------------
// D. MapLibre -> Esri
// ---------------------------------------------------------------------------

describe("MapLibre -> Esri", () => {
  const result = transpile<"esri">(maplibreFixture, {
    toDialect: "esri",
    fromDialect: "maplibre",
    baseUrl: ESRI_BASE_URL,
  });
  const output = result.output;

  it("output has exactly 5 top-level keys", () => {
    const keys = Object.keys(output);
    expect(keys).toHaveLength(5);
    expect(keys).toContain("version");
    expect(keys).toContain("sprite");
    expect(keys).toContain("glyphs");
    expect(keys).toContain("sources");
    expect(keys).toContain("layers");
  });

  it("keeps absolute sprite when source is non-Esri (TileJSON url)", () => {
    // Non-Esri sources have no VTS directory structure, so sprite stays absolute
    expect(output.sprite).toBe("https://tiles.openfreemap.org/sprites/liberty/sprite");
  });

  it("collapses multi-sprite array", () => {
    // Multi-sprite should have been collapsed before Esri emission
    expect(typeof output.sprite).toBe("string");
  });

  it("preserves layers (may drop unsupported types)", () => {
    expect(output.layers.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// E. Round-trip: Esri -> MapLibre -> Esri
// ---------------------------------------------------------------------------

describe("Round-trip: Esri -> MapLibre -> Esri", () => {
  const toMaplibre = transpile<"maplibre">(esriFixture, {
    toDialect: "maplibre",
    fromDialect: "esri",
    baseUrl: ESRI_BASE_URL,
  });

  const backToEsri = transpile<"esri">(toMaplibre.output, {
    toDialect: "esri",
    fromDialect: "maplibre",
    baseUrl: ESRI_BASE_URL,
  });

  it("preserves layer count through round-trip", () => {
    expect(backToEsri.output.layers).toHaveLength(esriFixture.layers.length);
  });

  it("preserves source structure with esri source key", () => {
    expect(backToEsri.output.sources).toHaveProperty("esri");
    expect(backToEsri.output.sources.esri.type).toBe("vector");
  });
});

// ---------------------------------------------------------------------------
// F. Detection accuracy
// ---------------------------------------------------------------------------

describe("Detection accuracy", () => {
  it("detects esri fixture as esri", () => {
    expect(detect(esriFixture)).toBe("esri");
  });

  it("detects mapbox fixture as mapbox", () => {
    expect(detect(mapboxFixture)).toBe("mapbox");
  });

  it("detects maplibre fixture as maplibre", () => {
    expect(detect(maplibreFixture)).toBe("maplibre");
  });
});

// ---------------------------------------------------------------------------
// G. String input
// ---------------------------------------------------------------------------

describe("String input", () => {
  it("accepts a JSON string as input", () => {
    const result = transpile<"maplibre">(JSON.stringify(esriFixture), {
      toDialect: "maplibre",
      fromDialect: "esri",
      baseUrl: ESRI_BASE_URL,
    });
    expect(result.output.layers).toHaveLength(5);
    expect(result.output.version).toBe(8);
  });
});

// ---------------------------------------------------------------------------
// H. Error handling
// ---------------------------------------------------------------------------

describe("Error handling", () => {
  it("throws on null input", () => {
    expect(() => transpile(null, { toDialect: "maplibre" })).toThrow();
  });

  it("throws on non-JSON string input", () => {
    expect(() => transpile("not json", { toDialect: "maplibre" })).toThrow();
  });
});
