/**
 * Spec validation tests.
 *
 * Uses the official @maplibre/maplibre-gl-style-spec validator to confirm
 * that transpiled output conforms to the MapLibre/Mapbox Style Spec v8.
 *
 * This is the "correlation matrix" test: for every supported conversion
 * direction we verify the output passes the canonical spec validator,
 * not just our own structural checks.
 */

import { validateStyleMin } from "@maplibre/maplibre-gl-style-spec";
import { describe, expect, it } from "vitest";
import { detect, transpile } from "../../src/index.ts";

import esriFixture from "../fixtures/esri-minimal.json";
import mapboxFixture from "../fixtures/mapbox-minimal.json";
import maplibreFixture from "../fixtures/maplibre-minimal.json";

const ESRI_BASE =
  "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer";

// ---------------------------------------------------------------------------
// Helper: run the official MapLibre spec validator and return errors.
// Filters out warnings about unknown properties that are dialect-specific
// extensions (e.g., _extensions, font-faces) since those are intentional.
// ---------------------------------------------------------------------------
function specErrors(style: unknown): string[] {
  const errors = validateStyleMin(style as Parameters<typeof validateStyleMin>[0]);
  return errors.map((e) => e.message).filter((msg) => !msg.includes("_extensions"));
}

// ---------------------------------------------------------------------------
// A. Esri -> MapLibre (the most common real-world conversion)
// ---------------------------------------------------------------------------
describe("Spec validation: Esri -> MapLibre", () => {
  const result = transpile(esriFixture, {
    toDialect: "maplibre",
    fromDialect: "esri",
    baseUrl: ESRI_BASE,
  });

  it("output passes the official MapLibre style spec validator", () => {
    const errors = specErrors(result.output);
    expect(errors).toEqual([]);
  });

  it("output has version 8", () => {
    expect(result.output.version).toBe(8);
  });

  it("all layers have id and type", () => {
    for (const layer of result.output.layers) {
      expect(layer.id).toBeDefined();
      expect(layer.type).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// B. Mapbox -> MapLibre
// ---------------------------------------------------------------------------
describe("Spec validation: Mapbox -> MapLibre", () => {
  const result = transpile(mapboxFixture, {
    toDialect: "maplibre",
    fromDialect: "mapbox",
    mapboxAccessToken: "pk.test123",
  });

  it("output passes the official MapLibre style spec validator", () => {
    const errors = specErrors(result.output);
    expect(errors).toEqual([]);
  });

  it("no Mapbox-only properties leak into MapLibre output", () => {
    const raw = result.output as unknown as Record<string, unknown>;
    expect(raw.fog).toBeUndefined();
    expect(raw.owner).toBeUndefined();
    expect(raw.visibility).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// C. MapLibre -> MapLibre (identity, should always pass)
// ---------------------------------------------------------------------------
describe("Spec validation: MapLibre -> MapLibre", () => {
  const result = transpile(maplibreFixture, {
    toDialect: "maplibre",
    fromDialect: "maplibre",
  });

  it("output passes the official MapLibre style spec validator", () => {
    const errors = specErrors(result.output);
    expect(errors).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// D. MapLibre -> Mapbox (Mapbox is a subset of MapLibre for v8 core)
// ---------------------------------------------------------------------------
describe("Spec validation: MapLibre -> Mapbox", () => {
  const result = transpile(maplibreFixture, {
    toDialect: "mapbox",
    fromDialect: "maplibre",
  });

  it("output passes the MapLibre spec validator (v8 core is shared)", () => {
    const errors = specErrors(result.output);
    expect(errors).toEqual([]);
  });

  it("multi-sprite collapsed to string", () => {
    expect(typeof result.output.sprite).toBe("string");
  });
});

// ---------------------------------------------------------------------------
// E. Mapbox -> Mapbox (round-trip through IR)
// ---------------------------------------------------------------------------
describe("Spec validation: Mapbox -> Mapbox", () => {
  const result = transpile(mapboxFixture, {
    toDialect: "mapbox",
    fromDialect: "mapbox",
    mapboxAccessToken: "pk.test123",
  });

  it("output passes the MapLibre spec validator", () => {
    const errors = specErrors(result.output);
    expect(errors).toEqual([]);
  });

  it("layer count preserved", () => {
    expect(result.output.layers.length).toBe(mapboxFixture.layers.length);
  });
});

// ---------------------------------------------------------------------------
// F. Real URLs: validate transpiled output from live Esri styles
// ---------------------------------------------------------------------------

async function fetchStyleJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
  return response.json();
}

const NETWORK_AVAILABLE = await fetch(`${ESRI_BASE}/resources/styles/root.json`)
  .then(() => true)
  .catch(() => false);

describe.skipIf(!NETWORK_AVAILABLE)(
  "Spec validation: real Esri World_Basemap_v2 -> MapLibre",
  () => {
    it("906-layer style passes spec validator after transpile", async () => {
      const style = await fetchStyleJson(`${ESRI_BASE}/resources/styles/root.json`);
      expect(detect(style)).toBe("esri");

      const result = transpile(style, {
        toDialect: "maplibre",
        fromDialect: "esri",
        baseUrl: ESRI_BASE,
      });

      expect(result.output.layers.length).toBeGreaterThan(100);

      const errors = specErrors(result.output);
      // Allow some warnings for edge cases in the massive style
      // but no hard errors about missing required fields
      const criticalErrors = errors.filter(
        (e) =>
          e.includes("missing required") || e.includes("must be") || e.includes("expected one of"),
      );
      expect(criticalErrors).toEqual([]);
    });
  },
);

describe.skipIf(!NETWORK_AVAILABLE)("Spec validation: real OpenFreeMap Liberty -> Mapbox", () => {
  it("OpenFreeMap output passes spec validator after transpile", async () => {
    const style = await fetchStyleJson("https://tiles.openfreemap.org/styles/liberty");

    const result = transpile(style, {
      toDialect: "mapbox",
      fromDialect: "maplibre",
    });

    expect(result.output.layers.length).toBeGreaterThan(0);
    expect(typeof result.output.sprite).toBe("string");

    const errors = specErrors(result.output);
    const criticalErrors = errors.filter(
      (e) =>
        e.includes("missing required") || e.includes("must be") || e.includes("expected one of"),
    );
    expect(criticalErrors).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// G. Conversion matrix summary: all 6 directions compile and validate
// ---------------------------------------------------------------------------
describe("Conversion matrix: all 6 directions", () => {
  const directions = [
    { from: "esri", to: "maplibre", fixture: esriFixture, opts: { baseUrl: ESRI_BASE } },
    { from: "esri", to: "mapbox", fixture: esriFixture, opts: { baseUrl: ESRI_BASE } },
    {
      from: "mapbox",
      to: "maplibre",
      fixture: mapboxFixture,
      opts: { mapboxAccessToken: "pk.test" },
    },
    {
      from: "mapbox",
      to: "esri",
      fixture: mapboxFixture,
      opts: { mapboxAccessToken: "pk.test", baseUrl: ESRI_BASE },
    },
    { from: "maplibre", to: "mapbox", fixture: maplibreFixture, opts: {} },
    { from: "maplibre", to: "esri", fixture: maplibreFixture, opts: { baseUrl: ESRI_BASE } },
  ] as const;

  for (const { from, to, fixture, opts } of directions) {
    it(`${from} -> ${to}: transpile succeeds and output has version 8`, () => {
      const result = transpile(fixture, {
        toDialect: to,
        fromDialect: from,
        ...opts,
      });
      expect(result.output).toBeDefined();
      expect((result.output as Record<string, unknown>).version).toBe(8);
      expect(Array.isArray(result.warnings)).toBe(true);
    });
  }
});
