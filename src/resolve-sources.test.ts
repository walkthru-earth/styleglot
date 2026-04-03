import { describe, expect, it, vi } from "vitest";
import { resolveTileJsonSources } from "./resolve-sources.ts";
import type { IRStyle, IRVectorSource } from "./types/style.ts";

function makeIR(overrides?: Partial<IRStyle>): IRStyle {
  return {
    version: 8,
    sources: {
      openmaptiles: {
        type: "vector",
        url: "https://tiles.example.com/v3/tiles.json",
      },
    },
    layers: [],
    ...overrides,
  };
}

function vectorSource(result: IRStyle, name: string): IRVectorSource {
  return result.sources[name] as IRVectorSource;
}

describe("resolveTileJsonSources", () => {
  it("resolves a TileJSON url to inline tiles", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      tiles: ["https://tiles.example.com/v3/{z}/{x}/{y}.pbf"],
      minzoom: 0,
      maxzoom: 14,
    });

    const result = await resolveTileJsonSources(makeIR(), fetchFn);

    expect(fetchFn).toHaveBeenCalledWith("https://tiles.example.com/v3/tiles.json");
    const src = vectorSource(result, "openmaptiles");
    expect(src.tiles).toEqual(["https://tiles.example.com/v3/{z}/{x}/{y}.pbf"]);
    expect(src.minzoom).toBe(0);
    expect(src.maxzoom).toBe(14);
  });

  it("preserves existing minzoom/maxzoom on the source", async () => {
    const ir = makeIR({
      sources: {
        openmaptiles: {
          type: "vector",
          url: "https://tiles.example.com/v3/tiles.json",
          minzoom: 2,
          maxzoom: 10,
        },
      },
    });

    const fetchFn = vi.fn().mockResolvedValue({
      tiles: ["https://tiles.example.com/v3/{z}/{x}/{y}.pbf"],
      minzoom: 0,
      maxzoom: 14,
    });

    const result = await resolveTileJsonSources(ir, fetchFn);
    const src = vectorSource(result, "openmaptiles");
    expect(src.minzoom).toBe(2);
    expect(src.maxzoom).toBe(10);
  });

  it("inlines bounds and attribution from TileJSON", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      tiles: ["https://tiles.example.com/{z}/{x}/{y}.pbf"],
      bounds: [-180, -85, 180, 85],
      attribution: "\u00a9 OpenMapTiles",
    });

    const result = await resolveTileJsonSources(makeIR(), fetchFn);
    const src = vectorSource(result, "openmaptiles");
    expect(src.bounds).toEqual([-180, -85, 180, 85]);
    expect(src.attribution).toBe("\u00a9 OpenMapTiles");
  });

  it("skips sources that already have tiles", async () => {
    const ir = makeIR({
      sources: {
        openmaptiles: {
          type: "vector",
          url: "https://tiles.example.com/v3/tiles.json",
          tiles: ["https://existing.com/{z}/{x}/{y}.pbf"],
        },
      },
    });

    const fetchFn = vi.fn();
    const result = await resolveTileJsonSources(ir, fetchFn);

    expect(fetchFn).not.toHaveBeenCalled();
    expect(vectorSource(result, "openmaptiles").tiles).toEqual([
      "https://existing.com/{z}/{x}/{y}.pbf",
    ]);
  });

  it("skips Esri VectorTileServer URLs", async () => {
    const ir = makeIR({
      sources: {
        esri: {
          type: "vector",
          url: "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap/VectorTileServer",
        },
      },
    });

    const fetchFn = vi.fn();
    await resolveTileJsonSources(ir, fetchFn);

    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("skips Esri rest/services URLs", async () => {
    const ir = makeIR({
      sources: {
        esri: {
          type: "vector",
          url: "https://example.com/arcgis/rest/services/MyService/VectorTileServer",
        },
      },
    });

    const fetchFn = vi.fn();
    await resolveTileJsonSources(ir, fetchFn);

    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("leaves source unchanged when fetch fails", async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error("Network error"));

    const ir = makeIR();
    const result = await resolveTileJsonSources(ir, fetchFn);

    const src = vectorSource(result, "openmaptiles");
    expect(src.tiles).toBeUndefined();
    expect(src.url).toBe("https://tiles.example.com/v3/tiles.json");
  });

  it("leaves source unchanged when TileJSON has no tiles", async () => {
    const fetchFn = vi.fn().mockResolvedValue({ name: "Empty TileJSON" });

    const result = await resolveTileJsonSources(makeIR(), fetchFn);

    expect(vectorSource(result, "openmaptiles").tiles).toBeUndefined();
  });

  it("leaves source unchanged when TileJSON has empty tiles array", async () => {
    const fetchFn = vi.fn().mockResolvedValue({ tiles: [] });

    const result = await resolveTileJsonSources(makeIR(), fetchFn);

    expect(vectorSource(result, "openmaptiles").tiles).toBeUndefined();
  });

  it("does not mutate the original IR", async () => {
    const ir = makeIR();
    const fetchFn = vi.fn().mockResolvedValue({
      tiles: ["https://tiles.example.com/{z}/{x}/{y}.pbf"],
    });

    await resolveTileJsonSources(ir, fetchFn);

    expect(vectorSource(ir, "openmaptiles").tiles).toBeUndefined();
  });

  it("resolves multiple sources in parallel", async () => {
    const ir = makeIR({
      sources: {
        streets: { type: "vector", url: "https://a.example.com/tiles.json" },
        terrain: { type: "vector", url: "https://b.example.com/tiles.json" },
      },
    });

    const fetchFn = vi.fn().mockImplementation((url: string) => {
      if (url.includes("a.example")) {
        return Promise.resolve({ tiles: ["https://a.example.com/{z}/{x}/{y}.pbf"] });
      }
      return Promise.resolve({ tiles: ["https://b.example.com/{z}/{x}/{y}.pbf"] });
    });

    const result = await resolveTileJsonSources(ir, fetchFn);

    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(vectorSource(result, "streets").tiles).toEqual([
      "https://a.example.com/{z}/{x}/{y}.pbf",
    ]);
    expect(vectorSource(result, "terrain").tiles).toEqual([
      "https://b.example.com/{z}/{x}/{y}.pbf",
    ]);
  });

  it("resolves raster sources with TileJSON urls", async () => {
    const ir = makeIR({
      sources: {
        raster: { type: "raster", url: "https://example.com/raster.json" },
      },
    });

    const fetchFn = vi.fn();
    await resolveTileJsonSources(ir, fetchFn);

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
