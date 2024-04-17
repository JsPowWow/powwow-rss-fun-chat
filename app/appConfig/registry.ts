import { ChatController } from '@/appConfig/ChatController.ts';
import { CredentialsController } from '@/appConfig/CredentialsController.ts';
import { CredentialsService } from '@/appConfig/CredentialsService.ts';
import type {
  IAppCredentialsController,
  IAppCredentialsService,
  IAppPageManager,
  IAppRouteStateClient,
  IAppRouteStateController,
  IAppRouteStateMachine,
  IChatController,
} from '@/appConfig/types.ts';
import { ChatModel } from '@/models/ChatModel.ts';
import { StateMachine, StateMachineClient } from '@/state-machine';
import { getLogger } from '@/utils';

import { AppPageManager } from './AppPageManager.ts';
import { AppRouteStateController } from './AppRouteStateController.ts';
import type { AppRouteState, RouteStateChangeAction } from './AppRouteStateDefinitions.ts';
import { AppRouteStateDefinitions } from './AppRouteStateDefinitions.ts';

const appElementRootNode: HTMLElement = document.querySelector('#app') ?? document.body;

export class Registry {
  public static AppState: { name: 'AppState'; instance: IAppRouteStateMachine };

  public static AppStateClient: { name: 'AppStateClient'; instance: IAppRouteStateClient };

  public static AppRouteStateController: { name: 'AppRouteStateController'; instance: IAppRouteStateController };

  public static AppPageManager: { name: 'AppPageManager'; instance: IAppPageManager };

  public static CredentialsService: { name: 'CredentialsService'; instance: IAppCredentialsService };

  public static CredentialsController: { name: 'CredentialsController'; instance: IAppCredentialsController };

  public static SocketService: { name: 'SocketService' };

  public static ChatModel: { name: 'ChatModel'; instance: ChatModel };

  public static ChatController: { name: 'ChatController'; instance: IChatController };

  static {
    this.AppState = {
      name: 'AppState',
      instance: new StateMachine<AppRouteState, RouteStateChangeAction>({
        name: 'AppState',
        definition: AppRouteStateDefinitions,
        debug: true,
        logger: getLogger('AppState'),
      }),
    };

    this.AppStateClient = {
      name: 'AppStateClient',
      instance: new StateMachineClient(this.AppState.instance, {
        debug: true,
        logger: getLogger('AppStateClient'),
      }),
    };

    this.CredentialsService = {
      name: 'CredentialsService',
      instance: new CredentialsService({
        debug: true,
        logger: getLogger('CredentialsService'),
      }),
    };

    this.CredentialsController = {
      name: 'CredentialsController',
      instance: new CredentialsController({
        credentialsService: this.CredentialsService.instance,
        routeStateClient: this.AppStateClient.instance,
        debug: true,
        logger: getLogger('CredentialsController'),
      }).initialize(),
    };

    this.AppRouteStateController = {
      name: 'AppRouteStateController',
      instance: new AppRouteStateController({
        routeState: this.AppState.instance,
        routeStateClient: this.AppStateClient.instance,
        credentialsService: this.CredentialsService.instance,
        debug: true,
        logger: getLogger('AppRouteStateController'),
      }).initialize(),
    };

    this.ChatModel = {
      name: 'ChatModel',
      instance: new ChatModel(),
    };

    this.AppPageManager = {
      name: 'AppPageManager',
      instance: new AppPageManager({
        rootNode: appElementRootNode,
        routeStateClient: this.AppStateClient.instance,
        routeStateController: this.AppRouteStateController.instance,
        credentialsService: this.CredentialsService.instance,
        chatModel: this.ChatModel.instance,
        debug: true,
        logger: getLogger('AppPageManager'),
      }).initialize(),
    };

    this.ChatController = {
      name: 'ChatController',
      instance: new ChatController({
        chatModel: this.ChatModel.instance,
        routeStateClient: this.AppStateClient.instance,
        debug: true,
        logger: getLogger('ChatController'),
      }).initialize(),
    };

    this.SocketService = {
      name: 'SocketService',
    };
  }

  public initialize(): typeof this {
    return this;
  }
}
