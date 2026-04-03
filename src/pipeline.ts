import { detect } from "./detect/index.ts";
import { emit } from "./emitters/index.ts";
import { parse } from "./parsers/index.ts";
import { applyTransforms } from "./transforms/index.ts";
import type { Dialect, DialectOutput } from "./types/dialect.ts";
import type { TransformContext, TranspileOptions, TranspileResult } from "./types/options.ts";
import { validate } from "./validate/index.ts";

/**
 * Transpile a map style from one dialect to another.
 *
 * This is the main entry point for the library. It wires together
 * detect -> parse -> transform -> validate -> emit.
 */
export function transpile<D extends Dialect>(
  input: unknown,
  options: TranspileOptions & { toDialect: NoInfer<D> },
): TranspileResult<DialectOutput<D>> {
  // Parse string input
  let raw: unknown = input;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      throw new Error("Transpile failed: input is not valid JSON");
    }
  }

  if (typeof raw !== "object" || raw === null) {
    throw new Error("Transpile failed: input must be a non-null object or JSON string");
  }

  // Detect source dialect
  const sourceDialect: Dialect = options.fromDialect ?? detect(raw);

  // Build transform context
  const ctx: TransformContext = {
    sourceDialect,
    targetDialect: options.toDialect,
    baseUrl: options.baseUrl,
    esriToken: options.token,
    mapboxAccessToken: options.mapboxAccessToken,
    fontMapping: options.fontMapping,
    plugins: options.plugins ?? [],
    warnings: [],
    options,
  };

  // Parse -> IR
  const ir = parse(raw, sourceDialect, ctx);

  // Transform
  const transformed = applyTransforms(ir, ctx);

  // Validate
  const validation = validate(transformed);
  if (validation.errors.length > 0) {
    for (const error of validation.errors) {
      ctx.warnings.push({
        code: "VALIDATION_ERROR",
        message: error,
        path: "",
        severity: "warn",
        sourceDialect: ctx.sourceDialect,
        targetDialect: ctx.targetDialect,
      });
    }
  }

  // Emit
  const output = emit(transformed, options.toDialect, ctx) as DialectOutput<D>;

  return {
    output,
    warnings: ctx.warnings,
    ir: transformed,
  };
}
