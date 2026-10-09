import { test, expect } from '@playwright/test';

import { DEMO_USER, loginAs } from './helpers';

test.describe('Register, claim, and plan smoke', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
  });

  test('new user can register via form and land on My plans', async ({ page }) => {
    const email = `qa+reg${Date.now()}@plnr.test`;

    await page.goto('/register');
    await page.getByLabel('Name').fill('QA Tester');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByLabel('Confirm password').fill('password123');
    await page.getByRole('checkbox', { name: /terms and conditions of the plnr app/i }).check();
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page).toHaveURL(/\/plans/, { timeout: 20_000 });
    await expect(page.getByRole('heading', { name: /plans/i }).first()).toBeVisible();
  });

  test('date night questions reach gathering without booking copy', async ({ page }) => {
    await page.goto('/plan/date_night');
    await expect(page.getByRole('navigation', { name: /plan progress/i })).toBeVisible();
    await expect(page.getByText(/book/i)).toHaveCount(0);

    await page.getByRole('button', { name: /^man$/i }).first().click();
    await page.getByRole('button', { name: /continue/i }).click();

    await page.getByRole('button', { name: /^woman$/i }).first().click();
    await page.getByRole('button', { name: /continue/i }).click();

    await page.getByPlaceholder(/search for a city/i).fill('Austin');
    await page.getByRole('button', { name: /austin/i }).first().click({ timeout: 15_000 });
    await page.getByRole('button', { name: /continue/i }).click();

    // Timeframe datetime_range — fill date + times if present
    const dateInput = page.locator('input[type="date"]').first();
    if (await dateInput.isVisible().catch(() => false)) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateValue = tomorrow.toISOString().slice(0, 10);
      await dateInput.fill(dateValue);
      const timeInputs = page.locator('input[type="time"]');
      if ((await timeInputs.count()) >= 2) {
        await timeInputs.nth(0).fill('18:00');
        await timeInputs.nth(1).fill('22:00');
      }
      await page.getByRole('button', { name: /continue/i }).click();
    }

    await expect(page.getByText(/interests|budget|events/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('authenticated My plans has no booking language', async ({ page }) => {
    await loginAs(page, DEMO_USER.email, DEMO_USER.password);
    await expect(page.getByRole('heading', { name: /my plans/i }).first()).toBeVisible();
    await expect(page.getByText(/book this|payment method|stripe/i)).toHaveCount(0);
  });
});
