/**
 * Structural validation for the `sources` block of a map style.
 */
export function validateSources(sources: unknown, errors: string[]): void {
  if (sources === null || sources === undefined) {
    errors.push("sources must be a non-null object");
    return;
  }

  if (typeof sources !== "object" || Array.isArray(sources)) {
    errors.push("sources must be a non-null object (not an array)");
    return;
  }

  const srcRecord = sources as Record<string, unknown>;

  for (const [name, source] of Object.entries(srcRecord)) {
    if (name === "") {
      errors.push("Source name must be a non-empty string");
      continue;
    }

    if (
      source === null ||
      source === undefined ||
      typeof source !== "object" ||
      Array.isArray(source)
    ) {
      errors.push(`Source "${name}" must be an object`);
      continue;
    }

    const src = source as Record<string, unknown>;

    if (typeof src["type"] !== "string") {
      errors.push(`Source "${name}" must have a "type" property that is a string`);
      continue;
    }

    if (src["type"] === "vector") {
      if (src["url"] === undefined && src["tiles"] === undefined) {
        errors.push(`Vector source "${name}" must have either "url" or "tiles" (or both)`);
      }
    }
  }
}
