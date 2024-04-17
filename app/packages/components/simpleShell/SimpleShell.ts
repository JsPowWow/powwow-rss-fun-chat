import { FitAddon } from '@xterm/addon-fit';
import ansi from 'ansi-escape-sequences';
import type { IDisposable } from 'xterm';
import { Terminal } from 'xterm';

import { red, reset, yellow } from '@/packages/components/simpleShell/consoleColors.ts';
import { getPathLine } from '@/packages/components/simpleShell/utils.ts';
import { getErrorMessage } from '@/packages/utils/errorWithMessage.ts';
import { sleep } from '@/utils';

import { Component } from '../Component';
import 'xterm/css/xterm.css';

export class SimpleShell extends Component<'div'> {
  private readonly term: Terminal;

  private lineBuffer: Array<string> = [];

  private history: Array<string> = [];

  private offset = 0;

  private shellListener: IDisposable;

  constructor() {
    super('div');
    const { terminal, shellListener } = this.createTerminal();
    this.shellListener = shellListener;
    this.term = terminal;
    this.writePrompt();
  }

  private createTerminal(): { terminal: Terminal; shellListener: IDisposable } {
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

    term.open(this.element);
    fitAddon.fit();

    const shellListener = term.onData(this.simpleShell);

    return { terminal: term, shellListener };
  }

  private simpleShell = async (data: string): Promise<void> => {
    for (let i = 0; i < data.length; ++i) {
      const c = data[i];
      if (c === '\r') {
        // <Enter> was pressed case
        this.offset = 0;
        this.toNextLine();
        if (this.lineBuffer.length) {
          const command = this.doGetCommand();
          this.lineBuffer.length = 0;
          await this.doExecCommand(command);
          this.toNextLine();
          this.writePrompt();
        } else {
          this.toNextLine(false);
          this.writePrompt();
        }
      } else if (c === '\x7F') {
        // <Backspace> was pressed case
        this.doBackspace();
      } else if (['\x1b[A', '\x1b[B', '\x1b[C', '\x1b[D'].includes(data.slice(i, i + 3))) {
        this.doArrowKeypress(data.slice(i, i + 3));
        i += 2;
      } else {
        if (data.charCodeAt(0) < 32 || data.charCodeAt(0) === 127) {
          return;
        }

        // push everything else into the line buffer and echo back to user

        this.writeInput(this.doInputEcho(c));
      }
    }
  };

  // private *performCommand() {
  //   if (this.lineBuffer.length) {
  //     const command = this.doGetCommand();
  //     this.lineBuffer.length = 0;
  //     await this.doExecCommand(command);
  //     this.toNextLine();
  //     this.writePrompt();
  //   } else {
  //     this.toNextLine(false);
  //     this.writePrompt();
  //   }
  // }

  private async executeCommand(command: string): Promise<string> {
    await sleep(2700);
    return Promise.resolve(`Execute\n ${command} ...`);
  }

  private doInputEcho = (c: string): string => {
    let insert = '';
    insert += c;

    for (let ci = this.lineBuffer.length + this.offset; ci < this.lineBuffer.length; ci++) {
      insert += this.lineBuffer[ci];
    }

    let shift = '';

    if (this.offset < 0) {
      for (let ci = this.lineBuffer.length + this.offset; ci < this.lineBuffer.length; ci++) {
        shift += ansi.cursor.back(1);
      }
    }

    if (this.offset === 0) {
      this.lineBuffer.push(c);
    } else if (this.offset < 0) {
      this.lineBuffer.splice(this.lineBuffer.length + this.offset, 0, c);
    }

    let termInsert = insert;

    if (this.offset < 0) {
      termInsert += shift;
    }
    return termInsert;
  };

  private doExecCommand = async (command: string): Promise<void> => {
    try {
      // tricky part: for interactive sub commands you have to detach the shell listener
      // temporarily, and re-attach after the command was finished
      this.shellListener.dispose();
      const result = await this.executeCommand(command); // issue: cannot force-kill in JS (needs to be a good citizen)
      this.writeCommandOutput(result);
    } catch (e) {
      this.writeError(e);
    } finally {
      // in any case re-attach shell
      this.shellListener = this.term.onData(this.simpleShell);
    }
  };

  private doGetCommand = (): string => {
    // we have something in line buffer, normally a shell does its REPL logic here
    // for simplicity - just join characters and exec...
    const command = this.lineBuffer.join('');
    this.history.push(command);
    return command;
  };

  private doArrowKeypress = (key: string): void => {
    // <arrow> keys pressed
    if (key === '\x1b[A') {
      // UP pressed, select backwards from history + erase terminal line + write history entry
    } else if (key === '\x1b[B') {
      // DOWN pressed, select forward from history + erase terminal line + write history entry
    } else if (key === '\x1b[C') {
      if (this.offset < 0) {
        this.term.write(ansi.cursor.forward(1));
        this.offset++;
      }
    } else if (key === '\x1b[D') {
      if (Math.abs(this.offset) < this.lineBuffer.length) {
        this.term.write(ansi.cursor.back(1));
        this.offset--;
      }
    }
  };

  private doBackspace = (): void => {
    // <Backspace> was pressed case
    if (this.lineBuffer.length) {
      if (this.offset === 0) {
        this.lineBuffer.pop();
        this.term.write('\b \b');
      } else if (this.offset < 0 && Math.abs(this.offset) !== this.lineBuffer.length) {
        let insert = '';

        for (let ci = this.lineBuffer.length + this.offset; ci < this.lineBuffer.length; ci++) {
          insert += this.lineBuffer[ci];
        }

        this.lineBuffer.splice(this.lineBuffer.length + this.offset - 1, 1);

        let lefts = '';

        for (let ci = 0; ci < insert.length; ci++) {
          lefts += '\x1b[1D';
        }

        const termInsert = `\b \b${insert} \b \b${lefts}`;
        this.term.write(termInsert);
      }
    }
  };

  private writeInput = (input: string): void => {
    this.term.write(`${ansi.format(input, ['white', 'bold'])}`);
  };

  private writePrompt = (): void => {
    this.term.write(`${ansi.format('funny-chat', ['green', 'bold'])}${ansi.styles('white')}:${getPathLine()} `);
  };

  private toNextLine = (linefeed = true): void => {
    this.term.write(`\r${linefeed ? '\n' : ''}`);
  };

  private writeError = (e: unknown): void => {
    const msg = getErrorMessage(e);
    this.term.write(`${red}${msg.replace('\n', '\r\n')}${reset}`);
  };

  private writeCommandOutput = (output: string): void => {
    this.term.write(`${yellow}${output.replace('\n', '\r\n')}${reset}`);
  };
}
