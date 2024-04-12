import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';

import type {
  IAppPageStateController,
  IAppStateClient,
  IAppStateMachine,
  ICredentialsService,
} from '@/appConfig/types.ts';
import { Loggable } from '@/packages/utils/Loggable.ts';
import { getAppPageSafePath, pushHistoryState } from '@/pages/routing';
import { Action } from '@/state-machine';
import type { WithDebugOptions } from '@/utils';

import type { AppState, AppStateChangeAction } from './AppStateDefinition.ts';

export class AppPageStateController extends Loggable implements IAppPageStateController {
  public readonly appStateClient: IAppStateClient;

  private readonly appState: IAppStateMachine;

  private readonly credentialsService: ICredentialsService;

  constructor(
    options: WithDebugOptions<{
      appState: IAppStateMachine;
      appStateClient: IAppStateClient;
      credentialsService: ICredentialsService;
    }>,
  ) {
    super(options);

    this.appState = options.appState;
    this.appStateClient = options.appStateClient;
    this.credentialsService = options.credentialsService;
  }

  public initialize(): typeof this {
    this.registerStateChangeUpdates();
    this.registerBrowserBackAndForth();
    this.validateCurrentUrlPathName();

    return this;
  }

  public dispatch = (action: AppStateChangeAction): AppState => {
    return this.appState.setState(action);
  };

  private validateCurrentUrlPathName = (): void => {
    const safeCanGoPath = getAppPageSafePath();
    if (O.isSome(safeCanGoPath)) {
      this.dispatch(new Action('gotoNoCredsPage', safeCanGoPath.value));
    } else {
      pipe(
        this.credentialsService.getUserData(),
        E.foldW(
          () => this.dispatch(new Action('login', undefined)),
          (userData) => this.dispatch(new Action('authorized', userData)),
        ),
      );
    }
  };

  private registerStateChangeUpdates = (): void => {
    this.appStateClient.onStateEnter('any', (e) => {
      pushHistoryState(e.to.state);
    });
    this.appStateClient.onStateLeave('/login', (e) => {
      if (e.by.action === 'authorized' && e.to.state === '/chat') {
        const userData = e.to.data;
        this.credentialsService.saveUserName(userData.username);
        this.credentialsService.saveUserData(userData);
      }
    });
  };

  private registerBrowserBackAndForth = (): void => {
    window.onpopstate = (): void => this.validateCurrentUrlPathName();
  };
}
