import type { UserLoginMessage } from '@/api/chatSocketLoginApi.ts';
import { EventEmitter } from '@/event-emitter';

export type ChatModelEventMap = { onLogin: UserLoginMessage };

export class ChatModel extends EventEmitter<ChatModelEventMap> {}
