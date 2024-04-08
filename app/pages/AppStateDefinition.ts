import { P, match } from 'ts-pattern';

import type { UserAuthData } from '@/api';
import { AppPath } from '@/pages/routing';
import type { IState, IStateMachineDefinition } from '@/state-machine';
import { State } from '@/state-machine';
import type { Nullable } from '@/utils';
import { noop } from '@/utils';

export type AppState =
  | IState<undefined, typeof AppPath.root>
  | IState<undefined, typeof AppPath.login>
  | IState<UserAuthData, typeof AppPath.chat>
  | IState<undefined, typeof AppPath.about>;

export type AppStateChangeAction =
  | { action: 'login'; payload: undefined }
  | { action: 'authorize'; payload: UserAuthData }
  | { action: 'logout'; payload: undefined }
  | { action: 'showAbout'; payload: undefined };

export const AppStateDefinition: IStateMachineDefinition<AppState, AppStateChangeAction> = {
  initialState: new State(AppPath.root, undefined),
  getNextState: (current, action: AppStateChangeAction): Nullable<AppState> => {
    return match([current.state, action])
      .returnType<Nullable<AppState>>()
      .with([AppPath.root, { action: 'login' }], ([_prev, { payload }]) => new State(AppPath.login, payload))
      .with([AppPath.login, { action: 'authorize' }], ([_prev, { payload }]) => new State(AppPath.chat, payload))
      .with([P.any, { action: 'logout' }], ([_prev, { payload }]) => new State(AppPath.root, payload))
      .with([P.any, { action: 'showAbout' }], ([_prev, { payload }]) => new State(AppPath.about, payload))
      .otherwise(noop);
  },
};
