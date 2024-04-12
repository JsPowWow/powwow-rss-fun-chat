import { CredentialsService } from '@/appConfig/CredentialsService.ts';
import type {
  IAppPageManager,
  IAppPageStateController,
  IAppStateClient,
  IAppStateMachine,
  ICredentialsService,
} from '@/appConfig/types.ts';
import { StateMachine, StateMachineClient } from '@/state-machine';
import { getLogger } from '@/utils';

import { AppPageManager } from './AppPageManager.ts';
import { AppPageStateController } from './AppPageStateController.ts';
import type { AppState, AppStateChangeAction } from './AppStateDefinition.ts';
import { AppStateDefinition } from './AppStateDefinition.ts';

const appElementRootNode: HTMLElement = document.querySelector('#app') ?? document.body;

export class Registry {
  public static AppState: { name: 'AppState'; instance: IAppStateMachine };

  public static AppStateClient: { name: 'AppStateClient'; instance: IAppStateClient };

  public static AppPageStateController: { name: 'AppPageStateController'; instance: IAppPageStateController };

  public static AppPageManager: { name: 'AppPageManager'; instance: IAppPageManager };

  public static CredentialsService: { name: 'CredentialsService'; instance: ICredentialsService };

  public static SocketService: { name: 'SocketService' };

  public static ChatModel: { name: 'ChatModel' };

  static {
    this.AppState = {
      name: 'AppState',
      instance: new StateMachine<AppState, AppStateChangeAction>({
        name: 'AppState',
        definition: AppStateDefinition,
        debug: true,
        logger: getLogger('AppState'),
      }),
    };
    // TODO check types here / why need IStateMachine ?
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

    this.AppPageStateController = {
      name: 'AppPageStateController',
      instance: new AppPageStateController({
        appState: this.AppState.instance,
        appStateClient: this.AppStateClient.instance,
        credentialsService: this.CredentialsService.instance,
        debug: true,
        logger: getLogger('AppPageStateController'),
      }).initialize(),
    };

    this.AppPageManager = {
      name: 'AppPageManager',
      instance: new AppPageManager({
        rootNode: appElementRootNode,
        appStateClient: this.AppStateClient.instance,
        appPageStateController: this.AppPageStateController.instance,
        credentialsService: this.CredentialsService.instance,
        debug: true,
        logger: getLogger('AppPageManager'),
      }).initialize(),
    };

    this.SocketService = {
      name: 'SocketService',
    };

    this.ChatModel = {
      name: 'ChatModel',
    };
  }

  public initialize(): typeof this {
    return this;
  }
}
