import { beforeAll } from 'vitest';
import { Registry } from './registry.ts';
import { AppPageStateController } from './AppPageStateController.ts';

describe('AppPageStateController tests', () => {
  beforeAll(() => new Registry().initialize);

  test('should initialized and goto "/login" when not-authorized', () => {
    const c = new AppPageStateController({
      appState: Registry.AppState.instance,
      appStateClient: Registry.AppStateClient.instance,
      credentialsService: Registry.CredentialsService.instance,
    }).initialize();
    expect(c.appStateClient.state.state).toBe('/login');
  });

  test('should initialized and goto "/"->"/chat" when authorized', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => '{"username":"test","password":"test-password"}');
    const c = new AppPageStateController({
      appState: Registry.AppState.instance,
      appStateClient: Registry.AppStateClient.instance,
      credentialsService: Registry.CredentialsService.instance,
    }).initialize();
    expect(c.appStateClient.state.state).toBe('/chat');
  });
});
