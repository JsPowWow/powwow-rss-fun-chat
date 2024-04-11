import type { DebugOption, ILogger } from '@/logger';
import { identity } from '@/packages/utils/commonUtils.ts';

export class Loggable {
  protected logger?: ILogger;

  constructor(options?: DebugOption) {
    if (options?.debug) {
      this.logger = options.logger;
    }
  }

  public setLogger = (logger: ILogger): ILogger => {
    this.logger = logger;
    return this.logger;
  };

  protected log: ILogger['log'] = (message: string, logLevel) => {
    return this.logger?.log(message, logLevel) ?? identity;
  };
}
