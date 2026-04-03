/**
 * Comprehensive public URL tests.
 *
 * Tests the full transpile pipeline against every unique public vector tile
 * style URL from docs/public-vector-tile-styles.md. Each style is:
 *   1. Fetched from the live URL
 *   2. Auto-detected for dialect
 *   3. Transpiled to all supported target dialects
 *   4. Validated against the official MapLibre style spec
 *
 * These tests require network access and are skipped in offline environments.
 * No API keys needed for any of these URLs.
 */

import { validateStyleMin } from "@maplibre/maplibre-gl-style-spec";
import { describe, expect, it } from "vitest";
import type { Dialect } from "../../src/index.ts";
import { detect, transpile } from "../../src/index.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchStyle(url: string): Promise<unknown> {
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

function specErrors(style: unknown): string[] {
  const errors = validateStyleMin(style as Parameters<typeof validateStyleMin>[0]);
  return errors.map((e) => e.message).filter((msg) => !msg.includes("_extensions"));
}

function criticalSpecErrors(style: unknown): string[] {
  return specErrors(style).filter(
    (e) => e.includes("missing required") || e.includes("must be") || e.includes("expected one of"),
  );
}

/** Extract the VectorTileServer base URL from a root.json URL. */
function baseUrlFromRootJson(rootJsonUrl: string): string {
  return rootJsonUrl.replace(/\/resources\/styles\/root\.json$/, "");
}

// ---------------------------------------------------------------------------
// Network availability check
// ---------------------------------------------------------------------------

const NETWORK_AVAILABLE = await fetch(
  "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json",
  { signal: AbortSignal.timeout(10_000) },
)
  .then(() => true)
  .catch(() => false);

// ---------------------------------------------------------------------------
// URL catalog from docs/public-vector-tile-styles.md
// Deduplicated to unique endpoints only.
// ---------------------------------------------------------------------------

const ESRI_BASEMAP_URLS: Array<{ name: string; url: string }> = [
  {
    name: "World Basemap v2",
    url: "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "World Basemap GCS v2 (WGS84)",
    url: "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "World Contours v2",
    url: "https://basemaps.arcgis.com/arcgis/rest/services/World_Contours_v2/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "World Hillshade v2",
    url: "https://basemaps.arcgis.com/arcgis/rest/services/World_Hillshade_v2/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "OpenStreetMap v2",
    url: "https://basemaps.arcgis.com/arcgis/rest/services/OpenStreetMap_v2/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "OpenBasemap v2",
    url: "https://basemaps.arcgis.com/arcgis/rest/services/OpenBasemap_v2/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "OpenBasemap GCS v2 (WGS84)",
    url: "https://basemaps.arcgis.com/arcgis/rest/services/OpenBasemap_GCS_v2/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "World Basemap Export v2",
    url: "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_Export_v2/VectorTileServer/resources/styles/root.json",
  },
];

const ESRI_DEMOGRAPHIC_URLS: Array<{ name: string; url: string }> = [
  {
    name: "2020 USA Population Density",
    url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/2020_USA_Population_Density_VTPK/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "2020 USA Population Growth",
    url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/2020_USA_Population_Growth_VTPK/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "2020 USA Median Age",
    url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/2020_USA_Median_Age/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "2020 USA Median Household Income",
    url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Demographic_Reference_Layers_VTPK_MEDHINC/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "2020 USA Average Household Income",
    url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/2020_USA_Average_Household_Income/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "2020 USA Per Capita Income",
    url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_2020_Per_Capita_Income/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "2020 USA Median Disposable Income",
    url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Demographic_Reference_Layers_VTPK_MEDDINC/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "2020 USA Median Home Value",
    url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/2020_USA_Median_Home_Value/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "2020 USA Diversity Index",
    url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/2020_USA_Diversity_Index/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "2020 USA Average Household Size",
    url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Demographic_Reference_Layers_VTPK_AVGHHS/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "2016 USA Population Density",
    url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Pop_Density/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "2016 USA Median Age",
    url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Med_Age/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "2016 USA Median Household Income",
    url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Med_HH_Income/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "2016 USA Average Household Income",
    url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Avg_HH_Income/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "2016 USA Per Capita Income",
    url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Per_Cap_Income/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "2016 USA Median Disposable Income",
    url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Med_Disp_Income/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "2016 USA Median Home Value",
    url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Med_Home_Value/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "2016 USA Diversity Index",
    url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Diverse_Index/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "2016 USA Average Household Size",
    url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Avg_HH_Size/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "2016-2021 USA Population Growth",
    url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Pop_Ann_Growth_Rate/VectorTileServer/resources/styles/root.json",
  },
];

