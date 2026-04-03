import { describe, expect, it } from "vitest";
import type { TransformContext } from "../types/options.ts";
import type { IRStyle } from "../types/style.ts";
import { emitEsri } from "./esri.ts";

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

  it("re-relativizes sprite to ../sprites/sprite when baseUrl is provided", () => {
    const ctx = makeCtx({ baseUrl: BASE_URL });
    const output = emitEsri(makeIR(), ctx);

    expect(output.sprite).toBe("../sprites/sprite");
  });

  it("re-relativizes glyphs to ../fonts/{fontstack}/{range}.pbf when baseUrl is provided", () => {
    const ctx = makeCtx({ baseUrl: BASE_URL });
    const output = emitEsri(makeIR(), ctx);

    expect(output.glyphs).toBe("../fonts/{fontstack}/{range}.pbf");
  });

  it("converts source back to Esri format with relative url", () => {
    const ctx = makeCtx({ baseUrl: BASE_URL });
    const output = emitEsri(makeIR(), ctx);

    expect(output.sources).toEqual({
      esri: { type: "vector", url: "../../" },
    });
  });

  it("sets layer source to 'esri' for non-background layers", () => {
    const ctx = makeCtx({ baseUrl: BASE_URL });
    const output = emitEsri(makeIR(), ctx);

    const bgLayer = output.layers.find((l) => l.id === "bg");
    const fillLayer = output.layers.find((l) => l.id === "fill");

    expect(bgLayer?.source).toBeUndefined();
    expect(fillLayer?.source).toBe("esri");
  });

  it("keeps absolute URLs and emits warnings when no baseUrl is provided", () => {
    const ir = makeIR({
      sprite: "https://example.com/sprites/sprite",
      glyphs: "https://example.com/fonts/{fontstack}/{range}.pbf",
    });

    const ctx = makeCtx({ baseUrl: undefined });
    const output = emitEsri(ir, ctx);

    expect(output.sprite).toBe("https://example.com/sprites/sprite");
    expect(output.glyphs).toBe("https://example.com/fonts/{fontstack}/{range}.pbf");
    expect(ctx.warnings.length).toBeGreaterThan(0);
    expect(ctx.warnings.some((w) => w.code === "ESRI_ITEM_URL_NEEDS_BASE")).toBe(true);
  });
});
