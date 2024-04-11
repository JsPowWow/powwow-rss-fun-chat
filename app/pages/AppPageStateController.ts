import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { match } from 'ts-pattern';

import { credentials, validateUserInput } from '@/api/credentialsService.ts';
import { Component } from '@/components';
import { ChatModel } from '@/models/ChatModel.ts';
import type { UserData } from '@/models/UserData.ts';
import { Loggable } from '@/packages/utils/Loggable.ts';
import { AboutPage } from '@/pages/about';
import type { AppState, AppStateChangeAction } from '@/pages/AppStateDefinition.ts';
import { AppStateDefinition } from '@/pages/AppStateDefinition.ts';
import { ChatPage } from '@/pages/chat';
import { LoginPage } from '@/pages/login';
import type { AppPagePath } from '@/pages/routing';
import { AppPath, getAppPageSafePath, pushHistoryState } from '@/pages/routing';
import type { IStateMachineClient } from '@/state-machine';
import { Action, StateMachine, StateMachineClient } from '@/state-machine';
import type { DebugOption } from '@/utils';
import { identity, noop } from '@/utils';

const chatUrl = import.meta.env.VITE_MIK_API_URL;

export class AppPageStateController extends Loggable {
  private readonly root: HTMLElement;

  public readonly appStateClient: IStateMachineClient<AppState, AppStateChangeAction>;

  private readonly appState: StateMachine<AppState, AppStateChangeAction>;

  constructor(root: HTMLElement, options?: DebugOption) {
    super(options);

    this.root = root;

    this.appState = new StateMachine<AppState, AppStateChangeAction>({
      name: 'PagesState',
      definition: AppStateDefinition,
      ...options,
    });
    this.appStateClient = new StateMachineClient(this.appState, {
      name: 'PagesStateClient',
      ...options,
    });
  }

  public initialize(): typeof this {
    this.registerStateChangeUpdates();
    this.registerBrowserBackAndForth();
    this.validateCurrentUrlPathName();

    return this;
  }

  private validateCurrentUrlPathName = (): void => {
    const safeCanGoPath = getAppPageSafePath();
    if (O.isSome(safeCanGoPath)) {
      this.appState.setState(new Action('gotoNoCredsPage', safeCanGoPath.value));
    } else {
      pipe(
        credentials.getStoredUserData(),
        E.foldW(() => this.appState.setState(new Action('login', undefined)), this.commitAuthorization),
      );
    }
  };

  private registerStateChangeUpdates = (): void => {
    this.appStateClient.onStateEnter('any', (e) => {
      pushHistoryState(e.to.state);
      this.mountPage(e.to.state);
    });
  };

  private registerBrowserBackAndForth = (): void => {
    window.onpopstate = (): void => this.validateCurrentUrlPathName();
  };

  private mountPage = (pathname: AppPagePath): void => {
    Component.removeAllChildren(this.root);
    const doLog = (path: string): (<A>(a: A) => A) => this.log(`mountPage: ${path}`, 'info');
    const attachPage = Component.appendChild(this.root);
    match(pathname)
      .with(AppPath.chat, (path) => pipe(new ChatModel(chatUrl), ChatPage.create, doLog(path), attachPage))
      .with(AppPath.about, (path) => pipe(undefined, AboutPage.create, doLog(path), attachPage))
      .with(AppPath.login, (path) =>
        pipe(
          {
            userName: pipe(credentials.getStoredUserName(), E.match(noop, identity)),
            onSubmit: flow(
              validateUserInput,
              E.foldW(identity, (userData) => {
                this.commitAuthorization(userData);
                return undefined;
              }),
            ),
          },
          LoginPage.create,
          doLog(path),
          attachPage,
        ),
      )
      .run();
  };

  private commitAuthorization = (userData: UserData): void => {
    this.appState.setState(new Action('authorized', userData));
    credentials.storeUserName(userData.username);
    credentials.storeUserData(userData);
  };
}
