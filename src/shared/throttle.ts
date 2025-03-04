export function throttle<A extends unknown[], R>(
  ms: number,
  f: (...args: A) => Promise<Awaited<R>>,
) {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  function throttled(...args: A) {
    return new Promise<R>((resolve, reject) => {
      if (timeout != null) return;

      timeout = setTimeout(async () => {
        timeout = undefined;
        f(...args).then(resolve, reject);
      }, ms);
    });
  }

  async function throttledNow(...args: A) {
    clearTimeout(timeout);
    timeout = undefined;
    return f(...args);
  }

  throttled.now = throttledNow;

  return throttled;
}
