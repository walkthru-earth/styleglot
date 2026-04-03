/**
 * Structural validation for the `sprite` property of a map style.
 */
export function validateSprite(sprite: unknown, errors: string[]): void {
  if (sprite === undefined) {
    return;
  }

  if (typeof sprite === "string") {
    return;
  }

  if (Array.isArray(sprite)) {
    for (let i = 0; i < sprite.length; i++) {
      const entry = sprite[i];

      if (
        entry === null ||
        entry === undefined ||
        typeof entry !== "object" ||
        Array.isArray(entry)
      ) {
        errors.push(`sprite[${i}] must be an object with "id" and "url"`);
        continue;
      }

      const obj = entry as Record<string, unknown>;

      if (typeof obj.id !== "string") {
        errors.push(`sprite[${i}] must have an "id" property that is a string`);
      }

      if (typeof obj.url !== "string") {
        errors.push(`sprite[${i}] must have a "url" property that is a string`);
      }
    }
    return;
  }

  errors.push("sprite must be either a string or an array");
}
