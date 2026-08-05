import { describe, expect, it } from 'vitest';

import {
  extractInviteToken,
  isInvitePath,
  resolveRegisterPrefill,
} from './inviteHelpers';

describe('inviteHelpers', () => {
  it('resolves register prefill from location state', () => {
    expect(
      resolveRegisterPrefill({
        email: ' friend@example.com ',
        invite_token: 'abc123',
        emailPrefillReadonly: true,
        from: '/invite/abc123',
      }),
    ).toEqual({
      email: 'friend@example.com',
      invite_token: 'abc123',
      emailPrefillReadonly: true,
      from: '/invite/abc123',
    });
  });

  it('ignores invalid register prefill state', () => {
    expect(resolveRegisterPrefill(undefined)).toEqual({});
    expect(resolveRegisterPrefill({ email: '   ' })).toEqual({});
  });

  it('detects invite paths and extracts tokens', () => {
    expect(isInvitePath('/invite/token-123')).toBe(true);
    expect(isInvitePath('/plans')).toBe(false);
    expect(extractInviteToken('/invite/token-123')).toBe('token-123');
    expect(extractInviteToken('/plans')).toBeNull();
  });
});
