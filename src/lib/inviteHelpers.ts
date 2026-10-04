export type RegisterLocationState = {
  email?: string;
  invite_token?: string;
  emailPrefillReadonly?: boolean;
  from?: string;
  proCheckout?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Normalizes react-router location state for invite registration prefill.
 */
export function resolveRegisterPrefill(state: unknown): RegisterLocationState {
  if (!isRecord(state)) {
    return {};
  }

  const result: RegisterLocationState = {};

  if (typeof state.email === 'string' && state.email.trim()) {
    result.email = state.email.trim();
  }

  if (typeof state.invite_token === 'string' && state.invite_token.trim()) {
    result.invite_token = state.invite_token.trim();
  }

  if (state.emailPrefillReadonly === true) {
    result.emailPrefillReadonly = true;
  }

  if (typeof state.from === 'string' && state.from.startsWith('/')) {
    result.from = state.from;
  }

  if (state.proCheckout === true) {
    result.proCheckout = true;
  }

  return result;
}

export function isInvitePath(path: string | null | undefined): boolean {
  return Boolean(path?.startsWith('/invite/'));
}

export function extractInviteToken(path: string): string | null {
  if (!path.startsWith('/invite/')) {
    return null;
  }

  const token = path.slice('/invite/'.length).split('/')[0]?.trim();

  return token || null;
}
