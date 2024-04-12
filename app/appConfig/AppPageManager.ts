import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/function';
import { match } from 'ts-pattern';

import type {
  IAppPageManager,
  IAppPageStateController,
  IAppStateClient,
  ICredentialsService,
} from '@/appConfig/types.ts';
import { Component } from '@/components';
import { ChatModel } from '@/models/ChatModel.ts';
import { AboutPage } from '@/pages/about';
import { ChatPage } from '@/pages/chat';
import { LoginPage } from '@/pages/login';
import type { AppPagePath } from '@/pages/routing';
import { AppPath } from '@/pages/routing';
import { Action } from '@/state-machine';
import { Loggable, type WithDebugOptions, identity, noop } from '@/utils';

const chatUrl = import.meta.env.VITE_MIK_API_URL;

export class AppPageManager extends Loggable implements IAppPageManager {
  private readonly root: HTMLElement;

  private readonly appStateClient: IAppStateClient;

  private readonly appPageStateController: IAppPageStateController;

  private readonly credentialsService: ICredentialsService;

  constructor(
    options: WithDebugOptions<{
      rootNode: HTMLElement;
      appStateClient: IAppStateClient;
      appPageStateController: IAppPageStateController;
      credentialsService: ICredentialsService;
    }>,
  ) {
    super(options);
    this.root = options.rootNode;
    this.appPageStateController = options.appPageStateController;
    this.appStateClient = options.appStateClient;
    this.credentialsService = options.credentialsService;
  }

  public initialize(): typeof this {
    this.registerStateChangeUpdates();
    return this;
  }

  private registerStateChangeUpdates = (): void => {
    this.mountPage(this.appStateClient.state.state);
    this.appStateClient.onStateEnter('any', (e) => {
      this.mountPage(e.to.state);
    });
  };

  public mountPage = (pathname: AppPagePath): void => {
    Component.removeAllChildren(this.root);
    const doLog = (path: string): (<A>(a: A) => A) => this.log(`mountPage: ${path}`, 'info');
    const attachPage = Component.appendChild(this.root);
    match(pathname)
      .with(AppPath.chat, (path) => pipe(new ChatModel(chatUrl), ChatPage.create, doLog(path), attachPage))
      .with(AppPath.about, (path) => pipe(undefined, AboutPage.create, doLog(path), attachPage))
      .with(AppPath.login, (path) =>
        pipe(
          {
            userName: pipe(this.credentialsService.getUserName(), E.match(noop, identity)),
            onSubmit: flow(
              this.credentialsService.validate,
              E.foldW(identity, (userData) => {
                this.appPageStateController.dispatch(new Action('authorized', userData));
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
}
