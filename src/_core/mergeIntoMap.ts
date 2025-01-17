import { deepEqual } from './deepEqual';

export function mergeIntoMap<T>(
  original: Map<string, T>,
  items: T[],
  getKey: (x: T) => string,
) {
  const changedItems = items.filter(
    item => !deepEqual(item, original.get(getKey(item))),
  );

  return changedItems.length === 0
    ? original
    : changedItems.reduce(
        (map, newItem) => map.set(getKey(newItem), newItem),
        new Map(original),
      );
}
