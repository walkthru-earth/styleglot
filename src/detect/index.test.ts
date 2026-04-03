import { describe, expect, it } from "vitest";
import { detect } from "./index.ts";

describe("detect", () => {
  it("detects Esri dialect from source URL and relative sprite", () => {
    const style = {
      version: 8,
      sources: {
        esri: {
          type: "vector",
          url: "../../",
        },
      },
      sprite: "../sprites/sprite",
      glyphs: "../fonts/{fontstack}/{range}.pbf",
      layers: [],
    };
    expect(detect(style)).toBe("esri");
  });

  it("detects Esri dialect from VectorTileServer URL", () => {
    const style = {
      version: 8,
      sources: {
        esri: {
          type: "vector",
          url: "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer",
        },
      },
      layers: [],
    };
    expect(detect(style)).toBe("esri");
  });

  it("detects Mapbox dialect from mapbox:// source URLs", () => {
    const style = {
      version: 8,
      sources: {
        composite: {
          type: "vector",
          url: "mapbox://mapbox.mapbox-streets-v8",
        },
      },
      sprite: "mapbox://sprites/mapbox/streets-v12",
      glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
      layers: [],
    };
    expect(detect(style)).toBe("mapbox");
  });

  it("detects Mapbox dialect from fog and mapbox: metadata", () => {
    const style = {
      version: 8,
      sources: {},
      layers: [],
      fog: { range: [1, 10] },
      metadata: { "mapbox:autocomposite": true },
    };
    expect(detect(style)).toBe("mapbox");
  });

  it("detects MapLibre dialect from multi-sprite array", () => {
    const style = {
      version: 8,
      sources: {},
      layers: [],
      sprite: [{ id: "default", url: "https://example.com/sprite" }],
    };
    expect(detect(style)).toBe("maplibre");
  });

  it("detects MapLibre dialect from state property", () => {
    const style = {
      version: 8,
      sources: {},
      layers: [],
      state: { someKey: "value" },
    };
    expect(detect(style)).toBe("maplibre");
  });

  it("returns maplibre as the default fallback for an empty style", () => {
    const style = {
      version: 8,
      sources: {},
      layers: [],
    };
    expect(detect(style)).toBe("maplibre");
  });

  it("throws for non-object input", () => {
    expect(() => detect(null)).toThrow();
    expect(() => detect("string")).toThrow();
  });

  it("handles mixed signals by choosing the highest scorer", () => {
    // Esri signals (source named "esri" + relative sprite) vs a single mapbox: metadata key
    const style = {
      version: 8,
      sources: {
        esri: {
          type: "vector",
          url: "../../",
        },
      },
      sprite: "../sprites/sprite",
      glyphs: "../fonts/{fontstack}/{range}.pbf",
      layers: [],
      metadata: { "mapbox:autocomposite": true },
    };
    // Esri score: 10 (url ../../) + 3 (name esri) + 5 (sprite ../) + 5 (glyphs ../) = 23
    // Mapbox score: 3 (metadata)
    expect(detect(style)).toBe("esri");
  });

  it("prefers mapbox on esri/mapbox tie", () => {
    // Craft a style where esri and mapbox scores are equal and > maplibre
    const style = {
      version: 8,
      sources: {},
      layers: [],
      // Esri: sprite ../ = 5, glyphs ../ = 5 => 10
      sprite: "../sprites/sprite",
      glyphs: "../fonts/{fontstack}/{range}.pbf",
      // Mapbox: fog = 5, imports = 5 => 10
      fog: {},
      imports: [],
    };
    expect(detect(style)).toBe("mapbox");
  });
});
