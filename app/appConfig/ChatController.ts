import * as E from 'fp-ts/Either';
import { P, match } from 'ts-pattern';

import { login, parseUserListMessage, parseUserLoginMessage } from '@/api/chatSocketApi.ts';
import type { IAppRouteStateClient, IChatController, IUserData } from '@/appConfig/types.ts';
import type { ChatModel } from '@/models/ChatModel.ts';
import { socketService } from '@/packages/fp-ts-utils/socketService.ts';
import { Loggable, type WithDebugOptions, noop } from '@/utils';

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
      this.initializeChatModel(this.routeStateClient.state.data).catch(noop);
    }
    this.routeStateClient.onStateEnter('/chat', (e) => {
      if (e.to.state === '/chat') {
        this.initializeChatModel(e.to.data).catch(noop);
      }
    });
  };

  private initializeChatModel = async (userdata: IUserData): Promise<void> => {
    this.logger?.info('Initializing...');
    const s = await socketService.getWebSocket(chatUrl);
    if (E.isRight(s)) {
      this.setWebSocket(s.right);
      const e = await login(userdata, s.right)();
      if (E.isRight(e)) {
        this.chatModel.loginStatus = e.right;
        this.refreshUsers();
        this.logger?.info('Initialized.');
      } else {
        this.logger?.warn(`Login failed: ${userdata.username}: ${e.left.message}`);
      }
    } else {
      this.logger?.warn('WebSocket was not obtained');
    }
  };

  private refreshUsers = (): void => {
    if (this.socket) {
      this.socket.send(
        JSON.stringify({
          id: null,
          type: 'USER_ACTIVE',
          payload: null,
        }),
      );
      this.socket.send(
        JSON.stringify({
          id: null,
          type: 'USER_INACTIVE',
          payload: null,
        }),
      );
    }
  };

  private processSocketMessages = (event: MessageEvent<unknown>): void => {
    const loginResponse = parseUserLoginMessage(event);
    if (E.isRight(loginResponse)) {
      match(loginResponse.right)
        .with({ type: P.union('USER_LOGIN', 'USER_EXTERNAL_LOGIN', 'USER_LOGOUT', 'USER_EXTERNAL_LOGOUT') }, (data) => {
          this.chatModel.emit('onLogin', data);
        })
        .otherwise((other) => this.logger?.warn(other));
    }
    const usersResponse = parseUserListMessage(event);
    if (E.isRight(usersResponse)) {
      match(usersResponse.right)
        .with({ type: P.union('USER_ACTIVE', 'USER_INACTIVE') }, (data) => {
          this.chatModel.emit('onUsersList', data);
        })
        .otherwise((other) => this.logger?.warn(other));
    }
  };

  private setWebSocket = (socket: WebSocket): WebSocket => {
    if (this.socket) {
      this.socket.removeEventListener('message', this.processSocketMessages);
    }
    this.socket = socket;
    if (this.socket) {
      this.socket.addEventListener('message', this.processSocketMessages);
    }
    return this.socket;
  };
}
