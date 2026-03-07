import * as fc from 'fast-check';
import { expect, test, vi } from 'vitest';

import * as Fx from '../fx/fx';

test('Ok', () => {
  fc.assert(
    fc.property(fc.anything(), input => {
      const value = Fx.run(Fx.Ok(input), undefined);
      if (value.TAG === 0) expect(value._0).toBe(input);
      else expect.unreachable();
    }),
  );
});

test('Error', () => {
  fc.assert(
    fc.property(fc.anything(), input => {
      const error = Fx.run(Fx.Err(input), undefined);
      if (error.TAG === 0) expect.unreachable();
      expect(error._0).toBe(input);
    }),
  );
});

test('async', () =>
  fc
    .assert(
      fc.asyncProperty(fc.anything(), input =>
        Fx.runAsync(
          Fx.Async(async n => Fx.Ok(n)),
          input,
        ).then(result => {
          if (result.TAG === 0) expect(result._0).toBe(input);
          else expect.unreachable();
        }),
      ),
    )
    .then(() =>
      fc.assert(
        fc.asyncProperty(fc.anything(), input =>
          Fx.runAsync(
            Fx.Async(async n => Fx.Err(n)),
            input,
          ).then(result => {
            if (result.TAG === 0) expect.unreachable();
            else expect(result._0).toBe(input);
          }),
        ),
      ),
    ));

test('bind', () => {
  fc.assert(
    fc.property(fc.double(), input => {
      const value = Fx.run(
        Fx.bind(Fx.Ok(input), n => Fx.Ok(n.toString())),
        undefined,
      );

      if (value.TAG === 0) expect(value._0).toBe(String(input));
      else expect.unreachable();
    }),
  );

  fc.assert(
    fc.property(fc.string(), input => {
      const f = vi.fn();
      const error = Fx.run(Fx.bind(Fx.Err(input), f), undefined);
      if (error.TAG === 0) expect.unreachable();
      else expect(error._0).toBe(input);

      expect(f).not.toHaveBeenCalled();
    }),
  );

  return fc
    .assert(
      fc.asyncProperty(fc.double(), input => {
        return Fx.runAsync(
          Fx.bind(
            Fx.Async(async () => Fx.Ok(input)),
            n => Fx.Ok(n.toString()),
          ),
          undefined,
        ).then(result => {
          if (result.TAG === 0) expect(result._0).toBe(String(input));
          else expect.unreachable();
        });
      }),
    )
    .then(() =>
      fc.assert(
        fc.asyncProperty(fc.string(), input => {
          const f = vi.fn();

          return Fx.runAsync(
            Fx.bind(
              Fx.Async(async () => Fx.Err(input)),
              f,
            ),
            undefined,
          ).then(result => {
            if (result.TAG === 0) expect.unreachable();
            else expect(result._0).toBe(input);
            expect(f).not.toHaveBeenCalled();
          });
        }),
      ),
    );
});

test('map', () => {
  fc.assert(
    fc.property(fc.double(), input => {
      const value = Fx.run(
        Fx.map(Fx.Ok(input), n => String(n)),
        undefined,
      );

      if (value.TAG === 0) expect(value._0).toBe(input.toString());
      else expect.unreachable();
    }),
  );

  fc.assert(
    fc.property(fc.string(), input => {
      const f = vi.fn();
      const result = Fx.run(Fx.bind(Fx.Err(input), f), undefined);
      if (result.TAG === 0) expect.unreachable();
      else expect(result._0).toBe(input);

      expect(f).not.toHaveBeenCalled();
    }),
  );

  return fc
    .assert(
      fc.asyncProperty(fc.double(), input => {
        return Fx.runAsync(
          Fx.bind(Fx.Ok(input), n => Fx.Ok(n.toString())),
          undefined,
        ).then(result => {
          if (result.TAG === 0) expect(result._0).toBe(input.toString());
          else expect.unreachable();
        });
      }),
    )
    .then(() =>
      fc.assert(
        fc.asyncProperty(fc.string(), input => {
          const f = vi.fn();

          return Fx.runAsync(
            Fx.bind(
              Fx.Async(async () => Fx.Err(input)),
              f,
            ),
            undefined,
          ).then(result => {
            if (result.TAG === 0) expect.unreachable();
            else expect(result._0).toBe(input);

            expect(f).not.toHaveBeenCalled();
          });
        }),
      ),
    );
});

test('catch', () => {
  fc.assert(
    fc.property(fc.double(), input => {
      const value = Fx.run(
        Fx.catch_(Fx.Err(input), n => Fx.Ok(n.toString())),
        undefined,
      );

      if (value.TAG === 0) expect(value._0).toBe(input.toString());
      else expect.unreachable();
    }),
  );

  fc.assert(
    fc.property(fc.string(), input => {
      const f = vi.fn();

      const value = Fx.run(Fx.catch_(Fx.Ok(input), f), undefined);

      if (value.TAG === 0) expect(value._0).toBe(input);
      else expect.unreachable();

      expect(f).not.toHaveBeenCalled();
    }),
  );

  return fc
    .assert(
      fc.asyncProperty(fc.double(), input => {
        return Fx.runAsync(
          Fx.catch_(
            Fx.Async(async () => Fx.Err(input)),
            n => Fx.Ok(n.toString()),
          ),
          undefined,
        ).then(result => {
          if (result.TAG === 0) expect(result._0).toBe(input.toString());
          else expect.unreachable();
        });
      }),
    )
    .then(() =>
      fc.assert(
        fc.asyncProperty(fc.string(), input => {
          const f = vi.fn();

          return Fx.runAsync(
            Fx.catch_(
              Fx.Async(async () => Fx.Ok(input)),
              f,
            ),
            undefined,
          ).then(result => {
            if (result.TAG === 0) expect(result._0).toBe(input);
            else expect.unreachable();

            expect(f).not.toHaveBeenCalled();
          });
        }),
      ),
    );
});

test('ask', () => {
  fc.assert(
    fc.property(fc.anything(), thing => {
      const env = Fx.run(Fx.ask(), thing);
      if (env.TAG === 0) expect(env._0).toBe(thing);
      else expect.unreachable();
    }),
  );
});

test('provide', () => {
  fc.assert(
    fc.property(fc.anything(), thing => {
      const env = Fx.run(Fx.provide(Fx.ask(), thing), undefined);
      if (env.TAG === 0) expect(env._0).toBe(thing);
      else expect.unreachable();
    }),
  );
});
