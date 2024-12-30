import type { Result } from '@faergeek/monads';
import fc from 'fast-check';
import { expect, expectTypeOf, test, vi } from 'vitest';

import { Fx } from './fx';

test('Fx.Ok', () => {
  expectTypeOf(Fx.Ok()).toEqualTypeOf<Fx<void>>();
  expectTypeOf(Fx.Ok(42)).toEqualTypeOf<Fx<number>>();
  expectTypeOf(Fx.Ok('foo')).toEqualTypeOf<Fx<string>>();

  expectTypeOf(Fx.Ok(4242).run).toEqualTypeOf<
    (env: unknown) => Result<number, never>
  >();

  expectTypeOf(Fx.Ok('bar').run).toEqualTypeOf<
    (env: unknown) => Result<string, never>
  >();

  fc.assert(
    fc.property(fc.anything(), input => {
      const result = Fx.Ok(input).run(null);

      result.match({
        Err: () => expect.unreachable(),
        Ok: value => expect(value).toBe(input),
      });
    }),
  );
});

test('Fx.Err', async () => {
  expectTypeOf(Fx.Err(42)).toEqualTypeOf<Fx<never, 42>>();
  expectTypeOf(Fx.Err('foo')).toEqualTypeOf<Fx<never, 'foo'>>();

  expectTypeOf(Fx.Err(4242).run).toEqualTypeOf<
    (env: unknown) => Result<never, 4242>
  >();

  expectTypeOf(Fx.Err('bar').run).toEqualTypeOf<
    (env: unknown) => Result<never, 'bar'>
  >();

  expect(() => {
    for (const _ of Fx.Err('foo'));
  }).toThrow('foo');

  await expect(async () => {
    for await (const _ of Fx.Err('foo'));
  }).rejects.toBe('foo');

  fc.assert(
    fc.property(fc.anything(), input => {
      const result = Fx.Err(input).run(null);

      result.match({
        Err: err => expect(err).toBe(input),
        Ok: () => expect.unreachable(),
      });
    }),
  );
});

test('Fx.Sync', async () => {
  expectTypeOf(Fx.Sync((n: number) => Fx.Ok(n))).toEqualTypeOf<
    Fx<number, never, number>
  >();

  expectTypeOf(Fx.Sync((s: string) => Fx.Err(s))).toEqualTypeOf<
    Fx<never, string, string>
  >();

  expectTypeOf(Fx.Sync((n: number) => Fx.Ok(n)).run).toEqualTypeOf<
    (env: number) => Result<number, never>
  >();

  expectTypeOf(Fx.Sync((s: string) => Fx.Err(s)).run).toEqualTypeOf<
    (env: string) => Result<never, string>
  >();

  fc.assert(
    fc.property(fc.anything(), input => {
      const result = Fx.Sync(n => Fx.Ok(n)).run(input);

      result.match({
        Err: () => expect.unreachable(),
        Ok: value => expect(value).toBe(input),
      });
    }),
  );

  fc.assert(
    fc.property(fc.anything(), input => {
      const result = Fx.Sync(n => Fx.Err(n)).run(input);

      result.match({
        Err: err => expect(err).toBe(input),
        Ok: () => expect.unreachable(),
      });
    }),
  );

  await fc.assert(
    fc.asyncProperty(fc.anything(), async input => {
      const result = await Fx.Sync(n => Fx.Err(n)).runAsync(input);

      result.match({
        Err: err => expect(err).toBe(input),
        Ok: () => expect.unreachable(),
      });
    }),
  );
});

