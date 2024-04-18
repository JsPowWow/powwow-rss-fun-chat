import type { Terminal } from 'xterm';

import type { Nullable } from '@/utils';
import { assertIsNonNullable } from '@/utils';

import type { ShellCommandProcessor } from './SimpleCmdShellConsole.ts';
import { SimpleCmdShellConsole } from './SimpleCmdShellConsole.ts';

export class SimpleShellAddon {
  private shell?: SimpleCmdShellConsole;

  private cmdProcessing: Nullable<ShellCommandProcessor>;

  constructor(cmdProcessing: ShellCommandProcessor) {
    this.cmdProcessing = cmdProcessing;
  }

  public get cmdConsole(): SimpleCmdShellConsole {
    return this.shell!;
  }

  public activate(terminal: Terminal): void {
    assertIsNonNullable(this.cmdProcessing);
    this.shell = new SimpleCmdShellConsole(terminal, this.cmdProcessing);
  }

  public dispose(): void {
    if (this.shell) {
      this.shell.dispose();
    }
    this.cmdProcessing = null;
  }
}
