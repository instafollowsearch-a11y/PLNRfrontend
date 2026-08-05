import { describe, expect, it } from 'vitest';

describe('send form validation', () => {
  function validateSendForm(email: string): string | null {
    if (!email.trim()) {
      return 'Email is required.';
    }

    return null;
  }

  it('requires email', () => {
    expect(validateSendForm('')).toBe('Email is required.');
    expect(validateSendForm('a@b.com')).toBeNull();
  });
});
