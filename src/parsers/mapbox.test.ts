import { describe, expect, it } from "vitest";
import type { TransformContext } from "../types/options.ts";
import { parseMapbox } from "./mapbox.ts";

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

describe("parseMapbox", () => {
  it("expands mapbox:// source URLs to HTTPS", () => {
    const input = {
      version: 8,
      sources: {
        composite: {
          type: "vector",
          url: "mapbox://mapbox.mapbox-streets-v8",
        },
      },
      layers: [],
    };

    const ctx = makeCtx({ mapboxAccessToken: "pk.test123" });
    const ir = parseMapbox(input, ctx);

    const source = ir.sources.composite as { url: string };
    expect(source.url).toContain("https://api.mapbox.com");
    expect(source.url).toContain("access_token=pk.test123");
  });

  it("expands mapbox:// sprite and glyph URLs", () => {
    const input = {
      version: 8,
      sources: {},
      sprite: "mapbox://sprites/mapbox/streets-v12",
      glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
      layers: [],
    };

    const ctx = makeCtx({ mapboxAccessToken: "pk.test123" });
    const ir = parseMapbox(input, ctx);

    expect(ir.sprite as string).toContain(
      "https://api.mapbox.com/styles/v1/mapbox/streets-v12/sprite",
    );
    expect(ir.sprite as string).toContain("access_token=pk.test123");

    expect(ir.glyphs).toContain("https://api.mapbox.com/fonts/v1/mapbox/");
    expect(ir.glyphs).toContain("{fontstack}");
    expect(ir.glyphs).toContain("{range}");
    expect(ir.glyphs).toContain("access_token=pk.test123");
  });

  it("stashes proprietary extensions in _extensions.mapbox", () => {
    const input = {
      version: 8,
      sources: {},
      layers: [],
      fog: { range: [0.5, 10] },
      lights: [{ type: "ambient" }],
      imports: [{ id: "base", url: "mapbox://styles/mapbox/standard" }],
    };

    const ctx = makeCtx({ mapboxAccessToken: "pk.test123" });
    const ir = parseMapbox(input, ctx);

    expect(ir._extensions?.mapbox).toBeDefined();
    expect(ir._extensions?.mapbox?.fog).toEqual({ range: [0.5, 10] });
    expect(ir._extensions?.mapbox?.lights).toEqual([{ type: "ambient" }]);
    expect(ir._extensions?.mapbox?.imports).toEqual([
      { id: "base", url: "mapbox://styles/mapbox/standard" },
    ]);
  });

  it("strips API metadata fields from output", () => {
    const input = {
      version: 8,
      sources: {},
      layers: [],
      owner: "mapbox",
      visibility: "public",
      draft: false,
      created: "2024-01-01",
      modified: "2024-06-01",
      id: "abc123",
    };

    const ctx = makeCtx({ mapboxAccessToken: "pk.test123" });
    const ir = parseMapbox(input, ctx);

    const record = ir as unknown as Record<string, unknown>;
    expect(record.owner).toBeUndefined();
    expect(record.visibility).toBeUndefined();
    expect(record.draft).toBeUndefined();
    expect(record.created).toBeUndefined();
    expect(record.modified).toBeUndefined();
    expect(record.id).toBeUndefined();
  });

  it("uses empty string access token when none provided, expanding mapbox:// URLs", () => {
    const input = {
      version: 8,
      sources: {
        composite: {
          type: "vector",
          url: "mapbox://mapbox.mapbox-streets-v8",
        },
      },
      layers: [],
    };

    const ctx = makeCtx();
    const ir = parseMapbox(input, ctx);

    const source = ir.sources.composite as { url: string };
    expect(source.url).toContain("https://api.mapbox.com");
    expect(source.url).toContain("access_token=");
  });
});
