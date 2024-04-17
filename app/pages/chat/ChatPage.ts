import { Component, SimpleShell } from '@/components';
import type { ChatModel } from '@/models/ChatModel.ts';

import classes from './ChatPage.module.css';

export class ChatPage extends Component<'div'> {
  public static ID = 'chat-page';

  public static create = (chat: ChatModel): ChatPage => new ChatPage(chat);

  private readonly chatModel: ChatModel;

  private readonly messages: SimpleShell;

  private constructor(chat: ChatModel) {
    super('div', { id: ChatPage.ID });
    this.chatModel = chat;
    this.toggleClass(classes.chatPage);
    this.messages = this.appendChild(new SimpleShell());
    this.initialize();
  }

  public initialize(): typeof this {
    // TODO add listeners

    return this;
  }
}
