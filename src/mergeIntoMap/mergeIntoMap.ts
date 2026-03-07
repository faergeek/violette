import { deepEqual } from '@tanstack/react-router';

export function mergeIntoMap<K, V>(
  original: Map<K, V>,
  items: V[],
  getKey: (value: V) => K,
): Map<K, V> {
  const changedItems = items.filter(item => {
    const originalItem = original.get(getKey(item));
    if (originalItem == null) return true;

    return !deepEqual(item, originalItem);
  });

  if (changedItems.length === 0) return original;

  return changedItems.reduce(
    (map, newItem) => map.set(getKey(newItem), newItem),
    new Map(Array.from(original.entries())),
  );
}