test('Fx.Async', async () => {
  expectTypeOf(
    Fx.Async((n: number) => Promise.resolve(Fx.Ok(n))),
  ).toEqualTypeOf<Fx<number, never, number>>();

  expectTypeOf(
    Fx.Async((s: string) => Promise.resolve(Fx.Err(s))),
  ).toEqualTypeOf<Fx<never, string, string>>();

  expectTypeOf(
    Fx.Async((n: number) => Promise.resolve(Fx.Ok(n))).run,
  ).toEqualTypeOf<(env: number) => Result<number, never>>();

  expectTypeOf(
    Fx.Async((s: string) => Promise.resolve(Fx.Err(s))).run,
  ).toEqualTypeOf<(env: string) => Result<never, string>>();

  expectTypeOf(
    Fx.Async((n: number) => Promise.resolve(Fx.Ok(n))).runAsync,
  ).toEqualTypeOf<(env: number) => Promise<Result<number, never>>>();

  expectTypeOf(
    Fx.Async((s: string) => Promise.resolve(Fx.Err(s))).runAsync,
  ).toEqualTypeOf<(env: string) => Promise<Result<never, string>>>();

  expect(() => {
    Fx.Async(n => Promise.resolve(Fx.Ok(n))).run(null);
  }).toThrowError('Cannot run async fx synchronously');

  expect(() => {
    for (const _ of Fx.Async(n => Promise.resolve(Fx.Ok(n))));
  }).toThrowError('Cannot use async fx as a sync iterator');

  await fc.assert(
    fc.asyncProperty(fc.anything(), async input => {
      const result = await Fx.Async(n => Promise.resolve(Fx.Ok(n))).runAsync(
        input,
      );

      result.match({
        Err: () => expect.unreachable(),
        Ok: value => expect(value).toBe(input),
      });
    }),
  );

  await fc.assert(
    fc.asyncProperty(fc.anything(), async input => {
      const result = await Fx.Async(n => Promise.resolve(Fx.Err(n))).runAsync(
        input,
      );

      result.match({
        Err: err => expect(err).toBe(input),
        Ok: () => expect.unreachable(),
      });
    }),
  );
});

test('Fx#flatMap', async () => {
  const fx: Fx<number, 'foo'> = Math.random() > 0.5 ? Fx.Ok(42) : Fx.Err('foo');

  expectTypeOf(fx.flatMap(n => Fx.Ok(String(n)))).toEqualTypeOf<
    Fx<string, 'foo'>
  >();

  expectTypeOf(
    fx.flatMap(n => (Math.random() > 0.75 ? Fx.Ok(n > 5) : Fx.Err('bar'))),
  ).toEqualTypeOf<Fx<boolean, 'foo' | 'bar'>>();

  fc.assert(
    fc.property(fc.double(), input => {
      const result = Fx.Sync(() => Fx.Ok(input))
        .flatMap(n => Fx.Ok(String(n)))
        .run(null);

      result.match({
        Err: () => expect.unreachable(),
        Ok: value => expect(value).toBe(String(input)),
      });
    }),
  );

  fc.assert(
    fc.property(fc.string(), input => {
      const f = vi.fn();

      const result = Fx.Sync(() => Fx.Err(input))
        .flatMap(f)
        .run(null);

      result.match({
        Err: err => expect(err).toBe(input),
        Ok: () => expect.unreachable(),
      });

      expect(f).not.toBeCalled();
    }),
  );

  await fc.assert(
    fc.asyncProperty(fc.double(), async input => {
      const result = await Fx.Async(() => Promise.resolve(Fx.Ok(input)))
        .flatMap(n => Fx.Ok(String(n)))
        .runAsync(null);

      result.match({
        Err: () => expect.unreachable(),
        Ok: value => expect(value).toBe(String(input)),
      });
    }),
  );

  await fc.assert(
    fc.asyncProperty(fc.string(), async input => {
      const f = vi.fn();

      const result = await Fx.Async(() => Promise.resolve(Fx.Err(input)))
        .flatMap(f)
        .runAsync(null);

      result.match({
        Err: err => expect(err).toBe(input),
        Ok: () => expect.unreachable(),
      });

      expect(f).not.toBeCalled();
    }),
  );
});

