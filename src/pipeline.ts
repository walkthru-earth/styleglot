import { detect } from "./detect/index.ts";
import { emit } from "./emitters/index.ts";
import { parse } from "./parsers/index.ts";
import { resolveTileJsonSources } from "./resolve-sources.ts";
import { applyTransforms } from "./transforms/index.ts";
import type { Dialect, DialectOutput } from "./types/dialect.ts";
import type { TransformContext, TranspileOptions, TranspileResult } from "./types/options.ts";
import type { IRStyle } from "./types/style.ts";
import { validate } from "./validate/index.ts";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function parseInput(input: unknown): object {
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

  return raw;
}

function buildContext(sourceDialect: Dialect, options: TranspileOptions): TransformContext {
  return {
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
}

function transformValidateEmit<D extends Dialect>(
  ir: IRStyle,
  options: TranspileOptions & { toDialect: NoInfer<D> },
  ctx: TransformContext,
): TranspileResult<DialectOutput<D>> {
  const transformed = applyTransforms(ir, ctx);

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

  const output = emit(transformed, options.toDialect, ctx) as DialectOutput<D>;

  return {
    output,
    warnings: ctx.warnings,
    ir: transformed,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

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
  const raw = parseInput(input);
  const sourceDialect: Dialect = options.fromDialect ?? detect(raw);
  const ctx = buildContext(sourceDialect, options);
  const ir = parse(raw, sourceDialect, ctx);
  return transformValidateEmit(ir, options, ctx);
}

const defaultFetch: (url: string) => Promise<unknown> = async (url: string) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
};

/**
 * Async version of transpile that resolves TileJSON source URLs before
 * transpiling. This allows non-Esri styles (Stadia, OpenFreeMap, etc.) to
 * produce Esri output with real tile URLs instead of placeholder values.
 *
 * Uses `options.fetch` if provided, otherwise falls back to the global `fetch`.
 */
export async function transpileAsync<D extends Dialect>(
  input: unknown,
  options: TranspileOptions & { toDialect: NoInfer<D> },
): Promise<TranspileResult<DialectOutput<D>>> {
  const raw = parseInput(input);
  const sourceDialect: Dialect = options.fromDialect ?? detect(raw);
  const ctx = buildContext(sourceDialect, options);
  const ir = parse(raw, sourceDialect, ctx);

  let finalIr = ir;
  if (options.resolveSources) {
    const fetchFn = options.fetch ?? defaultFetch;
    finalIr = await resolveTileJsonSources(ir, fetchFn);
  }

  return transformValidateEmit(finalIr, options, ctx);
}
