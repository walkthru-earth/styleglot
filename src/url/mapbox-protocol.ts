// ---------------------------------------------------------------------------
// Mapbox protocol URL expansion (mapbox:// -> https://)
// ---------------------------------------------------------------------------

const MAPBOX_PROTOCOL = "mapbox://";
const MAPBOX_API = "https://api.mapbox.com";

/**
 * Returns `true` when the URL uses the `mapbox://` protocol.
 */
export function isMapboxUrl(url: string): boolean {
  return url.startsWith(MAPBOX_PROTOCOL);
}

/**
 * Expands a `mapbox://` source URL to an HTTPS API endpoint.
 *
 * Input:  `mapbox://mapbox.mapbox-streets-v8`
 * Output: `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8.json?secure&access_token=xxx`
 *
 * Composite sources (`mapbox://a,b`) are also handled.
 */
export function expandMapboxSourceUrl(url: string, accessToken: string): string {
  const tilesetIds = url.slice(MAPBOX_PROTOCOL.length);
  return `${MAPBOX_API}/v4/${tilesetIds}.json?secure&access_token=${accessToken}`;
}

/**
 * Expands a `mapbox://` sprite URL to an HTTPS API endpoint.
 *
 * Input:  `mapbox://sprites/mapbox/streets-v12`
 * Output: `https://api.mapbox.com/styles/v1/mapbox/streets-v12/sprite?access_token=xxx`
 */
export function expandMapboxSpriteUrl(url: string, accessToken: string): string {
  // mapbox://sprites/{owner}/{style}
  const path = url.slice(`${MAPBOX_PROTOCOL}sprites/`.length);
  const slashIdx = path.indexOf("/");
  const owner = path.slice(0, slashIdx);
  const style = path.slice(slashIdx + 1);
  return `${MAPBOX_API}/styles/v1/${owner}/${style}/sprite?access_token=${accessToken}`;
}

/**
 * Expands a `mapbox://` glyph URL to an HTTPS API endpoint.
 *
 * Input:  `mapbox://fonts/mapbox/{fontstack}/{range}.pbf`
 * Output: `https://api.mapbox.com/fonts/v1/mapbox/{fontstack}/{range}.pbf?access_token=xxx`
 *
 * The `{fontstack}` and `{range}` template tokens are preserved.
 */
export function expandMapboxGlyphUrl(url: string, accessToken: string): string {
  // mapbox://fonts/{owner}/{fontstack}/{range}.pbf
  const path = url.slice(`${MAPBOX_PROTOCOL}fonts/`.length);
  return `${MAPBOX_API}/fonts/v1/${path}?access_token=${accessToken}`;
}
