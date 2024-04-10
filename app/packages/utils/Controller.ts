import type { ILogger, WithDebugOptions } from '@/logger';
import { identity } from '@/packages/utils/commonUtils.ts';

export class Controller {
  protected readonly logger?: ILogger;

  constructor(options?: WithDebugOptions<NonNullable<object>>) {
    if (options?.debug) {
      this.logger = options.logger;
    }
  }

  protected log: ILogger['log'] = (message: string, logLevel) => {
    return this.logger?.log(message, logLevel) ?? identity;
  };
}
