import { describe, expect, it } from "vitest";
import {
  getResourceBaseUrl,
  getStyleBaseUrl,
  resolveEsriGlyphUrl,
  resolveEsriSourceUrl,
  resolveEsriSpriteUrl,
  resolveRelativeUrl,
} from "./resolve.ts";

const VTS_BASE =
  "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer";

describe("getStyleBaseUrl", () => {
  it("appends /resources/styles/ to the base URL", () => {
    expect(getStyleBaseUrl(VTS_BASE)).toBe(`${VTS_BASE}/resources/styles/`);
  });

  it("strips trailing slashes before appending", () => {
    expect(getStyleBaseUrl(`${VTS_BASE}/`)).toBe(`${VTS_BASE}/resources/styles/`);
    expect(getStyleBaseUrl(`${VTS_BASE}///`)).toBe(`${VTS_BASE}/resources/styles/`);
  });
});

describe("getResourceBaseUrl", () => {
  it("appends /resources/ to the base URL", () => {
    expect(getResourceBaseUrl(VTS_BASE)).toBe(`${VTS_BASE}/resources/`);
  });

  it("strips trailing slashes before appending", () => {
    expect(getResourceBaseUrl(`${VTS_BASE}/`)).toBe(`${VTS_BASE}/resources/`);
  });
});

describe("resolveEsriSourceUrl", () => {
  it("returns the tile URL template with z/y/x", () => {
    expect(resolveEsriSourceUrl(VTS_BASE)).toBe(`${VTS_BASE}/tile/{z}/{y}/{x}.pbf`);
  });

  it("strips trailing slashes before building the tile URL", () => {
    expect(resolveEsriSourceUrl(`${VTS_BASE}/`)).toBe(`${VTS_BASE}/tile/{z}/{y}/{x}.pbf`);
  });
});

describe("resolveEsriSpriteUrl", () => {
  it("resolves ../sprites/sprite against the style base", () => {
    const result = resolveEsriSpriteUrl(VTS_BASE, "../sprites/sprite");
    expect(result).toBe(`${VTS_BASE}/resources/sprites/sprite`);
  });

  it("resolves an absolute sprite URL unchanged", () => {
    const absolute = "https://example.com/sprites/my-sprite";
    const result = resolveEsriSpriteUrl(VTS_BASE, absolute);
    expect(result).toBe(absolute);
  });
});

describe("resolveEsriGlyphUrl", () => {
  it("resolves ../fonts/{fontstack}/{range}.pbf preserving template tokens", () => {
    const result = resolveEsriGlyphUrl(VTS_BASE, "../fonts/{fontstack}/{range}.pbf");
    expect(result).toBe(`${VTS_BASE}/resources/fonts/{fontstack}/{range}.pbf`);
  });
});

describe("resolveRelativeUrl", () => {
  it("resolves a simple relative path against a base", () => {
    const result = resolveRelativeUrl("https://example.com/a/b/", "c.json");
    expect(result).toBe("https://example.com/a/b/c.json");
  });

  it("handles ../ navigation", () => {
    const result = resolveRelativeUrl("https://example.com/a/b/c/", "../../d.json");
    expect(result).toBe("https://example.com/a/d.json");
  });

  it("handles base URL with query params (URL constructor drops them for relative resolution)", () => {
    const result = resolveRelativeUrl("https://example.com/a/b/?token=abc", "../c.json");
    expect(result).toBe("https://example.com/a/c.json");
  });
});