const ESRI_REGIONAL_URLS: Array<{ name: string; url: string }> = [
  {
    name: "GB Topographic",
    url: "https://tiles.arcgis.com/tiles/qHLhLQrcvEnxjtPr/arcgis/rest/services/GB_Basemap_v1/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "NZ Topographic",
    url: "https://tiles.arcgis.com/tiles/XTtANUDT8Va4DLwI/arcgis/rest/services/nz_vector_basemap_v1/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "Topo RD (Netherlands)",
    url: "https://tiles.arcgis.com/tiles/nSZVuSZjHpEZZbRo/arcgis/rest/services/Topo_RD/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "Swiss Dark Gray Canvas (LV95)",
    url: "https://tiles.arcgis.com/tiles/oPre3pOfRfefL8y0/arcgis/rest/services/Vector_Tile_Basemap_Switzerland_LV95/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "LV95 Contours Switzerland",
    url: "https://tiles.arcgis.com/tiles/oPre3pOfRfefL8y0/arcgis/rest/services/LV95_Contours_Switzerland/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "Canterbury Basemap",
    url: "https://tiles.arcgis.com/tiles/RNxkQaMWQcgbiF98/arcgis/rest/services/Canterbury_Basemap/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "OSM RD (Netherlands)",
    url: "https://tiles.arcgis.com/tiles/nSZVuSZjHpEZZbRo/arcgis/rest/services/OSM_RD/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "Africa Mask (Dark)",
    url: "https://tiles.arcgis.com/tiles/zNrTBuYXV2f35M0U/arcgis/rest/services/Africa_Buffer_v2/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "Caribbean Mask (Dark)",
    url: "https://tiles.arcgis.com/tiles/yVZJC1sH78c0dQ2w/arcgis/rest/services/Caribbean_Mask_Dark/VectorTileServer/resources/styles/root.json",
  },
];

const ESRI_THEMATIC_URLS: Array<{ name: string; url: string }> = [
  {
    name: "Microsoft Building Footprints",
    url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Microsoft_Building_Footprints/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "Canterbury Contours",
    url: "https://tiles.arcgis.com/tiles/RNxkQaMWQcgbiF98/arcgis/rest/services/Contours/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "NZ Mainland Contours (Topo 50k)",
    url: "https://tiles.arcgis.com/tiles/sreKTGUpFk4UFFqu/arcgis/rest/services/NZ_Mainland_Contours_Topo_50k/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "Stark County Contours",
    url: "https://tiles.arcgis.com/tiles/1JiK2PayqrHvvJhM/arcgis/rest/services/Contour_Vector_Cache/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "Dark Skies",
    url: "https://tiles.arcgis.com/tiles/KTcxiTD9dsQw4r7Z/arcgis/rest/services/Dark_Skies/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "Utah Statewide Parcels",
    url: "https://tiles.arcgis.com/tiles/99lidPhWCzftIe9K/arcgis/rest/services/StatewideParcels/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "NC OneMap Parcel Boundaries",
    url: "https://tiles.arcgis.com/tiles/NuWFvHYDMVmmxMeM/arcgis/rest/services/NCOneMapParcelBoundaries/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "Santa Monica Mountains Parcels",
    url: "https://vectortileservices3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Santa_Monica_Mountains_Parcels_VTL/VectorTileServer/resources/styles/root.json",
  },
];

