import type { TransformContext } from "../types/options.ts";
import type { IRStyle } from "../types/style.ts";
import { WARNING_CODES } from "../types/warnings.ts";
import { createWarning, deepClone, isExpression, isSymbolLayer } from "../utils.ts";

/** Known proprietary fonts and their open-source equivalents. */
const DEFAULT_FONT_SUGGESTIONS: Record<string, string> = {
  "Arial Regular": "Open Sans Regular",
  "Arial Bold": "Open Sans Bold",
  "DIN Pro Regular": "Open Sans Regular",
  "DIN Pro Medium": "Open Sans Semibold",
  "DIN Pro Bold": "Open Sans Bold",
};

/** Esri proprietary font prefixes. */
const ESRI_FONTS = ["Arial"];
/** Mapbox proprietary font prefixes. */
const MAPBOX_FONTS = ["DIN Pro"];

/**
 * Apply font stack mapping and warn about proprietary fonts.
 */
export function rewriteFonts(style: IRStyle, ctx: TransformContext): IRStyle {
  const result = deepClone(style);

  if (ctx.fontMapping != null) {
    applyFontMapping(result, ctx.fontMapping);
  } else {
    warnProprietaryFonts(result, ctx);
  }

  return result;
}

/**
 * Replace font names in all symbol layers using the provided mapping.
 */
function applyFontMapping(style: IRStyle, mapping: Record<string, string>): void {
  for (const layer of style.layers) {
    if (!isSymbolLayer(layer)) continue;
    const layout = layer.layout as Record<string, unknown> | undefined;
    if (layout == null) continue;

    const textFont = layout["text-font"];
    if (textFont == null) continue;

    if (Array.isArray(textFont) && isExpression(textFont)) {
      // Expression: walk iteratively with a stack.
      layout["text-font"] = replaceInExpression(textFont, mapping);
    } else if (Array.isArray(textFont) && textFont.every((v) => typeof v === "string")) {
      // Literal string array.
      layout["text-font"] = replaceFontArray(textFont as string[], mapping);
    }
  }
}

/**
 * Replace font names in a literal string array.
 */
function replaceFontArray(fonts: string[], mapping: Record<string, string>): string[] {
  return fonts.map((f) => mapping[f] ?? f);
}

/**
 * Walk an expression tree iteratively (stack-based) and replace font names
 * inside `["literal", [...]]` patterns as well as in plain string arrays
 * used as arguments.
 */
function replaceInExpression(expr: unknown[], mapping: Record<string, string>): unknown[] {
  // Deep clone to avoid mutating input, though the top-level style is
  // already cloned. We clone again for safety in nested expressions.
  const root = structuredClone(expr) as unknown[];
  const stack: unknown[][] = [root];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) break;

    for (let i = 0; i < current.length; i++) {
      const child = current[i];

      if (!Array.isArray(child)) continue;

      // Check for ["literal", [...strings]] pattern.
      if (current[i - 1] === "literal" || (i === 1 && current[0] === "literal")) {
        // This is the array argument to "literal".
        if (child.every((v: unknown) => typeof v === "string")) {
          current[i] = replaceFontArray(child as string[], mapping);
          continue;
        }
      }

      // If this child itself is an expression array, push to stack.
      if (typeof child[0] === "string") {
        stack.push(child as unknown[]);
      }
    }
  }

  return root;
}

/**
 * Warn about known proprietary fonts when no explicit mapping is provided.
 */
function warnProprietaryFonts(style: IRStyle, ctx: TransformContext): void {
  const seenFonts = new Set<string>();

  for (const layer of style.layers) {
    if (!isSymbolLayer(layer)) continue;
    const layout = layer.layout as Record<string, unknown> | undefined;
    if (layout == null) continue;

    const textFont = layout["text-font"];
    if (textFont == null) continue;

    collectFontNames(textFont, seenFonts);
  }

  for (const fontName of seenFonts) {
    const isEsriFont = ESRI_FONTS.some((p) => fontName.startsWith(p));
    const isMapboxFont = MAPBOX_FONTS.some((p) => fontName.startsWith(p));

    if (!isEsriFont && !isMapboxFont) continue;

    // Check if this font is likely unsupported by the target.
    const likelyUnsupported =
      (isEsriFont && ctx.targetDialect !== "esri") ||
      (isMapboxFont && ctx.targetDialect !== "mapbox");

    if (!likelyUnsupported) continue;

    const suggestion = DEFAULT_FONT_SUGGESTIONS[fontName];
    const hint = suggestion != null ? `. Consider mapping to "${suggestion}"` : "";

    ctx.warnings.push(
      createWarning(
        WARNING_CODES.PROPRIETARY_FONT,
        `Proprietary font "${fontName}" may not be available on ${ctx.targetDialect}${hint}`,
        "layers[].layout.text-font",
        "warn",
        ctx.sourceDialect,
        ctx.targetDialect,
      ),
    );
  }
}

/**
 * Collect font names from a text-font value (literal array or expression).
 */
function collectFontNames(value: unknown, out: Set<string>): void {
  if (Array.isArray(value)) {
    if (
      value.every((v: unknown) => typeof v === "string") &&
      typeof value[0] === "string" &&
      !isExpression(value)
    ) {
      // Literal string array (not an expression).
      for (const name of value as string[]) {
        out.add(name);
      }
      return;
    }

    // Expression: walk iteratively.
    const stack: unknown[] = [value];
    while (stack.length > 0) {
      const current = stack.pop();
      if (!Array.isArray(current)) continue;

      // Check for literal string arrays inside expressions.
      if (
        current[0] === "literal" &&
        Array.isArray(current[1]) &&
        (current[1] as unknown[]).every((v: unknown) => typeof v === "string")
      ) {
        for (const name of current[1] as string[]) {
          out.add(name);
        }
        continue;
      }

      for (const child of current) {
        if (Array.isArray(child)) {
          stack.push(child);
        }
      }
    }
  }
}
