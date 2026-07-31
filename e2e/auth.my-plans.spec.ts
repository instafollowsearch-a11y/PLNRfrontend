import { test, expect } from '@playwright/test';

import { DEMO_USER, loginAs } from './helpers';

test.describe('FLOW-02 / AUTH-01 auth and my plans', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
  });

  test('user can open My plans and log out from header', async ({ page }) => {
    await loginAs(page, DEMO_USER.email, DEMO_USER.password);
    await expect(page).toHaveURL(/\/plans/);
    await expect(page.getByRole('heading', { name: /my plans/i }).first()).toBeVisible();

    await page.goto('/');
    await page
      .getByRole('navigation', { name: /account navigation/i })
      .getByRole('button', { name: /log out/i })
      .click();

    await expect(
      page.getByRole('navigation', { name: /account navigation/i }).getByRole('link', { name: /^log in$/i }),
    ).toBeVisible();
  });
});