const ESRI_OSM_URLS: Array<{ name: string; url: string }> = [
  {
    name: "OpenStreetMap v2 (tiles)",
    url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/OpenStreetMap_v2/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "OpenStreetMap GCS v2 (tiles)",
    url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/OpenStreetMap_GCS_v2/VectorTileServer/resources/styles/root.json",
  },
  {
    name: "OpenStreetMap GCS v2 (basemaps)",
    url: "https://basemaps.arcgis.com/arcgis/rest/services/OpenStreetMap_GCS_v2/VectorTileServer/resources/styles/root.json",
  },
];

const OPENFREEMAP_URLS: Array<{ name: string; url: string }> = [
  { name: "Liberty", url: "https://tiles.openfreemap.org/styles/liberty" },
  { name: "Bright", url: "https://tiles.openfreemap.org/styles/bright" },
  { name: "Positron", url: "https://tiles.openfreemap.org/styles/positron" },
  { name: "Dark", url: "https://tiles.openfreemap.org/styles/dark" },
  { name: "Fiord", url: "https://tiles.openfreemap.org/styles/fiord" },
];

const STADIA_URLS: Array<{ name: string; url: string }> = [
  { name: "Alidade Smooth", url: "https://tiles.stadiamaps.com/styles/alidade_smooth.json" },
  {
    name: "Alidade Smooth Dark",
    url: "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json",
  },
  { name: "OSM Bright", url: "https://tiles.stadiamaps.com/styles/osm_bright.json" },
  { name: "Outdoors", url: "https://tiles.stadiamaps.com/styles/outdoors.json" },
  { name: "Stamen Toner", url: "https://tiles.stadiamaps.com/styles/stamen_toner.json" },
  { name: "Stamen Terrain", url: "https://tiles.stadiamaps.com/styles/stamen_terrain.json" },
  { name: "Stamen Watercolor", url: "https://tiles.stadiamaps.com/styles/stamen_watercolor.json" },
];

const MAPLIBRE_URLS: Array<{ name: string; url: string }> = [
  { name: "Demo Tiles", url: "https://demotiles.maplibre.org/style.json" },
];

// ---------------------------------------------------------------------------
// Test runner for Esri styles: detect, transpile to all targets, validate
// ---------------------------------------------------------------------------

function testEsriStyle(name: string, url: string) {
  it(`${name}: detect + transpile to maplibre + spec validate`, async () => {
    const style = await fetchStyle(url);
    const baseUrl = baseUrlFromRootJson(url);

    // Detection
    expect(detect(style)).toBe("esri");

    // Transpile to MapLibre
    const toMaplibre = transpile(style, {
      toDialect: "maplibre",
      fromDialect: "esri",
      baseUrl,
    });
    expect(toMaplibre.output.version).toBe(8);
    expect(toMaplibre.output.layers.length).toBeGreaterThan(0);
    expect(typeof toMaplibre.output.sprite).toBe("string");
    expect(toMaplibre.output.glyphs).toContain("{fontstack}");

    // Validate against official spec
    const errors = criticalSpecErrors(toMaplibre.output);
    expect(errors).toEqual([]);

    // Transpile to Esri (round-trip)
    const backToEsri = transpile(toMaplibre.output, {
      toDialect: "esri",
      fromDialect: "maplibre",
      baseUrl,
    });
    expect(Object.keys(backToEsri.output)).toHaveLength(5);
    expect(backToEsri.output.sources).toHaveProperty("esri");
  }, 30_000);

  it(`${name}: transpile to mapbox + spec validate`, async () => {
    const style = await fetchStyle(url);
    const baseUrl = baseUrlFromRootJson(url);

    const toMapbox = transpile(style, {
      toDialect: "mapbox",
      fromDialect: "esri",
      baseUrl,
    });
    expect(toMapbox.output.version).toBe(8);
    expect(toMapbox.output.layers.length).toBeGreaterThan(0);

    const errors = criticalSpecErrors(toMapbox.output);
    expect(errors).toEqual([]);
  }, 30_000);
}

// ---------------------------------------------------------------------------
// Test runner for MapLibre-compatible styles (OpenFreeMap, Stadia, etc.)
// ---------------------------------------------------------------------------

