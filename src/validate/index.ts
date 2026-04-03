import { validateGlyphs } from "./glyphs.ts";
import { validateLayers } from "./layers.ts";
import { validateSources } from "./sources.ts";
import { validateSprite } from "./sprites.ts";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validate(style: unknown): ValidationResult {
  const errors: string[] = [];

  if (style === null || style === undefined || typeof style !== "object" || Array.isArray(style)) {
    errors.push("Style must be a non-null object");
    return { valid: false, errors };
  }

  const s = style as Record<string, unknown>;

  if (s["version"] !== 8) {
    errors.push('Style "version" must be 8');
  }

  const sources =
    s["sources"] !== null &&
    s["sources"] !== undefined &&
    typeof s["sources"] === "object" &&
    !Array.isArray(s["sources"])
      ? (s["sources"] as Record<string, unknown>)
      : {};

  validateSources(s["sources"], errors);
  validateLayers(s["layers"], sources, errors);
  validateSprite(s["sprite"], errors);
  validateGlyphs(s["glyphs"], errors);

  return { valid: errors.length === 0, errors };
}
