import { describe, expect, it } from "vitest";
import type { TransformContext } from "../types/options.ts";
import type { IRStyle } from "../types/style.ts";
import { derefLayers } from "./deref-layers.ts";

function makeCtx(overrides?: Partial<TransformContext>): TransformContext {
  return {
    sourceDialect: "mapbox",
    targetDialect: "maplibre",
    plugins: [],
    warnings: [],
    options: { toDialect: "maplibre" },
    ...overrides,
  };
}

function makeStyle(layers: Record<string, unknown>[]): IRStyle {
  return {
    version: 8,
    sources: {
      composite: { type: "vector", tiles: ["https://example.com/{z}/{x}/{y}.pbf"] },
    },
    layers: layers as unknown as IRStyle["layers"],
  };
}

describe("derefLayers", () => {
  it("inherits type, source, and source-layer from referenced layer", () => {
    const style = makeStyle([
      { id: "base", type: "fill", source: "composite", "source-layer": "land" },
      { id: "child", ref: "base", paint: { "fill-color": "red" } },
    ]);

    const ctx = makeCtx();
    const result = derefLayers(style, ctx);

    const child = result.layers.find((l) => l.id === "child")!;
    expect(child.type).toBe("fill");
    expect(child.source).toBe("composite");
    expect(child["source-layer"]).toBe("land");
  });

  it("keeps the child layer's own paint and does not inherit paint from parent", () => {
    const style = makeStyle([
      {
        id: "base",
        type: "fill",
        source: "composite",
        "source-layer": "land",
        paint: { "fill-color": "blue" },
      },
      { id: "child", ref: "base", paint: { "fill-color": "red" } },
    ]);

    const ctx = makeCtx();
    const result = derefLayers(style, ctx);

    const child = result.layers.find((l) => l.id === "child")!;
    expect(child.paint).toEqual({ "fill-color": "red" });
  });

  it("pushes a warning and skips on circular ref chain", () => {
    const style = makeStyle([
      { id: "a", type: "fill", source: "composite", ref: "b" },
      { id: "b", type: "fill", source: "composite", ref: "a" },
    ]);

    const ctx = makeCtx();
    const result = derefLayers(style, ctx);

    expect(ctx.warnings.length).toBeGreaterThan(0);
    expect(ctx.warnings.some((w) => w.code === "REF_CYCLE")).toBe(true);

    // Layers still present but ref not resolved
    const a = result.layers.find((l) => l.id === "a") as unknown as Record<string, unknown>;
    expect(a).toBeDefined();
  });

  it("skips gracefully when ref target does not exist", () => {
    const style = makeStyle([
      { id: "orphan", ref: "nonexistent", paint: { "fill-color": "green" } },
    ]);

    const ctx = makeCtx();
    const result = derefLayers(style, ctx);

    const orphan = result.layers.find((l) => l.id === "orphan")!;
    // Should not crash. Type remains undefined since target was not found.
    expect(orphan).toBeDefined();
    expect(ctx.warnings.length).toBe(0);
  });

  it("returns style unchanged when no layers use ref", () => {
    const style = makeStyle([
      { id: "fill", type: "fill", source: "composite", "source-layer": "land" },
      { id: "line", type: "line", source: "composite", "source-layer": "roads" },
    ]);

    const ctx = makeCtx();
    const result = derefLayers(style, ctx);

    expect(result.layers).toHaveLength(2);
    expect(result.layers[0].type).toBe("fill");
    expect(result.layers[1].type).toBe("line");
    expect(ctx.warnings).toHaveLength(0);
  });
});
