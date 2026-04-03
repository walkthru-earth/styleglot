/**
 * MapLibre dialect scorer.
 *
 * Heuristic signals that indicate a style targets MapLibre GL JS.
 */

export function scoreMaplibre(style: Record<string, unknown>): number {
  let score = 0;

  // --- Sprite is an array (multi-sprite support) ---
  if (Array.isArray(style.sprite)) {
    score += 5;
  }

  // --- MapLibre-specific top-level properties ---
  if (style.state !== undefined) score += 5;
  if ((style as Record<string, unknown>)["font-faces"] !== undefined) score += 5;
  if (style.centerAltitude !== undefined) score += 5;
  if (style.roll !== undefined) score += 5;

  // --- Layer type: color-relief ---
  const layers = style.layers;
  if (Array.isArray(layers)) {
    for (const layer of layers as Array<Record<string, unknown>>) {
      if (typeof layer === "object" && layer !== null && layer.type === "color-relief") {
        score += 5;
        break;
      }
    }
  }

  // --- Source with encoding: "mlt" ---
  const sources = style.sources;
  if (typeof sources === "object" && sources !== null) {
    for (const src of Object.values(sources as Record<string, unknown>)) {
      if (typeof src === "object" && src !== null) {
        if ((src as Record<string, unknown>).encoding === "mlt") {
          score += 5;
          break;
        }
      }
    }
  }

  // --- Expression uses "global-state" ---
  if (Array.isArray(layers)) {
    let found = false;
    for (const layer of layers as Array<Record<string, unknown>>) {
      if (found) break;
      if (typeof layer !== "object" || layer === null) continue;
      // Check paint and layout for global-state expressions
      for (const prop of ["paint", "layout"] as const) {
        if (found) break;
        const block = layer[prop];
        if (typeof block === "object" && block !== null) {
          for (const val of Object.values(block as Record<string, unknown>)) {
            if (containsGlobalState(val)) {
              found = true;
              break;
            }
          }
        }
      }
    }
    if (found) score += 3;
  }

  return score;
}

/** Recursively check if a value contains the string "global-state". */
function containsGlobalState(value: unknown): boolean {
  if (value === "global-state") return true;
  if (Array.isArray(value)) return value.some(containsGlobalState);
  return false;
}
