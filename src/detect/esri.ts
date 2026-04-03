/**
 * Esri dialect scorer.
 *
 * Heuristic signals that indicate a style was authored for or exported from
 * the Esri Vector Tile Style Editor.
 */

export function scoreEsri(style: Record<string, unknown>): number {
  let score = 0;

  // --- Sources ---
  const sources = style.sources;
  if (typeof sources === "object" && sources !== null) {
    const entries = Object.entries(sources as Record<string, unknown>);
    for (const [name, src] of entries) {
      if (typeof src === "object" && src !== null) {
        const url = (src as Record<string, unknown>).url;
        if (typeof url === "string" && (url.includes("/VectorTileServer") || url === "../../")) {
          score += 10;
        }
      }
      // Source named exactly "esri"
      if (name === "esri") {
        score += 3;
      }
    }
  }

  // --- Sprite ---
  if (typeof style.sprite === "string" && style.sprite.startsWith("../")) {
    score += 5;
  }

  // --- Glyphs ---
  if (typeof style.glyphs === "string" && style.glyphs.startsWith("../")) {
    score += 5;
  }

  // --- Layers (check first 20 to avoid perf issues) ---
  const layers = style.layers;
  if (Array.isArray(layers)) {
    const subset = layers.slice(0, 20) as Array<Record<string, unknown>>;

    let hasSlashId = false;
    let hasSymbolFilter = false;
    let hasNameField = false;

    for (const layer of subset) {
      if (typeof layer !== "object" || layer === null) continue;

      // Layer IDs containing "/"
      if (!hasSlashId && typeof layer.id === "string" && layer.id.includes("/")) {
        hasSlashId = true;
      }

      // Layers use `_symbol` in filter
      if (!hasSymbolFilter && containsString(layer.filter, "_symbol")) {
        hasSymbolFilter = true;
      }

      // Text fields reference `{_name}`
      if (!hasNameField) {
        const layout = layer.layout;
        if (typeof layout === "object" && layout !== null) {
          const textField = (layout as Record<string, unknown>)["text-field"];
          if (containsString(textField, "{_name}")) {
            hasNameField = true;
          }
        }
      }
    }

    if (hasSlashId) score += 2;
    if (hasSymbolFilter) score += 2;
    if (hasNameField) score += 2;
  }

  return score;
}

/** Recursively check if a value (string, array, or nested structure) contains a target string. */
function containsString(value: unknown, target: string): boolean {
  if (typeof value === "string") return value.includes(target);
  if (Array.isArray(value)) return value.some((v) => containsString(v, target));
  return false;
}
