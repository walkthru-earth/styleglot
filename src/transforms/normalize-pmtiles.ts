import type { TransformContext } from "../types/options.ts";
import type { IRStyle } from "../types/style.ts";
import { WARNING_CODES } from "../types/warnings.ts";
import { isPMTilesUrl } from "../url/pmtiles-protocol.ts";
import { createWarning, deepClone } from "../utils.ts";

/**
 * Check source URLs for `pmtiles://` prefix and warn when the target
 * dialect does not support them natively.
 */
export function normalizePMTiles(style: IRStyle, ctx: TransformContext): IRStyle {
  const result = deepClone(style);

  for (const [sourceId, source] of Object.entries(result.sources)) {
    const record = source as unknown as Record<string, unknown>;

    const urlsToCheck: string[] = [];

    if (typeof record.url === "string") {
      urlsToCheck.push(record.url);
    }

    if (Array.isArray(record.tiles)) {
      for (const tile of record.tiles as unknown[]) {
        if (typeof tile === "string") {
          urlsToCheck.push(tile);
        }
      }
    }

    const hasPMTiles = urlsToCheck.some(isPMTilesUrl);

    if (!hasPMTiles) continue;

    // MapLibre supports pmtiles natively, nothing to do.
    if (ctx.targetDialect === "maplibre") continue;

    // Mapbox and Esri do not support pmtiles natively. Warn but keep the URL.
    ctx.warnings.push(
      createWarning(
        WARNING_CODES.PMTILES_UNSUPPORTED_TARGET,
        `Source "${sourceId}" uses pmtiles:// protocol which is not natively supported by ${ctx.targetDialect}`,
        `sources.${sourceId}`,
        "warn",
        ctx.sourceDialect,
        ctx.targetDialect,
      ),
    );
  }

  return result;
}
