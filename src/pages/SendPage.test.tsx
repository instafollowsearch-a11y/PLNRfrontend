import { describe, expect, it } from 'vitest';

describe('send form validation', () => {
  function validateSendForm(email: string, phone: string): string | null {
    if (!email.trim()) {
      return 'Email is required.';
    }

    if (!phone.trim()) {
      return 'Phone number is required.';
    }

    return null;
  }

  it('requires email and phone', () => {
    expect(validateSendForm('', '')).toBe('Email is required.');
    expect(validateSendForm('a@b.com', '')).toBe('Phone number is required.');
    expect(validateSendForm('a@b.com', '+15551234567')).toBeNull();
  });
});
