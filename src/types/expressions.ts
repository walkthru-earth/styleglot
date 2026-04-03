/** A MapLibre/Mapbox expression (JSON array starting with an operator string). */
export type IRExpression = unknown[];

/**
 * Legacy "stops" function from pre-expression styles.
 * All Esri styles use this format exclusively.
 */
export interface LegacyStopsFunction<T> {
  stops: Array<[number, T]>;
  base?: number;
  type?: "identity" | "exponential" | "interval" | "categorical";
  property?: string;
  default?: T;
}

/** A property value that can be a literal, legacy stops, or an expression. */
export type PropertyValue<T> = T | LegacyStopsFunction<T> | IRExpression;

/** A data-driven property value (same shape, kept as a distinct alias for clarity). */
export type DataDrivenPropertyValue<T> = T | LegacyStopsFunction<T> | IRExpression;
