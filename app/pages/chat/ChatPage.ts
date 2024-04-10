import { Component } from '@/components';

import classes from './ChatPage.module.css';

export class ChatPage extends Component<'div'> {
  public static ID = 'chat-page';

  public static create = (): ChatPage => new ChatPage();

  constructor() {
    super('div', { id: ChatPage.ID });
    this.toggleClass(classes.chatPage);
    this.setTextContent('Chat Page');
  }
}