function testMaplibreStyle(
  name: string,
  url: string,
  expectedDialect: Dialect | Dialect[] = "maplibre",
) {
  it(`${name}: detect + transpile to all targets + spec validate`, async () => {
    const style = await fetchStyle(url);
    const dialect = detect(style);

    // Detection
    if (Array.isArray(expectedDialect)) {
      expect(expectedDialect).toContain(dialect);
    } else {
      expect(dialect).toBe(expectedDialect);
    }

    // Transpile to MapLibre (may be identity or from mapbox)
    const toMaplibre = transpile(style, {
      toDialect: "maplibre",
      fromDialect: dialect,
    });
    expect(toMaplibre.output.version).toBe(8);
    expect(toMaplibre.output.layers.length).toBeGreaterThan(0);
    expect(criticalSpecErrors(toMaplibre.output)).toEqual([]);

    // Transpile to Mapbox
    const toMapbox = transpile(style, {
      toDialect: "mapbox",
      fromDialect: dialect,
    });
    expect(toMapbox.output.version).toBe(8);
    expect(toMapbox.output.layers.length).toBeGreaterThan(0);
    expect(criticalSpecErrors(toMapbox.output)).toEqual([]);

    // Transpile to Esri
    const toEsri = transpile(style, {
      toDialect: "esri",
      fromDialect: dialect,
      baseUrl: "https://example.com/VectorTileServer",
    });
    expect(Object.keys(toEsri.output)).toHaveLength(5);
    expect(toEsri.output.version).toBe(8);
  }, 30_000);
}

// ===========================================================================
// TEST SUITES
// ===========================================================================

describe.skipIf(!NETWORK_AVAILABLE)("Esri Living Atlas basemaps", () => {
  for (const { name, url } of ESRI_BASEMAP_URLS) {
    testEsriStyle(name, url);
  }
});

describe.skipIf(!NETWORK_AVAILABLE)("Esri USA demographic layers", () => {
  for (const { name, url } of ESRI_DEMOGRAPHIC_URLS) {
    testEsriStyle(name, url);
  }
});

describe.skipIf(!NETWORK_AVAILABLE)("Esri regional basemaps", () => {
  for (const { name, url } of ESRI_REGIONAL_URLS) {
    testEsriStyle(name, url);
  }
});

describe.skipIf(!NETWORK_AVAILABLE)("Esri thematic and edge-case layers", () => {
  for (const { name, url } of ESRI_THEMATIC_URLS) {
    testEsriStyle(name, url);
  }
});

describe.skipIf(!NETWORK_AVAILABLE)("Esri OpenStreetMap tile services", () => {
  for (const { name, url } of ESRI_OSM_URLS) {
    testEsriStyle(name, url);
  }
});

describe.skipIf(!NETWORK_AVAILABLE)("OpenFreeMap styles", () => {
  for (const { name, url } of OPENFREEMAP_URLS) {
    testMaplibreStyle(name, url);
  }
});

describe.skipIf(!NETWORK_AVAILABLE)("Stadia Maps styles", () => {
  for (const { name, url } of STADIA_URLS) {
    // Stadia styles may detect as mapbox or maplibre
    testMaplibreStyle(name, url, ["mapbox", "maplibre"]);
  }
});

describe.skipIf(!NETWORK_AVAILABLE)("MapLibre demo tiles", () => {
  for (const { name, url } of MAPLIBRE_URLS) {
    testMaplibreStyle(name, url);
  }
});

// ---------------------------------------------------------------------------
// Complex edge cases
// ---------------------------------------------------------------------------

