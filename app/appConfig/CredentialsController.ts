import type { IAppCredentialsController, IAppCredentialsService, IAppRouteStateClient } from '@/appConfig/types.ts';
import { Loggable, type WithDebugOptions } from '@/utils';

export class CredentialsController extends Loggable implements IAppCredentialsController {
  private readonly routeStateClient: IAppRouteStateClient;

  private readonly credentialsService: IAppCredentialsService;

  constructor(
    options: WithDebugOptions<{
      routeStateClient: IAppRouteStateClient;
      credentialsService: IAppCredentialsService;
    }>,
  ) {
    super(options);
    this.routeStateClient = options.routeStateClient;
    this.credentialsService = options.credentialsService;
  }

  public initialize(): typeof this {
    this.registerStateChangeUpdates();
    return this;
  }

  private registerStateChangeUpdates = (): void => {
    this.routeStateClient.onStateLeave('/login', (e) => {
      if (e.by.action === 'authorized' && e.to.state === '/chat') {
        const userData = e.to.data;
        this.credentialsService.saveUserName(userData.username);
        this.credentialsService.saveUserData(userData);
      }
    });
    // TODO AR do creds. clear on logout
  };
}
