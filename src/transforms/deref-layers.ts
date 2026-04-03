import type { TransformContext } from "../types/options.ts";
import type { IRStyle } from "../types/style.ts";
import { createWarning, deepClone } from "../utils.ts";

/**
 * Resolve layer `ref` inheritance.
 *
 * Some older styles use `"ref": "other-layer-id"` to inherit type, source,
 * source-layer, minzoom, maxzoom, filter, and layout from another layer.
 */
export function derefLayers(style: IRStyle, ctx: TransformContext): IRStyle {
  const result = deepClone(style);

  const layerMap = new Map<string, Record<string, unknown>>();
  for (const layer of result.layers) {
    layerMap.set(layer.id, layer as unknown as Record<string, unknown>);
  }

  const inheritedKeys = [
    "type",
    "source",
    "source-layer",
    "minzoom",
    "maxzoom",
    "filter",
    "layout",
  ] as const;

  for (const layer of result.layers) {
    const record = layer as unknown as Record<string, unknown>;
    const ref = record.ref;
    if (typeof ref !== "string") continue;

    // Detect cycles by walking the ref chain.
    const visited = new Set<string>();
    visited.add(layer.id);

    let currentRef: string | undefined = ref;
    let target: Record<string, unknown> | undefined;
    let hasCycle = false;

    while (currentRef != null) {
      if (visited.has(currentRef)) {
        hasCycle = true;
        break;
      }
      visited.add(currentRef);
      target = layerMap.get(currentRef);
      if (target == null) break;
      currentRef = target.ref as string | undefined;
    }

    if (hasCycle) {
      ctx.warnings.push(
        createWarning(
          "REF_CYCLE",
          `Layer "${layer.id}" has a circular ref chain`,
          `layers[${layer.id}].ref`,
          "warn",
          ctx.sourceDialect,
          ctx.targetDialect,
        ),
      );
      continue;
    }

    if (target == null) continue;

    for (const key of inheritedKeys) {
      if (target[key] !== undefined && record[key] === undefined) {
        record[key] = deepClone(target[key]);
      }
    }

    delete record.ref;
  }

  return result;
}
