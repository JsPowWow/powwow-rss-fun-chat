import { FitAddon } from '@xterm/addon-fit';
import { match } from 'ts-pattern';
import { Terminal } from 'xterm';

import { Component, SimpleShellComponent } from '@/components';
import type { ChatModel } from '@/models/ChatModel.ts';
import type { ShellCommandProcessor } from '@/packages/components/simpleShell/addon/SimpleCmdShellConsole.ts';

import classes from './ChatPage.module.css';

export class ChatPage extends Component<'div'> {
  public static ID = 'chat-page';

  public static create = (chat: ChatModel): ChatPage => new ChatPage(chat);

  private readonly chatModel: ChatModel;

  private readonly logTerminal: Terminal;

  private constructor(chat: ChatModel) {
    super('div', { id: ChatPage.ID });
    this.chatModel = chat;
    this.toggleClass(classes.chatPage);
    this.appendChild(new SimpleShellComponent(this.processShellCommands).toggleClass(classes.shell));

    this.logTerminal = this.createShellTerminal();

    this.initialize();
  }

  public initialize(): typeof this {
    this.chatModel.on('onLogin', (event) => {
      this.logTerminal.write(
        `${event.type.padEnd(20)}\t${event.payload.user.login.padEnd(20)}\t${event.payload.user.isLogined ? 'is online' : 'is offline'}\r\n`,
      );
    });
    this.chatModel.on('onUsersList', (event) => {
      this.logTerminal.write(`${event.type.padEnd(20)}\t${'amount'.padEnd(20)}\t${this.chatModel.usersCount}\r\n`);
    });
    return this;
  }

  private processShellCommands: ShellCommandProcessor = (command) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return <ReturnType<ShellCommandProcessor>>[
      match(command)
        .with('status', () =>
          this.chatModel.loginStatus
            ? Promise.resolve(`${JSON.stringify(this.chatModel.loginStatus.payload.user)}`)
            : Promise.resolve('Unknown status'),
        )
        .with('users', () =>
          this.chatModel.usersCount > 0
            ? this.chatModel
                .getUsers()
                .map((u) => `${u.login.padEnd(20)}\t${u.isLogined ? 'is online' : 'is offline'}`)
                .map((s) => Promise.resolve(s))
            : Promise.resolve('No users yet, check later'),
        )
        .with('users count', () => Promise.resolve(`users count is: ${this.chatModel.usersCount}`))
        .with('help', () =>
          Promise.resolve(
            `status - to get current user login status.\r\nusers - list of all active & inactive users.\r\nusers count - amount of active & inactive users.`,
          ),
        )
        .otherwise(() => [
          Promise.resolve(`unresolved command: "${command}";\r\nUse "help" to get list available commands`),
        ]),
    ].flat(Number.MAX_SAFE_INTEGER);
  };

  private createShellTerminal(): Terminal {
    const term = new Terminal({
      convertEol: true,
      rows: 15,
      cols: 80,
      cursorInactiveStyle: 'none',
      cursorStyle: 'underline',
      disableStdin: true,
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    const logTerminalParent = this.appendChild(new Component('div').toggleClass(classes.logTerminalWrapper));
    term.open(logTerminalParent.element);
    fitAddon.fit();
    logTerminalParent.observe(() => fitAddon.fit());
    return term;
  }
}
