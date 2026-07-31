/** Default landing page after auth when no deep-link `from` is present. */
export function postAuthHome(role?: string | null): string {
  return role === 'admin' ? '/admin' : '/plans';
}

export function resolvePostAuthPath(role?: string | null, from?: string | null): string {
  if (from && from.startsWith('/') && !from.startsWith('/login') && !from.startsWith('/register')) {
    return from;
  }

  return postAuthHome(role);
}
