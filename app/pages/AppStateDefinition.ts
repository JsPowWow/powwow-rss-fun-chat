import { P, match } from 'ts-pattern';

import type { UserData } from '@/models/UserData.ts';
import type { AppNoCredsRequiredPath } from '@/pages/routing';
import { AppPath } from '@/pages/routing';
import type { IState, IStateMachineDefinition } from '@/state-machine';
import { State } from '@/state-machine';
import type { Nullable } from '@/utils';
import { noop } from '@/utils';

export type AppState =
  | IState<undefined, typeof AppPath.root>
  | IState<undefined, typeof AppPath.login>
  | IState<UserData, typeof AppPath.chat>
  | IState<undefined, typeof AppPath.about>;

export type AppStateChangeAction =
  | { action: 'gotoNoCredsPage'; payload: AppNoCredsRequiredPath }
  | { action: 'login'; payload: undefined }
  | { action: 'authorized'; payload: UserData };

export const AppStateDefinition: IStateMachineDefinition<AppState, AppStateChangeAction> = {
  initialState: new State(AppPath.root, undefined),
  getNextState: (current, action: AppStateChangeAction): Nullable<AppState> =>
    match([current.state, action])
      .returnType<Nullable<AppState>>()
      .with([P.any, { action: 'gotoNoCredsPage' }], ([_prev, { payload }]) =>
        match(payload)
          .with('/about', () => new State(AppPath.about, undefined))
          .with('/login', () => new State(AppPath.login, undefined))
          .exhaustive(),
      )
      .with([P.any, { action: 'login' }], ([_prev, { payload }]) => new State(AppPath.login, payload))
      // .with([P.any, { action: 'logout' }], ([_prev, { payload }]) => new State(AppPath.login, payload))
      // .with([P.any, { action: 'showAbout' }], ([_prev, { payload }]) => new State(AppPath.about, payload))
      .with([P.any, { action: 'authorized' }], ([_prev, { payload }]) => new State(AppPath.chat, payload))
      .otherwise(noop),
};
