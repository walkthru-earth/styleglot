import { describe, expect, it } from "vitest";
import type { TransformContext } from "../types/options.ts";
import type { IRStyle } from "../types/style.ts";
import { stripLossy } from "./strip-lossy.ts";

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

function makeStyle(overrides?: Partial<IRStyle>): IRStyle {
  return {
    version: 8,
    sources: {},
    layers: [],
    ...overrides,
  };
}

describe("stripLossy", () => {
  it("drops unsupported layer types when targeting Esri", () => {
    const style = makeStyle({
      layers: [
        { id: "bg", type: "background" },
        { id: "heat", type: "heatmap", source: "s", paint: {} },
        { id: "rast", type: "raster", source: "s", paint: {} },
        { id: "hill", type: "hillshade", source: "s", paint: {} },
        { id: "fill", type: "fill", source: "s", paint: {} },
      ] as IRStyle["layers"],
    });

    const ctx = makeCtx({ targetDialect: "esri" });
    const result = stripLossy(style, ctx);

    const ids = result.layers.map((l) => l.id);
    expect(ids).toContain("bg");
    expect(ids).toContain("fill");
    expect(ids).not.toContain("heat");
    expect(ids).not.toContain("rast");
    expect(ids).not.toContain("hill");
  });

  it("strips top-level properties when targeting Esri", () => {
    const style = makeStyle({
      name: "Test Style",
      metadata: { "mapbox:origin": "test" },
      sky: { "sky-color": "blue" },
      terrain: { source: "dem", exaggeration: 1.5 },
    });

    const ctx = makeCtx({ targetDialect: "esri" });
    const result = stripLossy(style, ctx);

    expect(result.name).toBeUndefined();
    expect(result.metadata).toBeUndefined();
    expect(result.sky).toBeUndefined();
    expect(result.terrain).toBeUndefined();
    expect(ctx.warnings.length).toBeGreaterThan(0);
  });

  it("strips state and font-faces when targeting Mapbox", () => {
    const style = makeStyle();
    const record = style as unknown as Record<string, unknown>;
    record.state = { someState: true };
    record["font-faces"] = [{ fontFamily: "Test" }];

    const ctx = makeCtx({ targetDialect: "mapbox" });
    const result = stripLossy(style, ctx);

    const out = result as unknown as Record<string, unknown>;
    expect(out.state).toBeUndefined();
    expect(out["font-faces"]).toBeUndefined();
  });

  it("does not strip anything when targeting MapLibre", () => {
    const style = makeStyle({
      name: "My Style",
      metadata: { foo: "bar" },
      layers: [
        { id: "bg", type: "background" },
        { id: "heat", type: "heatmap", source: "s", paint: {} },
      ] as IRStyle["layers"],
    });

    const ctx = makeCtx({ targetDialect: "maplibre" });
    const result = stripLossy(style, ctx);

    expect(result.name).toBe("My Style");
    expect(result.layers).toHaveLength(2);
    expect(ctx.warnings).toHaveLength(0);
  });

  it("throws in strict mode on lossy layer removal", () => {
    const style = makeStyle({
      layers: [{ id: "heat", type: "heatmap", source: "s", paint: {} }] as IRStyle["layers"],
    });

    const ctx = makeCtx({
      targetDialect: "esri",
      options: { toDialect: "esri", strict: true },
    });

    expect(() => stripLossy(style, ctx)).toThrow(/lossy/i);
  });

  it("stashes dropped values in _extensions", () => {
    const style = makeStyle({
      name: "Stash Test",
      metadata: { key: "value" },
    });

    const ctx = makeCtx({
      sourceDialect: "mapbox",
      targetDialect: "esri",
    });
    const result = stripLossy(style, ctx);

    expect(result._extensions?.mapbox).toBeDefined();
    expect(result._extensions?.mapbox?.name).toBe("Stash Test");
    expect(result._extensions?.mapbox?.metadata).toEqual({ key: "value" });
  });
});
