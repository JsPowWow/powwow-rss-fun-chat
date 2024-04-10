import { AppPageStateController } from './AppPageStateController.ts';

describe('AppPageStateController tests', () => {
  test('should initialized and goto "/login" when not-authorized', () => {
    const c = new AppPageStateController(window.document.body).initialize();
    expect(c.appStateClient.state.state).toBe('/login');
  });

  test('should initialized and goto "/"->"/chat" when authorized', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => '{"username":"test","password":"test-password"}');
    const c = new AppPageStateController(window.document.body).initialize();
    expect(c.appStateClient.state.state).toBe('/chat');
  });
});
