import type { Either } from 'fp-ts/Either';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

import type { UserData } from '@/api/webStorageCredentialsService.ts';
import { UserDataSchema, webStorageCredentials as credentials } from '@/api/webStorageCredentialsService.ts';
import type { IAppCredentialsService, IUserData } from '@/appConfig/types.ts';
import { toOneError } from '@/packages/fp-ts-utils';
import { Loggable } from '@/utils';

export class CredentialsService extends Loggable implements IAppCredentialsService {
  /* eslint class-methods-use-this: ["error", { "exceptMethods": ["validate", "getUserData", "getUserName", "saveUserData", "saveUserName"] }] */

  public validate = (input: unknown): E.Either<Error, { isValid: true } & IUserData> =>
    pipe(
      input,
      UserDataSchema.decode,
      E.mapLeft(toOneError),
      E.map((userData): { isValid: true } & UserData => ({ ...userData, isValid: true })),
    );

  public getUserData(): Either<Error, { username: string; password: string }> {
    return credentials.getStoredUserData();
  }

  public getUserName(): Either<Error, string> {
    return credentials.getStoredUserName();
  }

  public saveUserData(userData: { username: string; password: string }): Either<Error, void> {
    return credentials.storeUserData(userData);
  }

  public saveUserName(username: string): Either<Error, void> {
    return credentials.storeUserName(username);
  }
}
