import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as T from 'io-ts';
import { NonEmptyString } from 'io-ts-types';

import {
  getLocalStorageItem,
  getSessionStorageItem,
  jsonParse,
  setLocalStorageItem,
  setSessionStorageItem,
  toOneError,
} from '@/packages/fp-ts-utils';

const UserName = T.type({
  username: NonEmptyString,
});
const UserPassword = T.type({
  password: NonEmptyString,
});

const User = T.intersection([UserName, UserPassword]);

export type UserAuthData = T.TypeOf<typeof User>;
export type SuccessAuthorized = { authorized: true } & UserAuthData;

export const STORAGE_KEY = 'fun-chat';

export const getSavedUserName = (): E.Either<Error, NonEmptyString> =>
  pipe(
    STORAGE_KEY,
    getLocalStorageItem,
    E.flatMap(jsonParse),
    E.flatMap(UserName.decode),
    E.mapLeft(toOneError),
    E.map((userData): NonEmptyString => userData.username),
  );

export const getStoredAuthData = (): E.Either<Error, SuccessAuthorized> =>
  pipe(
    STORAGE_KEY,
    getSessionStorageItem,
    E.flatMap(jsonParse),
    E.flatMap(User.decode),
    E.mapLeft(toOneError),
    E.map((userData): SuccessAuthorized => ({ ...userData, authorized: true })),
  );

export const saveUserName = (user: NonEmptyString): E.Either<Error, void> => {
  return setLocalStorageItem(STORAGE_KEY, UserName.encode({ username: user }));
};

export const storeAuthData = (userData: UserAuthData): E.Either<Error, void> => {
  return setSessionStorageItem(STORAGE_KEY, UserName.encode(userData));
};

export const validateUserInput = (input: unknown): E.Either<Error, SuccessAuthorized> =>
  pipe(
    input,
    User.decode,
    E.mapLeft(toOneError),
    E.map((userData): SuccessAuthorized => ({ ...userData, authorized: true })),
  );
