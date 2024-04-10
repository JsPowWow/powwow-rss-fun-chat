import { assertIsLeft, assertIsRight } from '@/packages/fp-ts-utils';

import { getStoredAuthData } from './auth.ts';

describe('session storage "auth" tests', () => {
  test('should handle storage get-item RTE', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('getItem mocked error');
    });
    const e = getStoredAuthData();
    assertIsLeft(e);
    expect(e.left).toBeInstanceOf(Error);
    expect(e.left.message).toBe('getItem mocked error');
  });

  test('should handle storage getItem nullish value', () => {
    const e = getStoredAuthData();
    assertIsLeft(e);
    expect(e.left).toBeInstanceOf(Error);
    expect(e.left.message).toContain('Invalid value');
  });

  it('should handle storage getItem empty value', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => '');
    const e = getStoredAuthData();
    assertIsLeft(e);
    expect(e.left).toBeInstanceOf(Error);
    expect(e.left.message).toContain('Invalid value');
  });

  it('should handle storage getItem no-json value', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => '[1, 2, 3, 4,]');
    const e = getStoredAuthData();
    assertIsLeft(e);
    expect(e.left).toBeInstanceOf(Error);
    expect(e.left.message).toContain('is not valid JSON');
  });

  it('should handle storage getItem no-user-schema value', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => '{"userName":"test","passWord":"test2"}');
    const e = getStoredAuthData();
    assertIsLeft(e);
    expect(e.left).toBeInstanceOf(Error);
    expect(e.left.message).toContain('Invalid value');
  });

  it('should get stored user auth data', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => '{"username":"test","password":"test-password"}');
    const e = getStoredAuthData();

    assertIsRight(e);

    expect(e.right.authorized).toBe(true);
    expect(e.right.username).toBe('test');
    expect(e.right.password).toBe('test-password');
  });
});
