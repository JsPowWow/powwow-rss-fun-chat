import * as T from 'io-ts';
import { NonEmptyString } from 'io-ts-types';

export const UserNameSchema = T.type({
  username: NonEmptyString,
});
export const UserPasswordSchema = T.type({
  password: NonEmptyString,
});
export const UserDataSchema = T.intersection([UserNameSchema, UserPasswordSchema]);

export type UserData = T.TypeOf<typeof UserDataSchema>;
