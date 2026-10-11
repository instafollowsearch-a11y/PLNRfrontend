import { API_URL } from './api';

export function googleWebClientId(): string | null {
  const value = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  return trimmed === '' ? null : trimmed;
}

export async function loadGoogleWebClientId(): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/google-sign-in`);

    if (response.ok) {
      const payload = (await response.json()) as { data?: { client_id?: unknown } };
      const clientId = payload.data?.client_id;

      if (typeof clientId === 'string' && clientId.trim() !== '') {
        return clientId.trim();
      }
    }
  } catch {
    // The login page still works from the Vite env value when the API is down.
  }

  return googleWebClientId();
}
