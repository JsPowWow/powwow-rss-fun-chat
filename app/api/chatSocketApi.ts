import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { isString } from 'fp-ts/string';
import type * as TE from 'fp-ts/TaskEither';
import type { Errors } from 'io-ts';
import * as T from 'io-ts';

import { UnknownDataFormatError } from '@/api/errors.ts';
import type { IUserData } from '@/appConfig/types.ts';
import { jsonParse } from '@/packages/fp-ts-utils';
import { isInstanceOf } from '@/utils';

const UserSchema = T.type({
  login: T.string,
  isLogined: T.boolean,
});

const UserLoginMsgSchema = T.type({
  id: T.union([T.string, T.nullType]),
  type: T.union([
    T.literal('USER_LOGIN'),
    T.literal('USER_EXTERNAL_LOGIN'),
    T.literal('USER_LOGOUT'),
    T.literal('USER_EXTERNAL_LOGOUT'),
  ]),
  payload: T.type({
    user: UserSchema,
  }),
});

export type UserLoginMessage = T.TypeOf<typeof UserLoginMsgSchema>;

export const parseUserLoginMessage = (e: MessageEvent<unknown>): E.Either<Error | Errors, UserLoginMessage> =>
  pipe(
    e.data,
    E.fromPredicate(isString, UnknownDataFormatError.create('String data format expected')),
    E.flatMap(jsonParse),
    E.flatMap(UserLoginMsgSchema.decode),
  );

const UsersListSchema = T.type({
  id: T.union([T.string, T.nullType]),
  type: T.union([T.literal('USER_ACTIVE'), T.literal('USER_INACTIVE')]),
  payload: T.type({
    users: T.array(UserSchema),
  }),
});

export type UsersListMessage = T.TypeOf<typeof UsersListSchema>;

export const parseUserListMessage = (e: MessageEvent<unknown>): E.Either<Error | Errors, UsersListMessage> =>
  pipe(
    e.data,
    E.fromPredicate(isString, UnknownDataFormatError.create('String data format expected')),
    E.flatMap(jsonParse),
    E.flatMap(UsersListSchema.decode),
  );

export const login = (userData: IUserData, ws: WebSocket): TE.TaskEither<Error, UserLoginMessage> => {
  return () =>
    new Promise((resolve, reject) => {
      const id = window.crypto.randomUUID();
      ws.addEventListener(
        'error',
        (e) => {
          reject(e);
        },
        { once: true },
      );
      const handleOnMessage = (e: MessageEvent<unknown>): void => {
        pipe(
          e,
          parseUserLoginMessage,
          // E.mapLeft(toOneError),
          E.fold(
            (error) => {
              if (isInstanceOf(UnknownDataFormatError, error)) {
                ws.removeEventListener('message', handleOnMessage);
                reject(E.left(error));
              }
            },
            (r) => {
              ws.removeEventListener('message', handleOnMessage);
              resolve(E.right(r));
            },
          ),
        );
      };

      ws.addEventListener('message', handleOnMessage);
      ws.send(
        JSON.stringify({
          id,
          type: 'USER_LOGIN',
          payload: {
            user: {
              login: userData.username,
              password: userData.password,
            },
          },
        }),
      );
    });
};

// `{
//   "id":"19f44003-32a7-45af-b1c1-6fd87885c41b",
//   "type":"USER_LOGIN",
//   "payload":{
//     "user":{
//       "login":"kolobok",
//       "password":"Kolobok"
//     },
//     "__proto__":{
//       "hack":"Hack",
//       "toString":"Not really to String"
//     }
//   }
// }`
