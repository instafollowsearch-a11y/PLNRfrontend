import { test, expect, type Page } from '@playwright/test';

import { DEMO_ADMIN, DEMO_USER, loginViaForm } from './helpers';

async function pageErrors(page: Page): Promise<string[]> {
  return page.locator('.error-text').allInnerTexts();
}

test.describe('Admin portal check', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
  });

  test('signed-out visitor is sent to login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /log in/i })).toBeVisible();
  });

  test('admin can open dashboard, users, visits, and settings', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    await loginViaForm(page, DEMO_ADMIN.email, DEMO_ADMIN.password);
    await expect(page).toHaveURL(/\/admin$/);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Admin' })).toBeVisible();
    await expect(page.getByText('Unable to load admin stats.')).toHaveCount(0);

    const stats = await page.locator('.admin-stats__item').allInnerTexts();
    const dashboardHeading = await page.getByRole('heading', { level: 1 }).innerText();
    console.log('DASHBOARD_HEADING', dashboardHeading);
    console.log('DASHBOARD_STATS', JSON.stringify(stats));

    const adminNav = page.getByRole('navigation', { name: 'Admin' });
    await adminNav.getByRole('link', { name: 'Users' }).click();
    await expect(page).toHaveURL(/\/admin\/users/);
    await expect(page.getByRole('heading', { name: 'Users', level: 1 })).toBeVisible();
    await expect(page.getByText('Unable to load users.')).toHaveCount(0);
    await expect(page.getByLabel('Search')).toBeVisible();
    const userCount = await page.locator('.admin-users__row').count();
    const userSummary = await page.locator('.admin-users__count').innerText();
    console.log('USER_SUMMARY', userSummary);
    console.log('USER_ROW_COUNT', userCount);
    console.log('USER_ERRORS', JSON.stringify(await pageErrors(page)));
    await expect(page.locator('.admin-users__row').or(page.getByText(/no users found/i)).first()).toBeVisible();

    await adminNav.getByRole('link', { name: 'Visits' }).click();
    await expect(page).toHaveURL(/\/admin\/visits/);
    await expect(page.getByRole('heading', { name: 'Visits', level: 1 })).toBeVisible();
    await expect(page.getByText(/unable to load visits/i)).toHaveCount(0);
    const visitCount = await page.locator('.admin-visits tbody tr').count();
    const visitSummary = await page.locator('.admin-users__count').innerText().catch(() => 'no count');
    console.log('VISIT_SUMMARY', visitSummary);
    console.log('VISIT_ROW_COUNT', visitCount);
    console.log('VISIT_ERRORS', JSON.stringify(await pageErrors(page)));

    await adminNav.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL(/\/admin\/settings/);
    await expect(page.getByRole('heading', { name: /app settings/i })).toBeVisible();
    await expect(page.getByLabel(/free plans per month/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /AI \(Anthropic\)/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /^Google$/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Find Local/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /save settings/i })).toBeVisible();
    const settingsText = await page.locator('main, .page-stack').first().innerText();
    console.log('SETTINGS_TEXT', settingsText.slice(0, 2500));
    console.log('CONSOLE_ERRORS', JSON.stringify(consoleErrors));
    expect(consoleErrors.filter((line) => !/favicon/i.test(line))).toEqual([]);
  });

  test('non-admin is redirected from admin', async ({ page }) => {
    await loginViaForm(page, DEMO_USER.email, DEMO_USER.password);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/plans/);
    await expect(page.getByRole('link', { name: 'Admin' })).toHaveCount(0);
  });
});
