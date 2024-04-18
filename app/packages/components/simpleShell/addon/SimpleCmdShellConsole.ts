import ansi from 'ansi-escape-sequences';
import type { IDisposable, Terminal } from 'xterm';

import { getErrorMessage } from '@/packages/utils/errorWithMessage.ts';
import type { ILogger, Nullable } from '@/utils';
import { getLogger, identity } from '@/utils';

import {
  ARROW_KEYS,
  ENTER_KEY,
  KEY_BACKSPACE,
  KEY_DOWN,
  KEY_LEFT,
  KEY_RIGHT,
  KEY_UP,
  red,
  reset,
  yellow,
} from './consoleConstants.ts';

const getPathLine = (): string => `${ansi.styles('blue')}~$`;

export type ShellCommandOutput = string;

export type ShellCommandProcessor = (command: string) => Array<Promise<ShellCommandOutput>>;

export class SimpleCmdShellConsole implements IDisposable {
  private readonly term: Terminal;

  private inputEnabled = true;

  private shellListener: IDisposable;

  private lineBuffer: Array<string> = [];

  private history: Array<string> = [];

  private offset = 0;

  private logger: ILogger;

  private cmdProcessing: Nullable<ShellCommandProcessor>;

  constructor(terminal: Terminal, commander: ShellCommandProcessor) {
    this.term = terminal;
    this.cmdProcessing = commander;
    this.shellListener = terminal.onData(this.simpleShell);
    this.logger = getLogger('SimpleCmdShell');
    this.termWriteUserPrompt();
  }

  public dispose(): void {
    this.term.dispose();
    this.shellListener.dispose();
    this.cmdProcessing = null;
    this.lineBuffer.length = 0;
    this.history.length = 0;
    this.offset = 0;
  }

  public writeMessage = (message: string): typeof this => {
    this.termToNextLine();
    this.term.write(`${ansi.format(message, ['yellow'])}`);
    this.termToNextLine();
    this.termWriteUserPrompt();
    return this;
  };

  private async *executeCommand(command: string): AsyncGenerator<string> {
    // yield Promise.resolve(`Executing...`);
    if (this.cmdProcessing) {
      const execSteps = this.cmdProcessing(command);
      for (let i = 0; i < execSteps.length; i += 1) {
        yield execSteps[i].catch(identity); // TODO AR to term error string
      }
    }
    // yield Promise.resolve(`Done "${command}"`);
  }

  private simpleShell = (data: string): void => {
    if (!this.inputEnabled) {
      return;
    }
    for (let i = 0; i < data.length; ++i) {
      const c = data[i];
      if (c === ENTER_KEY) {
        this.processEnterKey();
      } else if (c === KEY_BACKSPACE) {
        this.processBackspace();
      } else if (ARROW_KEYS.includes(data.slice(i, i + 3))) {
        this.processArrowKeys(data.slice(i, i + 3));
        i += 2;
      } else {
        if (data.charCodeAt(0) < 32 || data.charCodeAt(0) === 127) {
          return;
        }
        this.processUserInput(c);
      }
    }
  };

  private doExecCommand = async (command: string): Promise<void> => {
    try {
      // temporarily detach the shell listener, but re-attach after the command was finished
      // this.shellListener.dispose();
      this.inputEnabled = false;
      // eslint-disable-next-line no-restricted-syntax
      for await (const output of this.executeCommand(command)) {
        this.termWriteCmdExecOutput(output);
        this.termToNextLine();
      }
    } catch (e) {
      this.termToNextLine(false);
      this.termWriteCmdExecError(e);
      this.termToNextLine();
    } finally {
      // in any case re-attach shell
      this.inputEnabled = true;
      // this.shellListener = this.term.onData(this.simpleShell);
    }
  };

  private processUserInput = (c: string): void => {
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
    this.termWriteUserInput(termInsert);
  };

  private processEnterKey = (): void => {
    // <Enter> was pressed case
    this.offset = 0;
    this.termToNextLine();
    if (this.lineBuffer.length) {
      const command = this.lineBuffer.join('');
      this.history.push(command);
      this.lineBuffer.length = 0;
      this.doExecCommand(command)
        .then(() => this.termToNextLine(false).termWriteUserPrompt())
        .catch(this.logger.error);
    } else {
      this.termToNextLine(false).termWriteUserPrompt();
    }
  };

  private processArrowKeys = (key: string): void => {
    // <arrow> keys pressed
    if (key === KEY_UP) {
      // UP pressed
      // TODO select backwards from history + erase terminal line + write history entry
    } else if (key === KEY_DOWN) {
      // DOWN pressed
      // TODO select forward from history + erase terminal line + write history entry
    } else if (key === KEY_RIGHT) {
      if (this.offset < 0) {
        this.term.write(ansi.cursor.forward(1));
        this.offset++;
      }
    } else if (key === KEY_LEFT) {
      if (Math.abs(this.offset) < this.lineBuffer.length) {
        this.term.write(ansi.cursor.back(1));
        this.offset--;
      }
    }
  };

  private processBackspace = (): void => {
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

        this.term.write(`\b \b${insert} \b \b${lefts}`);
      }
    }
  };

  private termWriteUserInput = (input: string): typeof this => {
    this.term.write(`${ansi.format(input, ['white', 'bold'])}`);
    return this;
  };

  private termWriteUserPrompt = (): typeof this => {
    this.term.write(`${ansi.format('funny-chat', ['green', 'bold'])}${ansi.styles('white')}:${getPathLine()}${reset} `);
    return this;
  };

  private termToNextLine = (linefeed = true): typeof this => {
    this.term.write(`\r${linefeed ? '\n' : ''}`);
    return this;
  };

  private termWriteCmdExecError = (e: unknown): typeof this => {
    const msg = getErrorMessage(e);
    this.term.write(`${red}${msg.replace('\n', '\r\n')}${reset}`);
    return this;
  };

  private termWriteCmdExecOutput = (output: string): typeof this => {
    this.term.write(`${yellow}${output.replace('\n', '\r\n')}${reset}`);
    return this;
  };
}