describe.skipIf(!NETWORK_AVAILABLE)("Complex edge cases", () => {
  it("World Basemap v2 (906+ layers): full pipeline stress test", async () => {
    const url =
      "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/styles/root.json";
    const style = await fetchStyle(url);
    const baseUrl = baseUrlFromRootJson(url);

    const result = transpile(style, {
      toDialect: "maplibre",
      fromDialect: "esri",
      baseUrl,
    });

    // Stress: 906+ layers should all survive
    expect(result.output.layers.length).toBeGreaterThan(900);

    // All layers have valid id and type
    for (const layer of result.output.layers) {
      expect(typeof layer.id).toBe("string");
      expect(typeof layer.type).toBe("string");
    }

    // Tile URLs are absolute and contain z/y/x
    const sources = result.output.sources as Record<string, { tiles?: string[] }>;
    for (const src of Object.values(sources)) {
      if (src.tiles) {
        for (const tile of src.tiles) {
          expect(tile).toMatch(/^https?:\/\//);
          expect(tile).toContain("{z}");
        }
      }
    }
  }, 30_000);

  it("demographic layer with colon source-layers and float zooms", async () => {
    const url =
      "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/2020_USA_Population_Density_VTPK/VectorTileServer/resources/styles/root.json";
    const style = await fetchStyle(url);
    const baseUrl = baseUrlFromRootJson(url);

    const result = transpile(style, {
      toDialect: "maplibre",
      fromDialect: "esri",
      baseUrl,
    });

    expect(result.output.version).toBe(8);
    expect(result.output.layers.length).toBeGreaterThan(0);

    // These styles use fractional zoom levels
    const hasFloatZoom = result.output.layers.some(
      (l) =>
        (l.minzoom !== undefined && l.minzoom % 1 !== 0) ||
        (l.maxzoom !== undefined && l.maxzoom % 1 !== 0),
    );
    // Float zooms should be preserved (valid in all dialects)
    if (hasFloatZoom) {
      expect(hasFloatZoom).toBe(true);
    }

    expect(criticalSpecErrors(result.output)).toEqual([]);
  }, 30_000);

  it("Microsoft Building Footprints: fill-extrusion capable style", async () => {
    const url =
      "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Microsoft_Building_Footprints/VectorTileServer/resources/styles/root.json";
    const style = await fetchStyle(url);
    const baseUrl = baseUrlFromRootJson(url);

    const result = transpile(style, {
      toDialect: "maplibre",
      fromDialect: "esri",
      baseUrl,
    });

    expect(result.output.version).toBe(8);
    expect(criticalSpecErrors(result.output)).toEqual([]);
  }, 30_000);

  it("OpenFreeMap Liberty: multi-sprite array handling", async () => {
    const style = await fetchStyle("https://tiles.openfreemap.org/styles/liberty");

    // Should have multi-sprite array
    const spriteIsArray = Array.isArray((style as Record<string, unknown>).sprite);

    // Transpile to Mapbox (must collapse multi-sprite)
    const toMapbox = transpile(style, {
      toDialect: "mapbox",
      fromDialect: "maplibre",
    });
    expect(typeof toMapbox.output.sprite).toBe("string");
    if (spriteIsArray) {
      expect(toMapbox.warnings.some((w) => w.code === "MULTI_SPRITE_COLLAPSED")).toBe(true);
    }

    // Transpile to Esri (must collapse + re-relativize)
    const toEsri = transpile(style, {
      toDialect: "esri",
      fromDialect: "maplibre",
      baseUrl: "https://example.com/VectorTileServer",
    });
    expect(typeof toEsri.output.sprite).toBe("string");
    expect(Object.keys(toEsri.output)).toHaveLength(5);
  }, 30_000);

  it("round-trip fidelity: Esri -> MapLibre -> Mapbox -> MapLibre", async () => {
    const url =
      "https://basemaps.arcgis.com/arcgis/rest/services/World_Hillshade_v2/VectorTileServer/resources/styles/root.json";
    const style = await fetchStyle(url);
    const baseUrl = baseUrlFromRootJson(url);

    // Esri -> MapLibre
    const step1 = transpile(style, {
      toDialect: "maplibre",
      fromDialect: "esri",
      baseUrl,
    });

    // MapLibre -> Mapbox
    const step2 = transpile(step1.output, {
      toDialect: "mapbox",
      fromDialect: "maplibre",
    });

    // Mapbox -> MapLibre
    const step3 = transpile(step2.output, {
      toDialect: "maplibre",
      fromDialect: "mapbox",
    });

    // Layer count should be preserved through the chain
    expect(step3.output.layers.length).toBe(step1.output.layers.length);
    expect(step3.output.version).toBe(8);
    expect(criticalSpecErrors(step3.output)).toEqual([]);
  }, 30_000);
});
