export function googleWebClientId(): string | null {
  const value = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  return trimmed === '' ? null : trimmed;
}