test('Fx#catch', async () => {
  const fx: Fx<number, 'foo'> = Math.random() > 0.5 ? Fx.Ok(42) : Fx.Err('foo');

  expectTypeOf(fx.catch(err => Fx.Ok(err))).toEqualTypeOf<Fx<number | 'foo'>>();

  expectTypeOf(
    fx.catch(err =>
      Math.random() > 0.75 ? Fx.Ok(err === 'foo') : Fx.Err('bar'),
    ),
  ).toEqualTypeOf<Fx<boolean | number, 'bar'>>();

  fc.assert(
    fc.property(fc.double(), input => {
      const result = Fx.Sync(() => Fx.Err(input))
        .catch(n => Fx.Ok(String(n)))
        .run(null);

      result.match({
        Err: () => expect.unreachable(),
        Ok: value => expect(value).toBe(String(input)),
      });
    }),
  );

  fc.assert(
    fc.property(fc.string(), input => {
      const f = vi.fn();

      const result = Fx.Sync(() => Fx.Ok(input))
        .catch(f)
        .run(null);

      result.match({
        Err: () => expect.unreachable(),
        Ok: value => expect(value).toBe(input),
      });

      expect(f).not.toBeCalled();
    }),
  );

  await fc.assert(
    fc.asyncProperty(fc.double(), async input => {
      const result = await Fx.Async(() => Promise.resolve(Fx.Err(input)))
        .catch(n => Fx.Ok(String(n)))
        .runAsync(null);

      result.match({
        Err: () => expect.unreachable(),
        Ok: value => expect(value).toBe(String(input)),
      });
    }),
  );

  await fc.assert(
    fc.asyncProperty(fc.string(), async input => {
      const f = vi.fn();

      const result = await Fx.Async(() => Promise.resolve(Fx.Ok(input)))
        .catch(f)
        .runAsync(null);

      result.match({
        Err: () => expect.unreachable(),
        Ok: value => expect(value).toBe(input),
      });

      expect(f).not.toBeCalled();
    }),
  );
});

test('Fx.ask', () => {
  expectTypeOf(Fx.ask<{ numbers: number[] }>()).toEqualTypeOf<
    Fx<{ numbers: number[] }, never, { numbers: number[] }>
  >();

  expectTypeOf(Fx.ask<{ strings: string[] }>()).toEqualTypeOf<
    Fx<{ strings: string[] }, never, { strings: string[] }>
  >();

  expectTypeOf(Fx.ask<{ numbers: number[] }>().run).toEqualTypeOf<
    (env: { numbers: number[] }) => Result<{ numbers: number[] }, never>
  >();

  expectTypeOf(Fx.ask<{ strings: string[] }>().run).toEqualTypeOf<
    (env: { strings: string[] }) => Result<{ strings: string[] }, never>
  >();

  fc.assert(
    fc.property(fc.anything(), thing => {
      const result = Fx.ask().run(thing);

      result.match({
        Err: () => expect.unreachable(),
        Ok: env => expect(env).toBe(thing),
      });
    }),
  );
});

