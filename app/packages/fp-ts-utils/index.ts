import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/function';
import type { Errors } from 'io-ts';
import { failure } from 'io-ts/PathReporter';
import { NonEmptyString } from 'io-ts-types';

import { JSONParseError } from '@/packages/fp-ts-utils/errors/JSONParseError.ts';
import { JSONStringifyError } from '@/packages/fp-ts-utils/errors/JSONStringifyError.ts';

export function assertIsLeft<E>(e: E.Either<E, unknown>): asserts e is E.Left<E> {
  if (!E.isLeft(e)) {
    throw Error('should be Either.Left');
  }
}

export function assertIsRight<E>(e: E.Either<E, unknown>): asserts e is E.Right<E> {
  if (!E.isRight(e)) {
    throw Error('should be Either.Right');
  }
}

export const withCause =
  <E extends Error>(err: E) =>
  (c: unknown): E => {
    err.cause = c;
    return err;
  };

export const jsonParse = (text: string): E.Either<JSONParseError, unknown> =>
  E.tryCatch((): unknown => JSON.parse(text), withCause(new JSONParseError()));

export const jsonStringify = (value: unknown): E.Either<JSONStringifyError, string> =>
  E.tryCatch((): string => JSON.stringify(value), withCause(new JSONStringifyError()));

export const getItemByKey =
  (storage: Storage) =>
  (key: string): E.Either<Error, string | null> =>
    E.tryCatch(() => storage.getItem(key), E.toError);

export const setItemByKey = (storage: Storage, key: string, value: string): E.Either<Error, void> =>
  E.tryCatch(() => storage.setItem(key, value), E.toError);

export const toOneError = (e: Errors | Error): Error => (Array.isArray(e) ? new Error(failure(e).join('\n')) : e);

export const getSessionStorageItem = (key: string): E.Either<Error, string> =>
  pipe(key, getItemByKey(sessionStorage), E.flatMap(NonEmptyString.decode), E.mapLeft(toOneError));

export const setSessionStorageItem = (key: string): ((value: unknown) => E.Either<Error, void>) =>
  flow(
    jsonStringify,
    E.chain((v) => setItemByKey(sessionStorage, key, v)),
  );

export const getLocalStorageItem = (key: string): E.Either<Error, string> =>
  pipe(key, getItemByKey(localStorage), E.flatMap(NonEmptyString.decode), E.mapLeft(toOneError));

export const setLocalStorageItem = (key: string): ((value: unknown) => E.Either<Error, void>) =>
  flow(
    jsonStringify,
    E.chain((v) => setItemByKey(localStorage, key, v)),
  );
