import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

import { socketService } from '@/packages/fp-ts-utils/socketService.ts';
import type { DebugOption } from '@/utils';
import { Loggable } from '@/utils';

export class ChatModel extends Loggable {
  private readonly url: string;

  private socket?: WebSocket;

  constructor(url: string, options?: DebugOption) {
    super(options);
    this.url = url;
  }

  public initialize = async (): Promise<void> => {
    this.logger?.info('initializing...');
    pipe(
      await socketService.getWebSocket(this.url),
      E.map(this.log('got webSocket')),
      E.fold(this.log('no webSocket', 'warn'), this.setWebSocket),
    );
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
