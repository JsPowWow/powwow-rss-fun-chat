import { EventEmitter } from '@powwow-js/emitter';

import type { UserLoginMessage, UsersListMessage } from '@/api/chatSocketApi.ts';
import type { Nullable } from '@/utils';

export type ChatModelEventMap = { onLogin: UserLoginMessage; onUsersList: UsersListMessage };

export class ChatModel extends EventEmitter<ChatModelEventMap> {
  private userLoginStatus: Nullable<UserLoginMessage>;

  private usersList: Map<string, UserLoginMessage['payload']['user']> = new Map<
    string,
    UserLoginMessage['payload']['user']
  >();

  constructor() {
    super();
    this.registerOwnListeners();
  }

  public set loginStatus(value: Nullable<UserLoginMessage>) {
    this.userLoginStatus = value;
  }

  public get loginStatus(): Nullable<UserLoginMessage> {
    return this.userLoginStatus;
  }

  public getUsers(): Array<UserLoginMessage['payload']['user']> {
    return Array.from(this.usersList.values());
  }

  public get usersCount(): number {
    return this.usersList.size;
  }

  private registerOwnListeners = (): void => {
    this.on('onLogin', (eventData) => {
      this.usersList.set(eventData.payload.user.login, eventData.payload.user);
    });
    this.on('onUsersList', (eventData) => {
      eventData.payload.users.forEach((user) => this.usersList.set(user.login, user));
    });
  };
}
