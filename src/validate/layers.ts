/**
 * Structural validation for the `layers` block of a map style.
 */
export function validateLayers(
  layers: unknown,
  sources: Record<string, unknown>,
  errors: string[],
): void {
  if (!Array.isArray(layers)) {
    errors.push("layers must be an array");
    return;
  }

  const seenIds = new Set<string>();

  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];

    if (
      layer === null ||
      layer === undefined ||
      typeof layer !== "object" ||
      Array.isArray(layer)
    ) {
      errors.push(`layers[${i}] must be an object`);
      continue;
    }

    const lyr = layer as Record<string, unknown>;

    if (typeof lyr["id"] !== "string") {
      errors.push(`layers[${i}] must have an "id" property that is a string`);
    }

    if (typeof lyr["type"] !== "string") {
      errors.push(`layers[${i}] must have a "type" property that is a string`);
    }

    const id = typeof lyr["id"] === "string" ? lyr["id"] : `(index ${i})`;

    if (typeof lyr["id"] === "string") {
      if (seenIds.has(lyr["id"])) {
        errors.push(`Duplicate layer id "${lyr["id"]}"`);
      }
      seenIds.add(lyr["id"]);
    }

    // For non-background layers, validate source references
    if (lyr["type"] !== "background" && typeof lyr["source"] === "string") {
      const sourceName = lyr["source"];

      if (!(sourceName in sources)) {
        errors.push(`Layer "${id}" references source "${sourceName}" which does not exist`);
      } else {
        // Check if the source is a vector type and warn about missing source-layer
        const src = sources[sourceName];
        if (
          src !== null &&
          src !== undefined &&
          typeof src === "object" &&
          !Array.isArray(src) &&
          (src as Record<string, unknown>)["type"] === "vector" &&
          lyr["source-layer"] === undefined
        ) {
          errors.push(
            `Layer "${id}" uses vector source "${sourceName}" but is missing "source-layer" (warning)`,
          );
        }
      }
    }
  }
}
