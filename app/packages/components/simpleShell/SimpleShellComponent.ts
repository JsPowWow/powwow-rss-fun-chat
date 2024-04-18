import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from 'xterm';

import type {
  ShellCommandProcessor,
  SimpleCmdShellConsole,
} from '@/packages/components/simpleShell/addon/SimpleCmdShellConsole.ts';
import { SimpleShellAddon } from '@/packages/components/simpleShell/addon/SimpleShellAddon.ts';

import { Component } from '../Component';
import 'xterm/css/xterm.css';

export class SimpleShellComponent extends Component<'div'> {
  private readonly cmdProcessing: ShellCommandProcessor;

  private readonly shell: SimpleCmdShellConsole;

  constructor(commander: ShellCommandProcessor) {
    super('div');
    this.cmdProcessing = commander;
    this.shell = this.createShellTerminal();
  }

  public write = (message: string): typeof this => {
    this.shell.writeMessage(message);
    return this;
  };

  private createShellTerminal(): SimpleCmdShellConsole {
    const term = new Terminal({
      convertEol: true,
      rows: 25,
      cols: 80,
      cursorInactiveStyle: 'bar',
      cursorStyle: 'bar',
      cursorBlink: true,
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    const shell = new SimpleShellAddon(this.cmdProcessing);
    term.loadAddon(shell);

    term.open(this.element);
    this.observe(() => fitAddon.fit());

    return shell.cmdConsole;
  }
}
