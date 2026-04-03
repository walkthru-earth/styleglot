import type { Dialect } from "../types/dialect.ts";
import type { TransformContext } from "../types/options.ts";
import type { IRStyle } from "../types/style.ts";
import { parseEsri } from "./esri.ts";
import { parseMapbox } from "./mapbox.ts";
import { parseMaplibre } from "./maplibre.ts";

/**
 * Parses a raw style input into the intermediate representation.
 *
 * Accepts either a JSON string or a plain object. Dispatches to the
 * dialect-specific parser based on the provided dialect.
 */
export function parse(input: unknown, dialect: Dialect, ctx: TransformContext): IRStyle {
  let obj: Record<string, unknown>;

  if (typeof input === "string") {
    obj = JSON.parse(input) as Record<string, unknown>;
  } else if (input === null || typeof input !== "object") {
    throw new Error(
      `Expected a style object or JSON string, got ${input === null ? "null" : typeof input}.`,
    );
  } else {
    obj = input as Record<string, unknown>;
  }

  switch (dialect) {
    case "esri":
      return parseEsri(obj, ctx);
    case "mapbox":
      return parseMapbox(obj, ctx);
    case "maplibre":
      return parseMaplibre(obj, ctx);
    default: {
      const _exhaustive: never = dialect;
      throw new Error(`Unknown dialect: ${_exhaustive}`);
    }
  }
}
