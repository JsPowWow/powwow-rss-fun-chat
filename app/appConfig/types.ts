import type * as E from 'fp-ts/Either';

import type { AppState, AppStateChangeAction } from '@/appConfig/AppStateDefinition.ts';
import type { AppPagePath } from '@/pages/routing';
import type { IStateMachine, IStateMachineClient } from '@/state-machine';

export interface IUserData {
  username: string;
  password: string;
}

export interface IAppStateMachine extends IStateMachine<AppState, AppStateChangeAction> {}

export interface IAppStateClient extends IStateMachineClient<AppState, AppStateChangeAction> {}

export interface IAppPageManager {
  initialize: () => IAppPageManager;
  mountPage: (pathname: AppPagePath) => void;
}

export interface IAppPageStateController {
  initialize: () => IAppPageStateController;
  dispatch: (action: AppStateChangeAction) => AppState;
}

export interface ICredentialsService {
  validate: (input: unknown) => E.Either<Error, { isValid: true } & IUserData>;
  saveUserData: (userData: IUserData) => E.Either<Error, void>;
  getUserData: () => E.Either<Error, IUserData>;
  saveUserName: (username: string) => E.Either<Error, void>;
  getUserName: () => E.Either<Error, string>;
}
