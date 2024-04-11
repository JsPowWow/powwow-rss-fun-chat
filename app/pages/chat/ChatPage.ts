import { Component } from '@/components';
import type { ChatModel } from '@/models/ChatModel.ts';
import { getLogger, noop } from '@/utils';

import classes from './ChatPage.module.css';

export class ChatPage extends Component<'div'> {
  public static ID = 'chat-page';

  public static create = (chat: ChatModel): ChatPage => new ChatPage(chat);

  private readonly chatModel: ChatModel;

  private constructor(chat: ChatModel) {
    super('div', { id: ChatPage.ID });
    this.chatModel = chat;
    this.toggleClass(classes.chatPage);
    this.setTextContent('Chat Page');
    this.initialize();
  }

  public initialize(): typeof this {
    this.chatModel.setLogger(getLogger('ChatModel'));
    this.chatModel.initialize().catch(noop);
    return this;
  }
}
