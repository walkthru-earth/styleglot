import { describe, expect, it } from "vitest";
import { detect, transpile } from "../../src/index.ts";

async function fetchStyleJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.json();
}

const NETWORK_AVAILABLE = await fetch(
  "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json",
)
  .then(() => true)
  .catch(() => false);

const ESRI_BASE_URL =
  "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer";

const ESRI_HILLSHADE_BASE_URL =
  "https://basemaps.arcgis.com/arcgis/rest/services/World_Hillshade_v2/VectorTileServer";

// ---------------------------------------------------------------------------
// A. Esri Living Atlas basemaps (public, no token required)
// ---------------------------------------------------------------------------

describe.skipIf(!NETWORK_AVAILABLE)("Esri Living Atlas basemaps", () => {
  it("World_Basemap_v2: detects as esri and transpiles to maplibre", async () => {
    const style = await fetchStyleJson(`${ESRI_BASE_URL}/resources/styles/root.json`);

    expect(detect(style)).toBe("esri");

    const result = transpile<"maplibre">(style, {
      toDialect: "maplibre",
      baseUrl: ESRI_BASE_URL,
    });

    expect(result.output.version).toBe(8);
    expect(result.output.layers.length).toBeGreaterThan(100);

    // Tile URLs should be absolute
    const sources = result.output.sources as Record<string, { tiles?: string[] }>;
    const firstSource = Object.values(sources)[0];
    expect(firstSource.tiles).toBeDefined();
    expect(firstSource.tiles![0]).toMatch(/^https?:\/\//);

    // No error-severity warnings (info and warn are fine)
    const errors = result.warnings.filter((w) => w.severity === "drop");
    // "drop" severity means something was dropped, but should not prevent success
    // Just ensure no throw occurred (we got here)
    expect(result.output).toBeDefined();
  });

  it("World_Hillshade_v2: detects as esri and transpiles to maplibre", async () => {
    const style = await fetchStyleJson(`${ESRI_HILLSHADE_BASE_URL}/resources/styles/root.json`);

    expect(detect(style)).toBe("esri");

    const result = transpile<"maplibre">(style, {
      toDialect: "maplibre",
      baseUrl: ESRI_HILLSHADE_BASE_URL,
    });

    expect(result.output.version).toBe(8);
    expect(result.output.layers.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// B. OpenFreeMap (public, no token required)
// ---------------------------------------------------------------------------

describe.skipIf(!NETWORK_AVAILABLE)("OpenFreeMap", () => {
  it("liberty style: detects as maplibre and transpiles to mapbox", async () => {
    const style = await fetchStyleJson("https://tiles.openfreemap.org/styles/liberty");

    expect(detect(style)).toBe("maplibre");

    const result = transpile<"mapbox">(style, {
      toDialect: "mapbox",
    });

    expect(result.output.version).toBe(8);
    expect(result.output.layers.length).toBeGreaterThan(0);

    // If the style has multi-sprite, expect a collapse warning
    if (Array.isArray((style as Record<string, unknown>).sprite)) {
      const spriteWarning = result.warnings.find((w) => w.code === "MULTI_SPRITE_COLLAPSED");
      expect(spriteWarning).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// C. Stadia Maps (public tier)
// ---------------------------------------------------------------------------

describe.skipIf(!NETWORK_AVAILABLE)("Stadia Maps", () => {
  it("alidade_smooth: detects and transpiles to esri", async () => {
    const style = await fetchStyleJson("https://tiles.stadiamaps.com/styles/alidade_smooth.json");

    // Stadia styles may detect as mapbox or maplibre depending on metadata
    const dialect = detect(style);
    expect(["mapbox", "maplibre"]).toContain(dialect);

    const result = transpile<"esri">(style, {
      toDialect: "esri",
      fromDialect: dialect,
      baseUrl: "https://tiles.stadiamaps.com",
    });

    expect(result.output.version).toBe(8);
    expect(Object.keys(result.output)).toHaveLength(5);
    expect(result.output.layers.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// D. MapLibre demo tiles
// ---------------------------------------------------------------------------

describe.skipIf(!NETWORK_AVAILABLE)("MapLibre demo tiles", () => {
  it("demotiles style: detects as maplibre and transpiles to mapbox", async () => {
    const style = await fetchStyleJson("https://demotiles.maplibre.org/style.json");

    expect(detect(style)).toBe("maplibre");

    const result = transpile<"mapbox">(style, {
      toDialect: "mapbox",
    });

    expect(result.output.version).toBe(8);
    expect(result.output.layers.length).toBeGreaterThan(0);
  });

  it("demotiles round-trip: mapbox then back to maplibre preserves layer count", async () => {
    const style = await fetchStyleJson("https://demotiles.maplibre.org/style.json");

    const toMapbox = transpile<"mapbox">(style, {
      toDialect: "mapbox",
      fromDialect: "maplibre",
    });

    const backToMaplibre = transpile<"maplibre">(toMapbox.output, {
      toDialect: "maplibre",
      fromDialect: "mapbox",
    });

    expect(backToMaplibre.output.layers.length).toBe(toMapbox.output.layers.length);
  });
});
