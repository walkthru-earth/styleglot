import type { Dialect } from "../types/dialect.ts";
import { scoreEsri } from "./esri.ts";
import { scoreMapbox } from "./mapbox.ts";
import { scoreMaplibre } from "./maplibre.ts";

/**
 * Detect which map style dialect a raw style object most likely belongs to.
 *
 * Returns `"maplibre"` as the safest default when signals are ambiguous or
 * absent.
 */
export function detect(style: unknown): Dialect {
  if (typeof style !== "object" || style === null) {
    throw new Error("Detection failed: input must be a non-null object");
  }

  const record = style as Record<string, unknown>;

  const esri = scoreEsri(record);
  const mapbox = scoreMapbox(record);
  const maplibre = scoreMaplibre(record);

  // All zero, fall back to maplibre
  if (esri === 0 && mapbox === 0 && maplibre === 0) {
    return "maplibre";
  }

  // Find the winner. On a tie between esri and mapbox (both > 0), prefer
  // mapbox because Esri signals are more distinctive, so a tie likely means
  // Mapbox.  On any other tie, prefer maplibre as the safest default.
  if (esri > mapbox && esri > maplibre) return "esri";
  if (mapbox > esri && mapbox > maplibre) return "mapbox";
  if (maplibre > esri && maplibre > mapbox) return "maplibre";

  // Tie scenarios (at least two scores are equal and > 0)
  if (esri === mapbox && esri > maplibre) return "mapbox";
  if (esri === maplibre && esri > mapbox) return "maplibre";
  if (mapbox === maplibre && mapbox > esri) return "maplibre";

  // Three-way tie (all equal and > 0)
  return "maplibre";
}
