import { describe, expect, it, vi } from "vitest";
import { transpile, transpileAsync } from "./pipeline.ts";
import type { EsriStyleOutput } from "./types/dialect.ts";

const STADIA_STYLE = {
  version: 8,
  name: "Stadia Alidade Smooth",
  sources: {
    openmaptiles: {
      type: "vector",
      url: "https://tiles.stadiamaps.com/data/openmaptiles.json",
    },
  },
  sprite: "https://tiles.stadiamaps.com/styles/alidade-smooth/sprite",
  glyphs: "https://tiles.stadiamaps.com/fonts/{fontstack}/{range}.pbf",
  layers: [
    { id: "background", type: "background", paint: { "background-color": "#f8f4f0" } },
    {
      id: "water",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "water",
      paint: { "fill-color": "#aad3df" },
    },
  ],
};

describe("transpileAsync", () => {
  it("resolves TileJSON when resolveSources is true", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      tiles: ["https://tiles.stadiamaps.com/data/openmaptiles/{z}/{x}/{y}.pbf"],
      minzoom: 0,
      maxzoom: 14,
    });

    const result = await transpileAsync(STADIA_STYLE, {
      toDialect: "esri",
      resolveSources: true,
      fetch: mockFetch,
    });

    const output = result.output as EsriStyleOutput;

    expect(mockFetch).toHaveBeenCalledWith("https://tiles.stadiamaps.com/data/openmaptiles.json");
    expect(output.sources.openmaptiles.tiles).toEqual([
      "https://tiles.stadiamaps.com/data/openmaptiles/{z}/{x}/{y}.pbf",
    ]);
    expect(output.sources.openmaptiles.minzoom).toBe(0);
    expect(output.sources.openmaptiles.maxzoom).toBe(14);
    // Sprite/glyphs should be absolute since this is a non-Esri source
    expect(output.sprite).toBe("https://tiles.stadiamaps.com/styles/alidade-smooth/sprite");
    expect(output.glyphs).toBe("https://tiles.stadiamaps.com/fonts/{fontstack}/{range}.pbf");
  });

  it("does not resolve TileJSON by default", async () => {
    const mockFetch = vi.fn();

    const result = await transpileAsync(STADIA_STYLE, {
      toDialect: "esri",
      fetch: mockFetch,
    });

    const output = result.output as EsriStyleOutput;

    expect(mockFetch).not.toHaveBeenCalled();
    // TileJSON URL should be passed through directly
    expect(output.sources.openmaptiles.url).toBe(
      "https://tiles.stadiamaps.com/data/openmaptiles.json",
    );
    expect(output.sources.openmaptiles.tiles).toBeUndefined();
  });

  it("falls back gracefully when TileJSON fetch fails", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const result = await transpileAsync(STADIA_STYLE, {
      toDialect: "esri",
      resolveSources: true,
      fetch: mockFetch,
    });

    const output = result.output as EsriStyleOutput;

    // TileJSON url should be passed through since fetch failed
    expect(output.sources.openmaptiles.url).toBe(
      "https://tiles.stadiamaps.com/data/openmaptiles.json",
    );
    expect(output.sources.openmaptiles.tiles).toBeUndefined();
  });

  it("passes through TileJSON url to Esri when using sync transpile", () => {
    const result = transpile(STADIA_STYLE, { toDialect: "esri" });

    const output = result.output as EsriStyleOutput;

    // Sync transpile does not resolve TileJSON, but passes through the url
    expect(output.sources.openmaptiles.url).toBe(
      "https://tiles.stadiamaps.com/data/openmaptiles.json",
    );
  });

  it("accepts string input", async () => {
    const result = await transpileAsync(JSON.stringify(STADIA_STYLE), {
      toDialect: "esri",
    });

    const output = result.output as EsriStyleOutput;
    expect(output).toBeDefined();
    // Without resolveSources, URL is passed through
    expect(output.sources.openmaptiles.url).toBe(
      "https://tiles.stadiamaps.com/data/openmaptiles.json",
    );
  });

  it("throws on invalid JSON string", async () => {
    await expect(transpileAsync("not json", { toDialect: "esri" })).rejects.toThrow(
      "Transpile failed: input is not valid JSON",
    );
  });

  it("throws on null input", async () => {
    await expect(transpileAsync(null, { toDialect: "esri" })).rejects.toThrow(
      "Transpile failed: input must be a non-null object or JSON string",
    );
  });
});
