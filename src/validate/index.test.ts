import { describe, expect, it } from "vitest";
import { validate } from "./index.ts";

describe("validate", () => {
  it("passes for a valid minimal style", () => {
    const result = validate({ version: 8, sources: {}, layers: [] });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("fails when version is missing", () => {
    const result = validate({ sources: {}, layers: [] });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Style "version" must be 8');
  });

  it("fails when version is not 8", () => {
    const result = validate({ version: 7, sources: {}, layers: [] });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Style "version" must be 8');
  });

  it("fails when sources is not an object", () => {
    const result = validate({ version: 8, sources: "bad", layers: [] });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("sources"))).toBe(true);
  });

  it("fails when sources is an array", () => {
    const result = validate({ version: 8, sources: [], layers: [] });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("sources") && e.includes("array"))).toBe(true);
  });

  it("fails when a layer is missing an id", () => {
    const result = validate({
      version: 8,
      sources: {},
      layers: [{ type: "background" }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('"id"'))).toBe(true);
  });

  it("fails when a layer references a non-existent source", () => {
    const result = validate({
      version: 8,
      sources: {},
      layers: [{ id: "my-layer", type: "fill", source: "nonexistent" }],
    });
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => e.includes("nonexistent") && e.includes("does not exist")),
    ).toBe(true);
  });

  it("passes with a valid sprite string", () => {
    const result = validate({
      version: 8,
      sources: {},
      layers: [],
      sprite: "https://example.com/sprite",
    });
    expect(result.valid).toBe(true);
  });

  it("fails with an invalid multi-sprite entry missing url", () => {
    const result = validate({
      version: 8,
      sources: {},
      layers: [],
      sprite: [{ id: "default" }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("url"))).toBe(true);
  });

  it("passes with valid glyphs containing both placeholders", () => {
    const result = validate({
      version: 8,
      sources: {},
      layers: [],
      glyphs: "https://example.com/fonts/{fontstack}/{range}.pbf",
    });
    expect(result.valid).toBe(true);
  });

  it("fails when glyphs is missing {fontstack}", () => {
    const result = validate({
      version: 8,
      sources: {},
      layers: [],
      glyphs: "https://example.com/fonts/{range}.pbf",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("{fontstack}"))).toBe(true);
  });

  it("fails when glyphs is missing {range}", () => {
    const result = validate({
      version: 8,
      sources: {},
      layers: [],
      glyphs: "https://example.com/fonts/{fontstack}/glyphs.pbf",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("{range}"))).toBe(true);
  });

  it("fails when style is null", () => {
    const result = validate(null);
    expect(result.valid).toBe(false);
  });

  it("fails when style is an array", () => {
    const result = validate([]);
    expect(result.valid).toBe(false);
  });
});
