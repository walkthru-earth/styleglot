import { describe, expect, it } from "vitest";
import type { TransformContext } from "../types/options.ts";
import type { IRStyle } from "../types/style.ts";
import { convertExpressions } from "./convert-expressions.ts";

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
    sources: {},
    layers: layers as unknown as IRStyle["layers"],
  };
}

describe("convertExpressions", () => {
  it("converts legacy exponential stops to interpolate expression when modernizeExpressions is true", () => {
    const style = makeStyle([
      {
        id: "test",
        type: "fill",
        source: "src",
        paint: {
          "fill-color": {
            stops: [
              [5, "red"],
              [10, "blue"],
            ],
          },
        },
      },
    ]);

    const ctx = makeCtx({
      options: { toDialect: "maplibre", modernizeExpressions: true },
    });
    const result = convertExpressions(style, ctx);

    const paint = result.layers[0].paint as Record<string, unknown>;
    const expr = paint["fill-color"] as unknown[];
    expect(expr[0]).toBe("interpolate");
    expect(expr[2]).toEqual(["zoom"]);
    expect(expr).toContain(5);
    expect(expr).toContain("red");
    expect(expr).toContain(10);
    expect(expr).toContain("blue");
  });

  it("converts interval type stops to step expression when modernizeExpressions is true", () => {
    const style = makeStyle([
      {
        id: "test",
        type: "fill",
        source: "src",
        paint: {
          "fill-opacity": {
            type: "interval",
            stops: [
              [0, 0.5],
              [10, 1],
            ],
          },
        },
      },
    ]);

    const ctx = makeCtx({
      options: { toDialect: "maplibre", modernizeExpressions: true },
    });
    const result = convertExpressions(style, ctx);

    const paint = result.layers[0].paint as Record<string, unknown>;
    const expr = paint["fill-opacity"] as unknown[];
    expect(expr[0]).toBe("step");
    expect(expr[1]).toEqual(["zoom"]);
    // Default output is first stop value
    expect(expr[2]).toBe(0.5);
    // Then stop, output pairs
    expect(expr[3]).toBe(10);
    expect(expr[4]).toBe(1);
  });

  it("removes Mapbox-only 'config' expression when targeting maplibre and pushes warning", () => {
    const style = makeStyle([
      {
        id: "test",
        type: "fill",
        source: "src",
        paint: {
          "fill-color": ["config", "color", "red"],
        },
      },
    ]);

    const ctx = makeCtx({ targetDialect: "maplibre" });
    const result = convertExpressions(style, ctx);

    const paint = result.layers[0].paint as Record<string, unknown>;
    expect(paint["fill-color"]).toBeNull();
    expect(ctx.warnings.length).toBeGreaterThan(0);
    expect(
      ctx.warnings.some((w) => w.code === "UNSUPPORTED_EXPRESSION" && w.message.includes("config")),
    ).toBe(true);
  });

  it("removes MapLibre-only 'global-state' expression when targeting mapbox", () => {
    const style = makeStyle([
      {
        id: "test",
        type: "fill",
        source: "src",
        paint: {
          "fill-color": ["global-state", "accent-color"],
        },
      },
    ]);

    const ctx = makeCtx({
      sourceDialect: "maplibre",
      targetDialect: "mapbox",
      options: { toDialect: "mapbox" },
    });
    const result = convertExpressions(style, ctx);

    const paint = result.layers[0].paint as Record<string, unknown>;
    expect(paint["fill-color"]).toBeNull();
    expect(ctx.warnings.some((w) => w.message.includes("global-state"))).toBe(true);
  });

  it("removes Mapbox-only 'random' expression when targeting MapLibre", () => {
    const style = makeStyle([
      {
        id: "test",
        type: "symbol",
        source: "src",
        layout: {
          "icon-rotate": ["random", 0, 360, ["id"]],
        },
      },
    ]);

    const ctx = makeCtx({ targetDialect: "maplibre" });
    const result = convertExpressions(style, ctx);

    const layout = result.layers[0].layout as Record<string, unknown>;
    expect(layout["icon-rotate"]).toBeNull();
    expect(ctx.warnings.some((w) => w.message.includes("random"))).toBe(true);
  });

  it("removes MapLibre-only 'split' expression when targeting Mapbox", () => {
    const style = makeStyle([
      {
        id: "test",
        type: "symbol",
        source: "src",
        layout: {
          "text-field": ["split", ["get", "name"], ","],
        },
      },
    ]);

    const ctx = makeCtx({
      sourceDialect: "maplibre",
      targetDialect: "mapbox",
      options: { toDialect: "mapbox" },
    });
    const result = convertExpressions(style, ctx);

    const layout = result.layers[0].layout as Record<string, unknown>;
    expect(layout["text-field"]).toBeNull();
    expect(ctx.warnings.some((w) => w.message.includes("split"))).toBe(true);
  });

  it("removes Esri-unsupported 'within' expression when targeting Esri", () => {
    const style = makeStyle([
      {
        id: "test",
        type: "fill",
        source: "src",
        paint: {
          "fill-opacity": ["case", ["within", { type: "Polygon", coordinates: [] }], 1, 0.5],
        },
      },
    ]);

    const ctx = makeCtx({
      sourceDialect: "maplibre",
      targetDialect: "esri",
      options: { toDialect: "esri" },
    });
    const result = convertExpressions(style, ctx);

    const paint = result.layers[0].paint as Record<string, unknown>;
    const expr = paint["fill-opacity"] as unknown[];
    // The nested 'within' should be replaced with null
    expect(expr[1]).toBeNull();
    expect(ctx.warnings.some((w) => w.message.includes("within"))).toBe(true);
  });

  it("keeps legacy stops as-is when modernizeExpressions is false (default)", () => {
    const legacyStops = {
      stops: [
        [5, "red"],
        [10, "blue"],
      ],
    };

    const style = makeStyle([
      {
        id: "test",
        type: "fill",
        source: "src",
        paint: { "fill-color": legacyStops },
      },
    ]);

    const ctx = makeCtx(); // modernizeExpressions defaults to false
    const result = convertExpressions(style, ctx);

    const paint = result.layers[0].paint as Record<string, unknown>;
    expect(paint["fill-color"]).toEqual(legacyStops);
  });
});
