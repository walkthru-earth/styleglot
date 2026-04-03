import { describe, expect, it } from "vitest";
import {
  createWarning,
  deepClone,
  isExpression,
  isGeoJSONSource,
  isLegacyStops,
  isRasterDEMSource,
  isRasterSource,
  isVectorSource,
} from "./utils.ts";

describe("deepClone", () => {
  it("clones an object without sharing references", () => {
    const original = { a: 1, nested: { b: 2 } };
    const cloned = deepClone(original);
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned.nested).not.toBe(original.nested);
  });

  it("clones arrays", () => {
    const original = [1, [2, 3]];
    const cloned = deepClone(original);
    expect(cloned).toEqual(original);
    expect(cloned[1]).not.toBe(original[1]);
  });

  it("handles primitives", () => {
    expect(deepClone("hello")).toBe("hello");
    expect(deepClone(42)).toBe(42);
    expect(deepClone(null)).toBeNull();
  });
});

describe("isExpression", () => {
  it("returns true for an expression array", () => {
    expect(isExpression(["==", "type", "park"])).toBe(true);
  });

  it("returns true for a nested expression", () => {
    expect(isExpression(["get", "name"])).toBe(true);
  });

  it("returns false for a legacy stops object", () => {
    expect(isExpression({ stops: [] })).toBe(false);
  });

  it("returns false for null", () => {
    expect(isExpression(null)).toBe(false);
  });

  it("returns false for a number array (first element not a string)", () => {
    expect(isExpression([1, 2, 3])).toBe(false);
  });

  it("returns false for an empty array", () => {
    expect(isExpression([])).toBe(false);
  });
});

describe("isLegacyStops", () => {
  it("returns true for an object with a stops array", () => {
    expect(
      isLegacyStops({
        stops: [
          [0, "red"],
          [10, "blue"],
        ],
      }),
    ).toBe(true);
  });

  it("returns false for an array", () => {
    expect(isLegacyStops(["get", "name"])).toBe(false);
  });

  it("returns false for null", () => {
    expect(isLegacyStops(null)).toBe(false);
  });

  it("returns false for a plain string", () => {
    expect(isLegacyStops("hello")).toBe(false);
  });
});

describe("source type guards", () => {
  it("isVectorSource returns true for vector type", () => {
    expect(isVectorSource({ type: "vector" } as any)).toBe(true);
  });

  it("isVectorSource returns false for raster type", () => {
    expect(isVectorSource({ type: "raster" } as any)).toBe(false);
  });

  it("isRasterSource returns true for raster type", () => {
    expect(isRasterSource({ type: "raster" } as any)).toBe(true);
  });

  it("isRasterDEMSource returns true for raster-dem type", () => {
    expect(isRasterDEMSource({ type: "raster-dem" } as any)).toBe(true);
  });

  it("isGeoJSONSource returns true for geojson type", () => {
    expect(isGeoJSONSource({ type: "geojson" } as any)).toBe(true);
  });

  it("isGeoJSONSource returns false for vector type", () => {
    expect(isGeoJSONSource({ type: "vector" } as any)).toBe(false);
  });
});

describe("createWarning", () => {
  it("returns an object with all provided fields", () => {
    const warning = createWarning(
      "TEST_CODE",
      "Something happened",
      "layers[0].paint",
      "warn",
      "mapbox",
      "maplibre",
    );
    expect(warning).toEqual({
      code: "TEST_CODE",
      message: "Something happened",
      path: "layers[0].paint",
      severity: "warn",
      sourceDialect: "mapbox",
      targetDialect: "maplibre",
    });
  });

  it("supports all severity levels", () => {
    for (const severity of ["info", "warn", "drop"] as const) {
      const w = createWarning("C", "m", "p", severity, "esri", "mapbox");
      expect(w.severity).toBe(severity);
    }
  });
});
