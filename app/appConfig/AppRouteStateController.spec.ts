import { beforeAll } from 'vitest';
import { Registry } from './registry.ts';
import { AppRouteStateController } from './AppRouteStateController.ts';

describe('AppRouteStateController tests', () => {
  beforeAll(() => new Registry().initialize);

  test('should initialized and goto "/login" when not-authorized', () => {
    const c = new AppRouteStateController({
      routeState: Registry.AppState.instance,
      routeStateClient: Registry.AppStateClient.instance,
      credentialsService: Registry.CredentialsService.instance,
    }).initialize();
    expect(c.routeStateClient.state.state).toBe('/login');
  });

  test('should initialized and goto "/"->"/chat" when authorized', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => '{"username":"test","password":"test-password"}');
    const c = new AppRouteStateController({
      routeState: Registry.AppState.instance,
      routeStateClient: Registry.AppStateClient.instance,
      credentialsService: Registry.CredentialsService.instance,
    }).initialize();
    expect(c.routeStateClient.state.state).toBe('/chat');
  });
});
