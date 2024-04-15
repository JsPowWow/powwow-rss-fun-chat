import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';

import type {
  IAppCredentialsService,
  IAppRouteStateClient,
  IAppRouteStateController,
  IAppRouteStateMachine,
} from '@/appConfig/types.ts';
import { Loggable } from '@/packages/utils/Loggable.ts';
import { getAppPageSafePath, pushHistoryState } from '@/pages/routing';
import { Action } from '@/state-machine';
import type { WithDebugOptions } from '@/utils';

import type { AppRouteState, RouteStateChangeAction } from './AppRouteStateDefinitions.ts';

export class AppRouteStateController extends Loggable implements IAppRouteStateController {
  public readonly routeStateClient: IAppRouteStateClient;

  private readonly routeState: IAppRouteStateMachine;

  private readonly credentialsService: IAppCredentialsService;

  constructor(
    options: WithDebugOptions<{
      routeState: IAppRouteStateMachine;
      routeStateClient: IAppRouteStateClient;
      credentialsService: IAppCredentialsService;
    }>,
  ) {
    super(options);

    this.routeState = options.routeState;
    this.routeStateClient = options.routeStateClient;
    this.credentialsService = options.credentialsService;
  }

  public initialize(): typeof this {
    this.registerStateChangeUpdates();
    this.registerBrowserBackAndForth();
    this.validateCurrentUrlPathName();

    return this;
  }

  public dispatch = (action: RouteStateChangeAction): AppRouteState => {
    return this.routeState.setState(action);
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
    this.routeStateClient.onStateEnter('any', (e) => {
      pushHistoryState(e.to.state);
    });
  };

  private registerBrowserBackAndForth = (): void => {
    window.onpopstate = (): void => this.validateCurrentUrlPathName();
  };
}
