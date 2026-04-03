import { describe, expect, it } from "vitest";
import type { TransformContext } from "../types/options.ts";
import type { IRStyle } from "../types/style.ts";
import { emitEsri, resolveEsriStyleUrls } from "./esri.ts";

function makeCtx(overrides?: Partial<TransformContext>): TransformContext {
  return {
    sourceDialect: "mapbox",
    targetDialect: "esri",
    plugins: [],
    warnings: [],
    options: { toDialect: "esri" },
    ...overrides,
  };
}

function makeIR(overrides?: Partial<IRStyle>): IRStyle {
  return {
    version: 8,
    sources: {
      composite: { type: "vector", tiles: ["https://example.com/{z}/{x}/{y}.pbf"] },
    },
    layers: [
      { id: "bg", type: "background" },
      {
        id: "fill",
        type: "fill",
        source: "composite",
        "source-layer": "land",
        paint: { "fill-color": "green" },
      },
    ] as IRStyle["layers"],
    sprite: "https://example.com/sprites/sprite",
    glyphs: "https://example.com/fonts/{fontstack}/{range}.pbf",
    ...overrides,
  };
}

describe("emitEsri", () => {
  const BASE_URL =
    "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer";

  it("emits exactly 5 keys: version, sprite, glyphs, sources, layers", () => {
    const ctx = makeCtx({ baseUrl: BASE_URL });
    const output = emitEsri(makeIR(), ctx);

    const keys = Object.keys(output).sort();
    expect(keys).toEqual(["glyphs", "layers", "sources", "sprite", "version"].sort());
    expect(keys).toHaveLength(5);
  });

  it("preserves original source names", () => {
    const ctx = makeCtx({ baseUrl: BASE_URL });
    const output = emitEsri(makeIR(), ctx);

    expect(output.sources).toHaveProperty("composite");
    expect(output.sources).not.toHaveProperty("esri");
  });

  it("preserves original layer source references", () => {
    const ctx = makeCtx({ baseUrl: BASE_URL });
    const output = emitEsri(makeIR(), ctx);

    const bgLayer = output.layers.find((l) => l.id === "bg");
    const fillLayer = output.layers.find((l) => l.id === "fill");

    expect(bgLayer?.source).toBeUndefined();
    expect(fillLayer?.source).toBe("composite");
  });

  it("preserves multiple sources", () => {
    const ctx = makeCtx();
    const ir = makeIR({
      sources: {
        openmaptiles: { type: "vector", url: "https://a.example.com/tiles.json" },
        terrain: { type: "vector", url: "https://b.example.com/tiles.json" },
      },
    });
    const output = emitEsri(ir, ctx);

    expect(Object.keys(output.sources)).toEqual(["openmaptiles", "terrain"]);
  });

  it("re-relativizes sprite when baseUrl is provided and source is Esri", () => {
    const ctx = makeCtx({ baseUrl: BASE_URL });
    const ir = makeIR({
      sources: { esri: { type: "vector", url: `${BASE_URL}` } },
    });
    const output = emitEsri(ir, ctx);

    expect(output.sprite).toBe("../sprites/sprite");
  });

  it("re-relativizes glyphs when baseUrl is provided and source is Esri", () => {
    const ctx = makeCtx({ baseUrl: BASE_URL });
    const ir = makeIR({
      sources: { esri: { type: "vector", url: `${BASE_URL}` } },
    });
    const output = emitEsri(ir, ctx);

    expect(output.glyphs).toBe("../fonts/{fontstack}/{range}.pbf");
  });

  it("uses resolved tiles from IR sources when available", () => {
    const ctx = makeCtx({ baseUrl: BASE_URL });
    const output = emitEsri(makeIR(), ctx);

    expect(output.sources.composite).toEqual({
      type: "vector",
      tiles: ["https://example.com/{z}/{x}/{y}.pbf"],
    });
  });

  it("keeps absolute sprite/glyphs when sources have resolved tiles", () => {
    const ctx = makeCtx({ baseUrl: BASE_URL });
    const output = emitEsri(makeIR(), ctx);

    expect(output.sprite).toBe("https://example.com/sprites/sprite");
    expect(output.glyphs).toBe("https://example.com/fonts/{fontstack}/{range}.pbf");
    expect(ctx.warnings).toHaveLength(0);
  });

  it("passes through TileJSON url when tiles are not resolved", () => {
    const ctx = makeCtx({ baseUrl: BASE_URL });
    const ir = makeIR({
      sources: { openmaptiles: { type: "vector", url: "https://example.com/tiles.json" } },
    });
    const output = emitEsri(ir, ctx);

    expect(output.sources.openmaptiles).toEqual({
      type: "vector",
      url: "https://example.com/tiles.json",
    });
  });

  it("keeps absolute sprite/glyphs when source has TileJSON url", () => {
    const ctx = makeCtx();
    const ir = makeIR({
      sources: { openmaptiles: { type: "vector", url: "https://example.com/tiles.json" } },
    });
    const output = emitEsri(ir, ctx);

    expect(output.sprite).toBe("https://example.com/sprites/sprite");
    expect(output.glyphs).toBe("https://example.com/fonts/{fontstack}/{range}.pbf");
    expect(ctx.warnings).toHaveLength(0);
  });

  it("falls back to relative url when source is Esri VTS", () => {
    const ctx = makeCtx({ baseUrl: BASE_URL });
    const ir = makeIR({
      sources: { esri: { type: "vector", url: `${BASE_URL}` } },
    });
    const output = emitEsri(ir, ctx);

    expect(output.sources.esri).toEqual({
      type: "vector",
      url: "../../",
    });
  });

  it("falls back to relative url when no source url or tiles exist", () => {
    const ctx = makeCtx({ baseUrl: BASE_URL });
    const ir = makeIR({
      sources: { composite: { type: "vector" } },
    });
    const output = emitEsri(ir, ctx);

    expect(output.sources.composite).toEqual({
      type: "vector",
      url: "../../",
    });
  });

  it("includes minzoom/maxzoom when tiles are resolved", () => {
    const ctx = makeCtx();
    const ir = makeIR({
      sources: {
        openmaptiles: {
          type: "vector",
          tiles: ["https://example.com/{z}/{x}/{y}.pbf"],
          minzoom: 0,
          maxzoom: 14,
        },
      },
    });
    const output = emitEsri(ir, ctx);

    expect(output.sources.openmaptiles.minzoom).toBe(0);
    expect(output.sources.openmaptiles.maxzoom).toBe(14);
  });

  it("keeps absolute URLs when no baseUrl and Esri source", () => {
    const ir = makeIR({
      sources: { composite: { type: "vector" } },
      sprite: "https://example.com/sprites/sprite",
      glyphs: "https://example.com/fonts/{fontstack}/{range}.pbf",
    });

    const ctx = makeCtx({ baseUrl: undefined });
    const output = emitEsri(ir, ctx);

    expect(output.sprite).toBe("https://example.com/sprites/sprite");
    expect(output.glyphs).toBe("https://example.com/fonts/{fontstack}/{range}.pbf");
  });
});

