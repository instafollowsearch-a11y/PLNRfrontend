import { test, expect } from '@playwright/test';

import { DEMO_ADMIN, DEMO_USER, expectDesktopNoHamburger, loginAs } from './helpers';

test.describe('UI-01 / UI-02 desktop landing nav', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
  });

  test('UI-01 guest desktop header has account links and no hamburger', async ({ page }) => {
    await page.goto('/');
    await expectDesktopNoHamburger(page);

    const accountNav = page.getByRole('navigation', { name: /account navigation/i });
    await expect(accountNav.getByRole('link', { name: /^log in$/i })).toBeVisible();
    await expect(accountNav.getByRole('link', { name: /create account/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /start planning$/i }).first()).toBeVisible();
    await expect(page.getByRole('navigation', { name: /landing navigation/i })).toBeVisible();
  });

  test('UI-02 logged-in user sees My plans without hamburger', async ({ page }) => {
    await loginAs(page, DEMO_USER.email, DEMO_USER.password);
    await page.goto('/');
    await expectDesktopNoHamburger(page);

    const accountNav = page.getByRole('navigation', { name: /account navigation/i });
    await expect(accountNav.getByRole('link', { name: /my plans/i })).toBeVisible();
    await expect(accountNav.getByRole('button', { name: /log out/i })).toBeVisible();
    await expect(accountNav.getByRole('link', { name: /^log in$/i })).toHaveCount(0);
  });

  test('UI-02b admin sees Admin link', async ({ page }) => {
    await loginAs(page, DEMO_ADMIN.email, DEMO_ADMIN.password);
    await page.goto('/');
    await expectDesktopNoHamburger(page);

    const accountNav = page.getByRole('navigation', { name: /account navigation/i });
    await expect(accountNav.getByRole('link', { name: /^admin$/i })).toBeVisible();
  });

  test('UI-04 app flow chrome keeps logo and desktop account nav', async ({ page }) => {
    await page.goto('/plan/night_out');
    await expectDesktopNoHamburger(page);
    await expect(page.getByRole('link', { name: /^plnr$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /go back/i })).toBeVisible();
    await expect(page.getByRole('navigation', { name: /account navigation/i })).toBeVisible();
  });
});
