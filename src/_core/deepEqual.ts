function hasOwnProperty(obj: unknown, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return Object.prototype.toString.call(x) === '[object Object]';
}

export function deepEqual<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) return true;

  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }

    return true;
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    for (const key of Object.keys(a)) {
      if (!hasOwnProperty(b, key) || !deepEqual(a[key], b[key])) return false;
    }

    return true;
  }

  return false;
}
