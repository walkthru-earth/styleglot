// ---------------------------------------------------------------------------
// PMTiles protocol utilities
// ---------------------------------------------------------------------------

const PMTILES_PROTOCOL = "pmtiles://";

/**
 * Returns `true` when the URL uses the `pmtiles://` protocol.
 */
export function isPMTilesUrl(url: string): boolean {
  return url.startsWith(PMTILES_PROTOCOL);
}

/**
 * Strips the `pmtiles://` prefix, returning the underlying URL.
 */
export function stripPMTilesProtocol(url: string): string {
  return url.slice(PMTILES_PROTOCOL.length);
}
