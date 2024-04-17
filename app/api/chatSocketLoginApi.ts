import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { isString } from 'fp-ts/string';
import type * as TE from 'fp-ts/TaskEither';
import * as T from 'io-ts';

import { UnknownDataFormatError } from '@/api/errors.ts';
import type { IUserData } from '@/appConfig/types.ts';
import { jsonParse } from '@/packages/fp-ts-utils';
import { isInstanceOf } from '@/utils';

const UserLoginMsgSchema = T.type({
  id: T.string,
  type: T.literal('USER_LOGIN'),
  payload: T.type({
    user: T.type({
      login: T.string,
      isLogined: T.boolean,
    }),
  }),
});

export type UserLoginMessage = T.TypeOf<typeof UserLoginMsgSchema>;

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
          e.data,
          E.fromPredicate(isString, UnknownDataFormatError.create('String data format expected')),
          E.flatMap(jsonParse),
          E.flatMap(UserLoginMsgSchema.decode),
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