test('Fx.sync', () => {
  const getNumber = Fx.sync(function* f() {
    const { numbers } = yield* Fx.ask<{ numbers: number[] }>();
    const n = numbers.shift();
    expectTypeOf(n).toEqualTypeOf<number | undefined>();

    return n == null ? Fx.Err('ran-out-of-numbers') : Fx.Ok(n);
  });

  const getString = Fx.sync(function* f() {
    const { strings } = yield* Fx.ask<{ strings: string[] }>();
    const s = strings.shift();
    expectTypeOf(s).toEqualTypeOf<string | undefined>();

    return s == null ? Fx.Err('ran-out-of-strings') : Fx.Ok(s);
  });

  const getThing = Fx.sync(function* f() {
    const { things } = yield* Fx.ask<{ things: unknown[] }>();
    expectTypeOf(things).toEqualTypeOf<unknown[]>();

    return things.length === 0
      ? Fx.Err('ran-out-of-things')
      : Fx.Ok(things.shift());
  });

  const combineNumberAndString = Fx.sync(function* f() {
    const number = yield* getNumber();
    expectTypeOf(number).toEqualTypeOf<number>();

    const string = yield* getString();
    expectTypeOf(string).toEqualTypeOf<string>();

    return Fx.Ok(`${string}: ${number}`);
  });

  expectTypeOf(getNumber).toEqualTypeOf<
    () => Fx<number, 'ran-out-of-numbers', { numbers: number[] }>
  >();

  expectTypeOf(getString).toEqualTypeOf<
    () => Fx<string, 'ran-out-of-strings', { strings: string[] }>
  >();

  expectTypeOf(getThing).toEqualTypeOf<
    () => Fx<unknown, 'ran-out-of-things', { things: unknown[] }>
  >();

  expectTypeOf(combineNumberAndString).toEqualTypeOf<
    () => Fx<
      string,
      'ran-out-of-numbers' | 'ran-out-of-strings',
      { numbers: number[] } & { strings: string[] }
    >
  >();

  const errResult = getThing().run({ things: [] });

  errResult.match({
    Err: err => expect(err).toBe('ran-out-of-things'),
    Ok: () => expect.unreachable(),
  });

  fc.assert(
    fc.property(fc.array(fc.anything(), { minLength: 1 }), things => {
      const firstThing = things[0];
      const result = getThing().run({ things });

      result.match({
        Err: () => expect.unreachable(),
        Ok: thing => expect(thing).toBe(firstThing),
      });
    }),
  );

  fc.assert(
    fc.property(fc.array(fc.string()), strings => {
      const result = combineNumberAndString().run({
        numbers: [],
        strings,
      });

      result.match({
        Err: err => expect(err).toBe('ran-out-of-numbers'),
        Ok: () => expect.unreachable(),
      });
    }),
  );

  fc.assert(
    fc.property(fc.array(fc.double(), { minLength: 1 }), numbers => {
      const result = combineNumberAndString().run({
        numbers,
        strings: [],
      });

      result.match({
        Err: err => expect(err).toBe('ran-out-of-strings'),
        Ok: () => expect.unreachable(),
      });
    }),
  );

  fc.assert(
    fc.property(
      fc.array(fc.double(), { minLength: 1 }),
      fc.array(fc.string(), { minLength: 1 }),
      (numbers, strings) => {
        const firstNumber = numbers[0];
        const firstString = strings[0];
        const result = combineNumberAndString().run({ numbers, strings });

        result.match({
          Err: () => expect.unreachable(),
          Ok: combined =>
            expect(combined).toBe(`${firstString}: ${firstNumber}`),
        });
      },
    ),
  );
});

test('Fx.async', async () => {
  const getNumber = Fx.async(async function* f() {
    const { numbers } = yield* Fx.ask<{ numbers: number[] }>();
    const n = numbers.shift();
    expectTypeOf(n).toEqualTypeOf<number | undefined>();

    return n == null ? Fx.Err('ran-out-of-numbers') : Fx.Ok(n);
  });

  const getString = Fx.async(async function* f() {
    const { strings } = yield* Fx.ask<{ strings: string[] }>();
    const s = strings.shift();
    expectTypeOf(s).toEqualTypeOf<string | undefined>();

    return s == null ? Fx.Err('ran-out-of-strings') : Fx.Ok(s);
  });

  const getThing = Fx.async(async function* f() {
    const { things } = yield* Fx.ask<{ things: unknown[] }>();
    expectTypeOf(things).toEqualTypeOf<unknown[]>();

    return things.length === 0
      ? Fx.Err('ran-out-of-things')
      : Fx.Ok(things.shift());
  });

  const combineNumberAndString = Fx.async(async function* f() {
    const number = yield* getNumber();
    expectTypeOf(number).toEqualTypeOf<number>();

    const string = yield* getString();
    expectTypeOf(string).toEqualTypeOf<string>();

    return Fx.Ok(`${string}: ${number}`);
  });

  expectTypeOf(getNumber).toEqualTypeOf<
    () => Fx<number, 'ran-out-of-numbers', { numbers: number[] }>
  >();

  expectTypeOf(getString).toEqualTypeOf<
    () => Fx<string, 'ran-out-of-strings', { strings: string[] }>
  >();

  expectTypeOf(getThing).toEqualTypeOf<
    () => Fx<unknown, 'ran-out-of-things', { things: unknown[] }>
  >();

  expectTypeOf(combineNumberAndString).toEqualTypeOf<
    () => Fx<
      string,
      'ran-out-of-numbers' | 'ran-out-of-strings',
      { numbers: number[] } & { strings: string[] }
    >
  >();

  await getThing()
    .runAsync({ things: [] })
    .then(errResult => {
      errResult.match({
        Err: err => expect(err).toBe('ran-out-of-things'),
        Ok: () => expect.unreachable(),
      });
    });

  await fc.assert(
    fc.asyncProperty(
      fc.array(fc.anything(), { minLength: 1 }),
      async things => {
        const firstThing = things[0];
        const result = await getThing().runAsync({ things });

        result.match({
          Err: () => expect.unreachable(),
          Ok: thing => expect(thing).toBe(firstThing),
        });
      },
    ),
  );

  await fc.assert(
    fc.asyncProperty(fc.array(fc.string()), async strings => {
      const result = await combineNumberAndString().runAsync({
        numbers: [],
        strings,
      });

      result.match({
        Err: err => expect(err).toBe('ran-out-of-numbers'),
        Ok: () => expect.unreachable(),
      });
    }),
  );

  await fc.assert(
    fc.asyncProperty(fc.array(fc.double(), { minLength: 1 }), async numbers => {
      const result = await combineNumberAndString().runAsync({
        numbers,
        strings: [],
      });

      result.match({
        Err: err => expect(err).toBe('ran-out-of-strings'),
        Ok: () => expect.unreachable(),
      });
    }),
  );

  await fc.assert(
    fc.asyncProperty(
      fc.array(fc.double(), { minLength: 1 }),
      fc.array(fc.string(), { minLength: 1 }),
      async (numbers, strings) => {
        const firstNumber = numbers[0];
        const firstString = strings[0];
        const result = await combineNumberAndString().runAsync({
          numbers,
          strings,
        });

        result.match({
          Err: () => expect.unreachable(),
          Ok: combined =>
            expect(combined).toBe(`${firstString}: ${firstNumber}`),
        });
      },
    ),
  );
});

