import { expect } from 'vitest';
import { describe, it } from 'vitest';

import { postAuthHome, resolvePostAuthPath } from './postAuthPath';

describe('postAuthPath', () => {
  it('sends admins to /admin and users to /plans', () => {
    expect(postAuthHome('admin')).toBe('/admin');
    expect(postAuthHome('user')).toBe('/plans');
    expect(postAuthHome(null)).toBe('/plans');
  });

  it('prefers a deep-link from path when present', () => {
    expect(resolvePostAuthPath('admin', '/admin/settings')).toBe('/admin/settings');
    expect(resolvePostAuthPath('user', '/plans')).toBe('/plans');
    expect(resolvePostAuthPath('user', '/weekend')).toBe('/weekend');
    expect(resolvePostAuthPath('admin', '/login')).toBe('/admin');
  });

  it('still returns invite from paths (login accepts explicitly; register must not use this for invites)', () => {
    expect(resolvePostAuthPath('user', '/invite/abc')).toBe('/invite/abc');
  });
});
