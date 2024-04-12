import { assertIsLeft, assertIsRight } from '@/packages/fp-ts-utils';
import { expect } from 'vitest';

import { webStorageCredentials as credentials } from './webStorageCredentialsService.ts';

describe('session storage "credentials.getStoredUserData" tests', () => {
  test('should handle storage get-item RTE', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('getItem mocked error');
    });
    const e = credentials.getStoredUserData();
    assertIsLeft(e);
    expect(e.left).toBeInstanceOf(Error);
    expect(e.left.message).toBe('getItem mocked error');
  });

  test('should handle storage getItem nullish value', () => {
    const e = credentials.getStoredUserData();
    assertIsLeft(e);
    expect(e.left).toBeInstanceOf(Error);
    expect(e.left.message).toContain('Invalid value');
  });

  it('should handle storage getItem empty value', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => '');
    const e = credentials.getStoredUserData();
    assertIsLeft(e);
    expect(e.left).toBeInstanceOf(Error);
    expect(e.left.message).toContain('Invalid value');
  });

  it('should handle storage getItem no-json value', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => '[1, 2, 3, 4,]');
    const e = credentials.getStoredUserData();
    assertIsLeft(e);
    expect(e.left).toBeInstanceOf(Error);
    expect(e.left.message).toContain('is not valid JSON');
  });

  it('should handle storage getItem no-user-schema value', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => '{"userName":"test","passWord":"test2"}');
    const e = credentials.getStoredUserData();
    assertIsLeft(e);
    expect(e.left).toBeInstanceOf(Error);
    expect(e.left.message).toContain('Invalid value');
  });

  it('should get stored user auth data', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => '{"username":"test","password":"test-password"}');
    const e = credentials.getStoredUserData();
    assertIsRight(e);
    expect(e.right.username).toBe('test');
    expect(e.right.password).toBe('test-password');
  });
});

describe('session storage "credentials.storeUserData" tests', () => {
  test('should handle storage set-item RTE', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('setItem mocked error');
    });
    const e = credentials.storeUserData({ username: 'test', password: 'testPwd' });
    assertIsLeft(e);
    expect(e.left).toBeInstanceOf(Error);
    expect(e.left.message).toBe('setItem mocked error');
  });

  test('should handle wrong input of userData', () => {
    const e = credentials.storeUserData({ username: '', password: '' });
    assertIsLeft(e);
    expect(e.left).toBeInstanceOf(Error);
    expect(e.left.message).toContain('Wrong input of userData');
  });

  test('should save userdata successfully', () => {
    const e = credentials.storeUserData({ username: 'test1', password: 'testPwd2' });
    assertIsRight(e);
    expect(sessionStorage.getItem('fun-chat')).toBe('{"username":"test1","password":"testPwd2"}');
  });
});

describe('local storage "credentials.storeUserName" tests', () => {
  test('should handle storage set-item RTE', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('setItem mocked error');
    });
    const e = credentials.storeUserName('test');
    assertIsLeft(e);
    expect(e.left).toBeInstanceOf(Error);
    expect(e.left.message).toBe('setItem mocked error');
  });

  test('should handle wrong input of userName', () => {
    const e = credentials.storeUserName('');
    assertIsLeft(e);
    expect(e.left).toBeInstanceOf(Error);
    expect(e.left.message).toContain('Wrong input of username');
  });

  test('should save username successfully', () => {
    const e = credentials.storeUserName('testName');
    assertIsRight(e);
    expect(localStorage.getItem('fun-chat')).toBe('{"username":"testName"}');
  });
});
