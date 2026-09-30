import { test, expect } from '@playwright/test';

import { DEMO_ADMIN, DEMO_USER, loginAs } from './helpers';

test.describe('FLOW-04 admin access', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
  });

  test('admin can open settings', async ({ page }) => {
    await loginAs(page, DEMO_ADMIN.email, DEMO_ADMIN.password);
    await page.goto('/admin/settings');
    await expect(page.getByRole('heading', { name: /app settings/i })).toBeVisible();
    await expect(page.getByLabel(/free plans per month/i)).toBeVisible();
  });

  test('non-admin is redirected from admin', async ({ page }) => {
    await loginAs(page, DEMO_USER.email, DEMO_USER.password);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/plans/);
  });
});
