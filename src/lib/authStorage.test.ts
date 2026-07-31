import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearAuthToken, getAuthToken, setAuthToken } from './authStorage';

describe('authStorage', () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    });
  });

  it('stores and clears the auth token', () => {
    expect(getAuthToken()).toBeNull();
    setAuthToken('token-123');
    expect(getAuthToken()).toBe('token-123');
    clearAuthToken();
    expect(getAuthToken()).toBeNull();
  });
});
