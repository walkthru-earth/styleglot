import { describe, expect, it } from "vitest";
import type { TransformContext } from "../types/options.ts";
import { parseEsri } from "./esri.ts";

function makeCtx(overrides?: Partial<TransformContext>): TransformContext {
  return {
    sourceDialect: "esri",
    targetDialect: "maplibre",
    plugins: [],
    warnings: [],
    options: { toDialect: "maplibre" },
    ...overrides,
  };
}

describe("parseEsri", () => {
  const BASE_URL =
    "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer";

  it("resolves relative source, sprite, and glyph URLs against baseUrl", () => {
    const input = {
      version: 8,
      sources: { esri: { type: "vector", url: "../../" } },
      sprite: "../sprites/sprite",
      glyphs: "../fonts/{fontstack}/{range}.pbf",
      layers: [],
    };

    const ctx = makeCtx({ baseUrl: BASE_URL });
    const ir = parseEsri(input, ctx);

    expect(ir.sources.esri).toEqual({
      type: "vector",
      tiles: [`${BASE_URL}/tile/{z}/{y}/{x}.pbf`],
    });

    expect(ir.sprite).toBe(`${BASE_URL}/resources/sprites/sprite`);

    expect(ir.glyphs).toContain("{fontstack}");
    expect(ir.glyphs).toContain("{range}");
    expect((ir.glyphs as string).startsWith("https://")).toBe(true);
  });

  it("appends token from baseUrl to all resolved URLs", () => {
    const input = {
      version: 8,
      sources: { esri: { type: "vector", url: "../../" } },
      sprite: "../sprites/sprite",
      glyphs: "../fonts/{fontstack}/{range}.pbf",
      layers: [],
    };

    const ctx = makeCtx({
      baseUrl: `${BASE_URL}?token=abc123`,
      options: { toDialect: "maplibre" },
    });
    const ir = parseEsri(input, ctx);

    const tiles = (ir.sources.esri as { tiles: string[] }).tiles;
    expect(tiles[0]).toContain("token=abc123");
    expect(ir.sprite as string).toContain("token=abc123");
    expect(ir.glyphs as string).toContain("token=abc123");
  });

  it("leaves already-absolute sprite URL unchanged", () => {
    const input = {
      version: 8,
      sources: {},
      sprite: "https://example.com/sprites/my-sprite",
      layers: [],
    };

    const ctx = makeCtx({ baseUrl: BASE_URL });
    const ir = parseEsri(input, ctx);

    expect(ir.sprite).toBe("https://example.com/sprites/my-sprite");
  });

  it("keeps source as-is and emits a warning when no baseUrl is provided", () => {
    const input = {
      version: 8,
      sources: { esri: { type: "vector", url: "../../" } },
      layers: [],
    };

    const ctx = makeCtx({ baseUrl: undefined });
    const ir = parseEsri(input, ctx);

    expect((ir.sources.esri as unknown as Record<string, unknown>).url).toBe("../../");
    expect(ctx.warnings.length).toBeGreaterThan(0);
    expect(ctx.warnings.some((w) => w.code === "ESRI_ITEM_URL_NEEDS_BASE")).toBe(true);
  });
});
