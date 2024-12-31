export function throttle<A extends unknown[]>(
  ms: number,
  f: (...args: A) => void,
) {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  function throttled(...args: A) {
    if (timeout != null) return;

    timeout = setTimeout(async () => {
      timeout = undefined;
      f(...args);
    }, ms);
  }

  throttled.now = (...args: A) => {
    clearTimeout(timeout);
    timeout = undefined;
    f(...args);
  };

  return throttled;
}
