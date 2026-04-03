// ---------------------------------------------------------------------------
// URL resolution utilities for Esri Vector Tile Server styles
// ---------------------------------------------------------------------------

/**
 * Resolves a relative URL against a base URL.
 *
 * Uses the built-in `URL` constructor so that `../`, `../../`, query params,
 * and trailing slashes are all handled correctly.
 */
export function resolveRelativeUrl(base: string, relative: string): string {
  return new URL(relative, base).href;
}

/**
 * Returns the style directory URL for an Esri Vector Tile Server.
 *
 * The root.json file lives at `{vtsUrl}/resources/styles/root.json`, so the
 * "style base" is `{vtsUrl}/resources/styles/`.
 */
export function getStyleBaseUrl(vectorTileServerUrl: string): string {
  const base = vectorTileServerUrl.replace(/\/+$/, "");
  return `${base}/resources/styles/`;
}

/**
 * Returns the resource directory URL for an Esri Vector Tile Server.
 *
 * Sprite sheets, fonts, and other assets live under `{vtsUrl}/resources/`.
 */
export function getResourceBaseUrl(vectorTileServerUrl: string): string {
  const base = vectorTileServerUrl.replace(/\/+$/, "");
  return `${base}/resources/`;
}

/**
 * Resolves an Esri sprite relative path against the VTS base URL.
 *
 * Inside root.json the sprite value is typically `../sprites/sprite`.
 * Because root.json lives at `{baseUrl}/resources/styles/root.json`,
 * `../sprites/sprite` resolves to `{baseUrl}/resources/sprites/sprite`.
 */
export function resolveEsriSpriteUrl(baseUrl: string, sprite: string): string {
  const styleBase = getStyleBaseUrl(baseUrl);
  return resolveRelativeUrl(styleBase, sprite);
}

/**
 * Resolves an Esri glyphs template path against the VTS base URL.
 *
 * The glyphs value in root.json is typically
 * `../fonts/{fontstack}/{range}.pbf`. The `{fontstack}` and `{range}` tokens
 * are preserved as-is for later substitution.
 */
export function resolveEsriGlyphUrl(baseUrl: string, glyphs: string): string {
  const styleBase = getStyleBaseUrl(baseUrl);
  // new URL() encodes { and } to %7B and %7D. Restore them since
  // {fontstack} and {range} are template tokens, not literal braces.
  return resolveRelativeUrl(styleBase, glyphs).replaceAll("%7B", "{").replaceAll("%7D", "}");
}

/**
 * Returns the Esri tile URL template for a Vector Tile Server.
 *
 * Esri uses z/y/x order (row before column).
 */
export function resolveEsriSourceUrl(baseUrl: string): string {
  const base = baseUrl.replace(/\/+$/, "");
  return `${base}/tile/{z}/{y}/{x}.pbf`;
}
