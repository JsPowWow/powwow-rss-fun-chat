import type * as E from 'fp-ts/Either';

import type { AppRouteState, RouteStateChangeAction } from '@/appConfig/AppRouteStateDefinitions.ts';
import type { AppPagePath } from '@/pages/routing';
import type { IStateMachine, IStateMachineClient } from '@/state-machine';

export interface IUserData {
  username: string;
  password: string;
}

export interface IAppRouteStateMachine extends IStateMachine<AppRouteState, RouteStateChangeAction> {}

export interface IAppRouteStateClient extends IStateMachineClient<AppRouteState, RouteStateChangeAction> {}

export interface IAppPageManager {
  initialize: () => IAppPageManager;
  mountPage: (pathname: AppPagePath) => void;
}

export interface IAppRouteStateController {
  initialize: () => IAppRouteStateController;
  dispatch: (action: RouteStateChangeAction) => void;
}

export interface IAppCredentialsService {
  validate: (input: unknown) => E.Either<Error, { isValid: true } & IUserData>;
  saveUserData: (userData: IUserData) => E.Either<Error, void>;
  getUserData: () => E.Either<Error, IUserData>;
  saveUserName: (username: string) => E.Either<Error, void>;
  getUserName: () => E.Either<Error, string>;
}

export interface IAppCredentialsController {
  initialize: () => IAppCredentialsController;
}

export interface IChatController {
  initialize: () => IChatController;
}
