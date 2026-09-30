import { test, expect } from '@playwright/test';

import { DEMO_ADMIN, DEMO_USER, loginAs, loginViaForm } from './helpers';

test.describe('Batch 12 modern UI smoke', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
  });

  test('auth layout shows brand panel and form on login/register', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('complementary', { name: /plnr/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.locator('.auth-layout__logo')).toHaveText('PLNR');

    await page.goto('/register');
    await expect(page.getByRole('complementary', { name: /plnr/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
    await expect(page.getByLabel('Name')).toBeVisible();
  });

  test('privacy and terms render real prose content', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('article').getByRole('heading', { name: /^privacy$/i })).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: /do not sell your personal information/i })).toBeVisible();

    await page.goto('/terms');
    await expect(page.getByRole('article').getByRole('heading', { name: /terms of service/i })).toBeVisible();
    await expect(page.getByText(/AI-assisted starting points/i)).toBeVisible();
  });

  test('user can log in through the auth form', async ({ page }) => {
    await loginViaForm(page, DEMO_USER.email, DEMO_USER.password);
    await expect(page.getByRole('heading', { name: /my plans/i }).first()).toBeVisible();
  });

  test('funnel stepper is visible on questions', async ({ page }) => {
    await page.goto('/plan/night_out');
    await expect(page.getByRole('navigation', { name: /plan progress/i })).toBeVisible();
    await expect(page.getByText('Ask')).toBeVisible();
    await expect(page.getByText('Ideas')).toBeVisible();
    await expect(page.getByText('Send')).toBeVisible();
  });

  test('my plans page loads with start CTA after login', async ({ page }) => {
    await loginAs(page, DEMO_USER.email, DEMO_USER.password);
    await expect(page.getByRole('heading', { name: /my plans/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /start a new plan/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /back to home/i })).toHaveCount(0);
  });

  test('admin subnav links work across dashboard users settings', async ({ page }) => {
    await loginAs(page, DEMO_ADMIN.email, DEMO_ADMIN.password);
    await page.goto('/admin');
    await expect(page.getByRole('navigation', { name: /^admin$/i })).toBeVisible();
    await expect(page.getByText(/plans today/i)).toBeVisible();

    await page.getByRole('navigation', { name: /^admin$/i }).getByRole('link', { name: /^users$/i }).click();
    await expect(page).toHaveURL(/\/admin\/users/);
    await expect(page.getByRole('main').getByRole('heading', { name: /^users$/i })).toBeVisible();

    await page.getByRole('navigation', { name: /^admin$/i }).getByRole('link', { name: /^settings$/i }).click();
    await expect(page).toHaveURL(/\/admin\/settings/);
    await expect(page.getByLabel(/free plans per month/i)).toBeVisible();
  });

  test('landing keeps PLNR as hero-level brand', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.landing-hero__brand')).toHaveText('PLNR');
    await expect(page.getByRole('heading', { level: 1, name: /plan unforgettable outings/i })).toBeVisible();
  });
});
