import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

import type { UserData } from '@/models/UserData.ts';
import { UserDataSchema, UserNameSchema } from '@/models/UserData.ts';
import {
  getLocalStorageItem,
  getSessionStorageItem,
  jsonParse,
  setLocalStorageItem,
  setSessionStorageItem,
  toOneError,
} from '@/packages/fp-ts-utils';

export const STORAGE_KEY = 'fun-chat';
export type SuccessAuthorized = { authorized: true } & UserData;

export const validateUserInput = (input: unknown): E.Either<Error, SuccessAuthorized> =>
  pipe(
    input,
    UserDataSchema.decode,
    E.mapLeft(toOneError),
    E.map((userData): SuccessAuthorized => ({ ...userData, authorized: true })),
  );

export const credentials = {
  storeUserData: (userData: { username: string; password: string }): E.Either<Error, void> => {
    return pipe(
      userData,
      E.fromPredicate(UserDataSchema.is, () => new Error('Wrong input of userData')),
      E.chain(setSessionStorageItem(STORAGE_KEY)),
    );
  },
  storeUserName: (username: string): E.Either<Error, void> => {
    return pipe(
      { username },
      E.fromPredicate(UserNameSchema.is, () => new Error('Wrong input of username')),
      E.chain(setLocalStorageItem(STORAGE_KEY)),
    );
  },
  getStoredUserName: (): E.Either<Error, string> =>
    pipe(
      STORAGE_KEY,
      getLocalStorageItem,
      E.flatMap(jsonParse),
      E.flatMap(UserNameSchema.decode),
      E.mapLeft(toOneError),
      E.map((userData) => userData.username),
    ),
  getStoredUserData: (): E.Either<Error, SuccessAuthorized> =>
    pipe(
      STORAGE_KEY,
      getSessionStorageItem,
      E.flatMap(jsonParse),
      E.flatMap(UserDataSchema.decode),
      E.mapLeft(toOneError),
      E.map((userData): SuccessAuthorized => ({ ...userData, authorized: true })),
    ),
};
