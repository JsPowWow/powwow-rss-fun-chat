import * as E from 'fp-ts/Either';

import { login } from '@/api/chatSocketLoginApi.ts';
import type { IAppRouteStateClient, IChatController, IUserData } from '@/appConfig/types.ts';
import type { ChatModel } from '@/models/ChatModel.ts';
import { socketService } from '@/packages/fp-ts-utils/socketService.ts';
import { Loggable, type WithDebugOptions } from '@/utils';

const chatUrl = import.meta.env.VITE_MIK_API_URL;

export class ChatController extends Loggable implements IChatController {
  private readonly routeStateClient: IAppRouteStateClient;

  private readonly chatModel: ChatModel;

  private socket?: WebSocket;

  constructor(
    options: WithDebugOptions<{
      chatModel: ChatModel;
      routeStateClient: IAppRouteStateClient;
    }>,
  ) {
    super(options);
    this.routeStateClient = options.routeStateClient;
    this.chatModel = options.chatModel;
  }

  public initialize(): typeof this {
    this.registerStateChangeUpdates();

    return this;
  }

  private registerStateChangeUpdates = (): void => {
    if (this.routeStateClient.state.state === '/chat') {
      this.initializeChatModel(this.routeStateClient.state.data).catch(this.logger?.warn);
    }
    this.routeStateClient.onStateEnter('/chat', (e) => {
      if (e.to.state === '/chat') {
        this.initializeChatModel(e.to.data).catch(this.logger?.warn);
      }
    });
  };

  private initializeChatModel = async (userdata: IUserData): Promise<void> => {
    this.logger?.info('initializing...');
    const s = await socketService.getWebSocket(chatUrl);
    if (E.isRight(s)) {
      this.setWebSocket(s.right);
      const e = await login(userdata, s.right)();
      if (E.isRight(e)) {
        this.chatModel.emit('onLogin', e.right);
      }
    }
  };

  private setWebSocket = (socket: WebSocket): void => {
    if (this.socket) {
      // TODO AR remove listeners
    }
    this.socket = socket;
    if (this.socket) {
      // TODO AR add listeners
    }
  };
}
