import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { match } from 'ts-pattern';

import type {
  IAppCredentialsService,
  IAppPageManager,
  IAppRouteStateClient,
  IAppRouteStateController,
  IUserData,
} from '@/appConfig/types.ts';
import { Component } from '@/components';
import { ChatModel } from '@/models/ChatModel.ts';
import { AboutPage } from '@/pages/about';
import { ChatPage } from '@/pages/chat';
import type { LoginOnSubmitCallback } from '@/pages/login';
import { LoginPage } from '@/pages/login';
import type { AppPagePath } from '@/pages/routing';
import { AppPath } from '@/pages/routing';
import { Action } from '@/state-machine';
import { Loggable, type WithDebugOptions, identity, noop } from '@/utils';

const chatUrl = import.meta.env.VITE_MIK_API_URL;

export class AppPageManager extends Loggable implements IAppPageManager {
  private readonly root: HTMLElement;

  private readonly routeStateClient: IAppRouteStateClient;

  private readonly routeStateController: IAppRouteStateController;

  private readonly credentialsService: IAppCredentialsService;

  private chatModel?: ChatModel;

  constructor(
    options: WithDebugOptions<{
      rootNode: HTMLElement;
      routeStateClient: IAppRouteStateClient;
      routeStateController: IAppRouteStateController;
      credentialsService: IAppCredentialsService;
    }>,
  ) {
    super(options);
    this.root = options.rootNode;
    this.routeStateController = options.routeStateController;
    this.routeStateClient = options.routeStateClient;
    this.credentialsService = options.credentialsService;
  }

  public initialize(): typeof this {
    this.registerStateChangeUpdates();
    return this;
  }

  private getChatModel = (): ChatModel => {
    return this.chatModel ? this.chatModel : new ChatModel(chatUrl);
  };

  private registerStateChangeUpdates = (): void => {
    this.mountPage(this.routeStateClient.state.state);
    this.routeStateClient.onStateEnter('any', (e) => {
      this.mountPage(e.to.state);
    });
  };

  public mountPage = (pathname: AppPagePath): void => {
    Component.removeAllChildren(this.root);
    const doLog = (path: string): (<A>(a: A) => A) => this.log(`mountPage: ${path}`, 'info');
    const attachPage = Component.appendChild(this.root);
    match(pathname)
      .with(AppPath.chat, (path) => pipe(this.getChatModel(), ChatPage.create, doLog(path), attachPage))
      .with(AppPath.about, (path) => pipe(undefined, AboutPage.create, doLog(path), attachPage))
      .with(AppPath.login, (path) =>
        pipe(
          {
            userName: pipe(this.credentialsService.getUserName(), E.match(noop, identity)),
            onSubmit: this.handleLoginSubmit,
          },
          LoginPage.create,
          doLog(path),
          attachPage,
        ),
      )
      .run();
  };

  private handleLoginSubmit = (userData: IUserData): ReturnType<LoginOnSubmitCallback> =>
    pipe(
      userData,
      this.credentialsService.validate,
      E.foldW(identity, (data) => {
        this.routeStateController.dispatch(new Action('authorized', data));
        return undefined;
      }),
    );
}
