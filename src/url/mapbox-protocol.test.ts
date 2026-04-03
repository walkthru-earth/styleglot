import { describe, expect, it } from "vitest";
import {
  expandMapboxGlyphUrl,
  expandMapboxSourceUrl,
  expandMapboxSpriteUrl,
  isMapboxUrl,
} from "./mapbox-protocol.ts";

const TOKEN = "pk.test";

describe("isMapboxUrl", () => {
  it("returns true for mapbox:// URLs", () => {
    expect(isMapboxUrl("mapbox://mapbox.mapbox-streets-v8")).toBe(true);
  });

  it("returns false for https:// URLs", () => {
    expect(isMapboxUrl("https://api.mapbox.com/v4/foo.json")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(isMapboxUrl("")).toBe(false);
  });
});

describe("expandMapboxSourceUrl", () => {
  it("expands a single tileset ID", () => {
    expect(expandMapboxSourceUrl("mapbox://mapbox.mapbox-streets-v8", TOKEN)).toBe(
      `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8.json?secure&access_token=${TOKEN}`,
    );
  });

  it("handles composite sources with commas", () => {
    expect(
      expandMapboxSourceUrl("mapbox://mapbox.mapbox-streets-v8,mapbox.mapbox-terrain-v2", TOKEN),
    ).toBe(
      `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8,mapbox.mapbox-terrain-v2.json?secure&access_token=${TOKEN}`,
    );
  });
});

describe("expandMapboxSpriteUrl", () => {
  it("expands a sprite URL to the styles API endpoint", () => {
    expect(expandMapboxSpriteUrl("mapbox://sprites/mapbox/streets-v12", TOKEN)).toBe(
      `https://api.mapbox.com/styles/v1/mapbox/streets-v12/sprite?access_token=${TOKEN}`,
    );
  });

  it("handles a different owner and style", () => {
    expect(expandMapboxSpriteUrl("mapbox://sprites/myuser/custom-style", TOKEN)).toBe(
      `https://api.mapbox.com/styles/v1/myuser/custom-style/sprite?access_token=${TOKEN}`,
    );
  });
});

describe("expandMapboxGlyphUrl", () => {
  it("expands a glyph URL preserving template tokens", () => {
    expect(expandMapboxGlyphUrl("mapbox://fonts/mapbox/{fontstack}/{range}.pbf", TOKEN)).toBe(
      `https://api.mapbox.com/fonts/v1/mapbox/{fontstack}/{range}.pbf?access_token=${TOKEN}`,
    );
  });

  it("works with a custom owner", () => {
    expect(expandMapboxGlyphUrl("mapbox://fonts/myuser/{fontstack}/{range}.pbf", TOKEN)).toBe(
      `https://api.mapbox.com/fonts/v1/myuser/{fontstack}/{range}.pbf?access_token=${TOKEN}`,
    );
  });
});
