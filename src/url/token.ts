// ---------------------------------------------------------------------------
// Token injection / extraction for Esri and Mapbox URLs
// ---------------------------------------------------------------------------

/**
 * Extracts the `token` query parameter from a URL.
 *
 * Returns `null` when the parameter is absent.
 */
export function extractToken(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("token");
  } catch {
    return null;
  }
}

/**
 * Strips the `token` query parameter from a URL, preserving all other params.
 */
export function stripToken(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("token");

    // Rebuild the URL without a trailing `?` when no params remain.
    const search = parsed.searchParams.toString();
    return search
      ? `${parsed.origin}${parsed.pathname}?${search}`
      : `${parsed.origin}${parsed.pathname}`;
  } catch {
    // If parsing fails, return the URL unchanged.
    return url;
  }
}

/**
 * Appends a `token` query parameter to a URL.
 *
 * Returns the URL unchanged when `token` is `null` or `undefined`.
 * Handles URLs that already contain a query string.
 */
export function appendToken(url: string, token: string | null): string {
  if (token == null) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}token=${encodeURIComponent(token)}`;
}

/**
 * Resolves the Esri access token using a priority chain.
 *
 * 1. An explicit token passed via options.
 * 2. A token embedded in the VTS base URL.
 * 3. `null` when no token is available.
 */
export function resolveEsriToken(
  baseUrl: string | undefined,
  optionsToken: string | undefined,
): string | null {
  if (optionsToken != null) return optionsToken;
  if (baseUrl != null) return extractToken(baseUrl);
  return null;
}