test('Fx.asyncAll', async () => {
  const getNumber = Fx.async(async function* f() {
    const { numbers } = yield* Fx.ask<{ numbers: number[] }>();
    const n = numbers.shift();

    return n == null ? Fx.Err('ran-out-of-numbers') : Fx.Ok(n);
  });

  const getString = Fx.async(async function* f() {
    const { strings } = yield* Fx.ask<{ strings: string[] }>();
    const s = strings.shift();

    return s == null ? Fx.Err('ran-out-of-strings') : Fx.Ok(s);
  });

  const combineNumberAndString = Fx.async(async function* f() {
    const [number, string] = yield* Fx.asyncAll([getNumber(), getString()]);

    expectTypeOf(number).toEqualTypeOf<number>();
    expectTypeOf(string).toEqualTypeOf<string>();

    return Fx.Ok(`${string}: ${number}`);
  });

  expectTypeOf(getNumber).toEqualTypeOf<
    () => Fx<number, 'ran-out-of-numbers', { numbers: number[] }>
  >();

  expectTypeOf(getString).toEqualTypeOf<
    () => Fx<string, 'ran-out-of-strings', { strings: string[] }>
  >();

  expectTypeOf(combineNumberAndString).toEqualTypeOf<
    () => Fx<
      string,
      'ran-out-of-numbers' | 'ran-out-of-strings',
      { numbers: number[] } & { strings: string[] }
    >
  >();

  await fc.assert(
    fc.asyncProperty(fc.array(fc.string()), async strings => {
      const result = await combineNumberAndString().runAsync({
        numbers: [],
        strings,
      });

      result.match({
        Err: err => expect(err).toBe('ran-out-of-numbers'),
        Ok: () => expect.unreachable(),
      });
    }),
  );

  await fc.assert(
    fc.asyncProperty(fc.array(fc.double(), { minLength: 1 }), async numbers => {
      const result = await combineNumberAndString().runAsync({
        numbers,
        strings: [],
      });

      result.match({
        Err: err => expect(err).toBe('ran-out-of-strings'),
        Ok: () => expect.unreachable(),
      });
    }),
  );

  await fc.assert(
    fc.asyncProperty(
      fc.array(fc.double(), { minLength: 1 }),
      fc.array(fc.string(), { minLength: 1 }),
      async (numbers, strings) => {
        const firstNumber = numbers[0];
        const firstString = strings[0];
        const result = await combineNumberAndString().runAsync({
          numbers,
          strings,
        });

        result.match({
          Err: () => expect.unreachable(),
          Ok: combined =>
            expect(combined).toBe(`${firstString}: ${firstNumber}`),
        });
      },
    ),
  );
});
