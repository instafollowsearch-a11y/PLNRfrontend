const TOKEN_KEY = 'plnr_auth_token';

function storage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    return localStorage;
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  try {
    return storage()?.getItem(TOKEN_KEY) ?? null;
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    storage()?.setItem(TOKEN_KEY, token);
  } catch {
    // Ignore storage failures (private mode / test stubs).
  }
}

export function clearAuthToken(): void {
  try {
    storage()?.removeItem(TOKEN_KEY);
  } catch {
    // Ignore storage failures (private mode / test stubs).
  }
}