describe("resolveEsriStyleUrls", () => {
  const BASE_URL =
    "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer";

  it("resolves relative sprite and glyphs to absolute", () => {
    const style = {
      version: 8 as const,
      sprite: "../sprites/sprite",
      glyphs: "../fonts/{fontstack}/{range}.pbf",
      sources: { esri: { type: "vector" as const, url: "../../" } },
      layers: [],
    };

    const resolved = resolveEsriStyleUrls(style, BASE_URL);

    expect(resolved.sprite).toBe(`${BASE_URL}/resources/sprites/sprite`);
    expect(resolved.glyphs).toBe(`${BASE_URL}/resources/fonts/{fontstack}/{range}.pbf`);
  });

  it("resolves relative source url to tile endpoint", () => {
    const style = {
      version: 8 as const,
      sprite: "../sprites/sprite",
      glyphs: "../fonts/{fontstack}/{range}.pbf",
      sources: { esri: { type: "vector" as const, url: "../../" } },
      layers: [],
    };

    const resolved = resolveEsriStyleUrls(style, BASE_URL);

    expect(resolved.sources.esri.url).toBe(`${BASE_URL}/tile/{z}/{y}/{x}.pbf`);
  });

  it("leaves absolute URLs untouched", () => {
    const style = {
      version: 8 as const,
      sprite: "https://other.com/sprites/sprite",
      glyphs: "https://other.com/fonts/{fontstack}/{range}.pbf",
      sources: {
        openmaptiles: {
          type: "vector" as const,
          tiles: ["https://tiles.example.com/{z}/{x}/{y}.pbf"],
        },
      },
      layers: [],
    };

    const resolved = resolveEsriStyleUrls(style, BASE_URL);

    expect(resolved.sprite).toBe("https://other.com/sprites/sprite");
    expect(resolved.glyphs).toBe("https://other.com/fonts/{fontstack}/{range}.pbf");
    expect(resolved.sources.openmaptiles.tiles).toEqual([
      "https://tiles.example.com/{z}/{x}/{y}.pbf",
    ]);
  });
});
