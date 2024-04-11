import { assertIsLeft, assertIsRight, getSessionStorageItem } from './index.ts';

// TODO AR
// setLocalStorageItem, setSessionStorageItem  tests

describe('session storage "getSessionStorageItem" tests', () => {
  it('should handle storage get-item RTE', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('getItem mocked error');
    });
    const e = getSessionStorageItem('fun-chat');
    assertIsLeft(e);
    expect(e.left).toBeInstanceOf(Error);
    expect(e.left.message).toBe('getItem mocked error');
  });

  it('should handle storage getItem nullish value', () => {
    const eNull = getSessionStorageItem('fun-chat');
    assertIsLeft(eNull);
    expect(eNull.left).toBeInstanceOf(Error);
    expect(eNull.left.message).toContain('Invalid value null supplied');
  });

  it('should handle storage getItem empty value', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => '');
    const eEmpty = getSessionStorageItem('fun-chat');
    assertIsLeft(eEmpty);
    expect(eEmpty.left).toBeInstanceOf(Error);
    expect(eEmpty.left.message).toContain('Invalid value "" supplied');
  });

  it('should get storage item value', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => 'fun-chat-item-value');
    const eString = getSessionStorageItem('fun-chat');
    assertIsRight(eString);
    expect(eString.right).toBe('fun-chat-item-value');
  });
});
