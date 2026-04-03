import type { TransformContext } from "./options.ts";
import type { IRStyle } from "./style.ts";

export interface Plugin {
  name: string;

  /** Runs before the built-in transform pipeline. */
  beforeTransform?: (style: IRStyle, ctx: TransformContext) => IRStyle;

  /** Runs after the built-in transform pipeline. */
  afterTransform?: (style: IRStyle, ctx: TransformContext) => IRStyle;

  /**
   * Called when a feature is about to be dropped as lossy.
   * Return a substitute value to keep it, or undefined to drop.
   */
  onLossyFeature?: (path: string, value: unknown, ctx: TransformContext) => unknown | undefined;
}
