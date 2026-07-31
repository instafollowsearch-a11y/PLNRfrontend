import { test, expect } from '@playwright/test';

test.describe('UI-03 mobile landing drawer', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile project only');
  });

  test('hamburger opens drawer with home auth privacy support', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: /open menu/i });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    const drawer = page.getByRole('dialog', { name: /menu/i });
    await expect(drawer.getByRole('link', { name: /^home$/i })).toBeVisible();
    await expect(drawer.getByRole('button', { name: /how it works/i })).toBeVisible();
    await expect(drawer.getByRole('button', { name: /^plans$/i })).toBeVisible();
    await expect(drawer.getByRole('link', { name: /^log in$/i })).toBeVisible();
    await expect(drawer.getByRole('link', { name: /create account/i })).toBeVisible();
    await expect(drawer.getByRole('link', { name: /^privacy$/i })).toBeVisible();
    await expect(drawer.getByRole('link', { name: /^support$/i })).toBeVisible();
  });
});
