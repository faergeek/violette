import { Maybe } from '@faergeek/monads';
import * as v from 'valibot';

export function getLocalStorageValue<
  const T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(key: string, schema: T) {
  const value = localStorage.getItem(key);
  if (value == null) return Maybe.None;

  let maybeJsonStr: Maybe<v.InferInput<T>>;

  try {
    maybeJsonStr = Maybe.Some(JSON.parse(value));
  } catch {
    maybeJsonStr = Maybe.None;
  }

  return maybeJsonStr.flatMapSome(jsonStr => {
    const parseResult = v.safeParse(schema, jsonStr);

    return parseResult.success ? Maybe.Some(parseResult.output) : Maybe.None;
  });
}
