import type { LegacyStopsFunction } from "../types/expressions.ts";
import type { TransformContext } from "../types/options.ts";
import type { IRStyle } from "../types/style.ts";
import { WARNING_CODES } from "../types/warnings.ts";
import { createWarning, deepClone, isExpression, isLegacyStops } from "../utils.ts";

/** Mapbox-only expression operators. */
const MAPBOX_ONLY_OPERATORS = new Set([
  "config",
  "measure-light",
  "worldview",
  "is-active-floor",
  "random",
  "hsl",
  "hsla",
  "distance-from-center",
]);

/** MapLibre-only expression operators. */
const MAPLIBRE_ONLY_OPERATORS = new Set(["global-state", "elevation", "split", "join"]);

/** Operators unsupported by Esri (supported by both Mapbox and MapLibre). */
const ESRI_UNSUPPORTED_OPERATORS = new Set([
  "within",
  "distance",
  "accumulated",
  "line-progress",
  "is-supported-script",
]);

/**
 * Convert or strip dialect-specific expressions and optionally modernize
 * legacy stops functions.
 */
export function convertExpressions(style: IRStyle, ctx: TransformContext): IRStyle {
  const result = deepClone(style);
  const modernize = ctx.options.modernizeExpressions === true;

  for (const layer of result.layers) {
    const sections = ["paint", "layout"] as const;
    for (const section of sections) {
      const props = layer[section] as Record<string, unknown> | undefined;
      if (props == null) continue;

      for (const key of Object.keys(props)) {
        const value = props[key];

        // Modernize legacy stops if requested.
        if (modernize && isLegacyStops(value)) {
          props[key] = convertLegacyStops(value);
          continue;
        }

        // Strip unsupported expression operators.
        if (isExpression(value)) {
          props[key] = sanitizeExpression(value as unknown[], layer.id, `${section}.${key}`, ctx);
        }
      }
    }
  }

  return result;
}

/**
 * Walk an expression tree iteratively and replace unsupported operators with null.
 */
function sanitizeExpression(
  expr: unknown[],
  layerId: string,
  path: string,
  ctx: TransformContext,
): unknown {
  // Check root operator.
  const rootOp = expr[0] as string;
  if (shouldStripOperator(rootOp, ctx)) {
    ctx.warnings.push(
      createWarning(
        WARNING_CODES.UNSUPPORTED_EXPRESSION,
        `Expression operator "${rootOp}" is not supported by ${ctx.targetDialect}`,
        `layers[${layerId}].${path}`,
        "warn",
        ctx.sourceDialect,
        ctx.targetDialect,
      ),
    );
    return null;
  }

  // Walk children iteratively.
  const stack: Array<{ parent: unknown[]; index: number }> = [];

  // Seed the stack with all array children of root.
  for (let i = 1; i < expr.length; i++) {
    if (Array.isArray(expr[i]) && isExpression(expr[i] as unknown[])) {
      stack.push({ parent: expr, index: i });
    }
  }

  while (stack.length > 0) {
    const entry = stack.pop();
    if (!entry) break;
    const { parent, index } = entry;
    const child = parent[index] as unknown[];
    const op = child[0] as string;

    if (shouldStripOperator(op, ctx)) {
      parent[index] = null;
      ctx.warnings.push(
        createWarning(
          WARNING_CODES.UNSUPPORTED_EXPRESSION,
          `Expression operator "${op}" is not supported by ${ctx.targetDialect}`,
          `layers[${layerId}].${path}`,
          "warn",
          ctx.sourceDialect,
          ctx.targetDialect,
        ),
      );
      continue;
    }

    for (let i = 1; i < child.length; i++) {
      if (Array.isArray(child[i]) && isExpression(child[i] as unknown[])) {
        stack.push({ parent: child, index: i });
      }
    }
  }

  return expr;
}

/**
 * Returns true if the operator should be stripped for the current target.
 */
function shouldStripOperator(op: string, ctx: TransformContext): boolean {
  if (ctx.targetDialect !== "mapbox" && MAPBOX_ONLY_OPERATORS.has(op)) {
    return true;
  }
  if (ctx.targetDialect !== "maplibre" && MAPLIBRE_ONLY_OPERATORS.has(op)) {
    return true;
  }
  if (ctx.targetDialect === "esri" && ESRI_UNSUPPORTED_OPERATORS.has(op)) {
    return true;
  }
  return false;
}

/**
 * Convert a legacy stops-based function to a modern expression.
 */
function convertLegacyStops(legacy: LegacyStopsFunction<unknown>): unknown[] {
  const { stops, base, type, property } = legacy;

  if (stops == null || stops.length === 0) {
    return ["literal", null];
  }

  // Categorical or property-based.
  if (type === "categorical" || property != null) {
    return convertCategorical(legacy);
  }

  // Interval (step).
  if (type === "interval") {
    return convertInterval(stops);
  }

  // Default: exponential interpolation on zoom.
  const interpolator: unknown[] = ["exponential", base ?? 1];
  const result: unknown[] = ["interpolate", interpolator, ["zoom"]];
  for (const [input, output] of stops) {
    result.push(input, output);
  }
  return result;
}

/**
 * Convert a categorical or property-based legacy function to a match expression.
 */
function convertCategorical(legacy: LegacyStopsFunction<unknown>): unknown[] {
  const { stops, property, default: defaultValue } = legacy;
  const getter: unknown[] = ["get", property ?? ""];
  const result: unknown[] = ["match", getter];

  for (const [input, output] of stops) {
    result.push(input, output);
  }

  // Fallback value.
  result.push(defaultValue ?? null);
  return result;
}

/**
 * Convert an interval legacy function to a step expression.
 */
function convertInterval(stops: Array<[number, unknown]>): unknown[] {
  // Step expects: ["step", input, defaultOutput, stop1, output1, ...]
  // The first stop's output becomes the default.
  const result: unknown[] = ["step", ["zoom"]];
  if (stops.length > 0) {
    result.push(stops[0][1]); // default output
    for (let i = 1; i < stops.length; i++) {
      result.push(stops[i][0], stops[i][1]);
    }
  } else {
    result.push(null);
  }
  return result;
}
