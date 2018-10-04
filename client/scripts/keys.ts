/**
 * Record<K, V>-aware Object.keys.
 */
export function stringKeys<K extends string>(obj: Record<K, any>): Array<K> {
  return Object.keys(obj) as Array<K>;
}
