/**
 * Structural validation for the `glyphs` property of a map style.
 */
export function validateGlyphs(glyphs: unknown, errors: string[]): void {
  if (glyphs === undefined) {
    return;
  }

  if (typeof glyphs !== "string") {
    errors.push("glyphs must be a string");
    return;
  }

  if (!glyphs.includes("{fontstack}")) {
    errors.push('glyphs URL must contain "{fontstack}" placeholder');
  }

  if (!glyphs.includes("{range}")) {
    errors.push('glyphs URL must contain "{range}" placeholder');
  }
}
