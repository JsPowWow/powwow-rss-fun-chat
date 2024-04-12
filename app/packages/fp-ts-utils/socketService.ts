import * as E from 'fp-ts/Either';
import { constant, pipe } from 'fp-ts/function';
import type { IO } from 'fp-ts/IO';
import type { IOEither } from 'fp-ts/IOEither';
import * as O from 'fp-ts/Option';
import * as Task from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';

import type { ILogger } from '@/utils';

type PendingWebSocket = Promise<E.Either<ConnectionError, WebSocket>>;

export interface ConnectionError {
  readonly type:
    | 'Connection timed out'
    | 'Invalid url'
    | 'The server responded with a connection error'
    | 'Connection has been closed';
  readonly timestamp: number;
}

const WEB_SOCKETS: Map<string, PendingWebSocket> = new Map();

let logger: ILogger;

const getStoredWebSocket = (url: string): IO<O.Option<PendingWebSocket>> => {
  return () => {
    return O.fromNullable(WEB_SOCKETS.get(url));
  };
};

const storeNewWebSocket = (
  url: string,
  ws: E.Either<ConnectionError, WebSocket>,
): IOEither<ConnectionError, WebSocket> => {
  return () => {
    WEB_SOCKETS.set(url, Promise.resolve(ws));
    return ws;
  };
};
const storePendingWebSocket = (url: string) => {
  return <WS extends PendingWebSocket>(ws: WS): WS => {
    WEB_SOCKETS.set(url, ws);
    return ws;
  };
};

const createWebSocket = (url: string): TE.TaskEither<ConnectionError, WebSocket> => {
  const promise: PendingWebSocket = new Promise((resolve, reject) => {
    const ws = new WebSocket(url);

    ws.addEventListener('open', (_e) => {
      logger?.info('Connected', url);
      resolve(E.right(ws));
    });
    ws.addEventListener('error', (e) => {
      logger?.warn('Connection error', url, e);
      reject(
        E.left({
          type: 'The server responded with a connection error',
          timestamp: performance.now(),
        }),
      );
    });
    // TODO AR clear cache on close, error
  });
  logger?.info('createWebSocket', url);

  return (): PendingWebSocket => pipe(promise, storePendingWebSocket(url));
};

const getWebSocket = (url: string): TE.TaskEither<ConnectionError, WebSocket> => {
  return pipe(
    Task.fromIO(getStoredWebSocket(url)),
    Task.chain((ws) =>
      O.isSome(ws)
        ? constant(ws.value)
        : pipe(
            createWebSocket(url),
            Task.chain((newWS) => TE.fromIOEither(storeNewWebSocket(url, newWS))),
          ),
    ),
  );
};

export const socketService = {
  setLogger: (serviceLogger: ILogger): ILogger => {
    logger = serviceLogger;
    return logger;
  },
  getWebSocket: (url: string): PendingWebSocket => pipe(url, getWebSocket, (e) => e()),
};
