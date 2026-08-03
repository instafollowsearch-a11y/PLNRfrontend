import { test, expect } from '@playwright/test';

const API_URL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:8088/api/v1';

test.describe('Guest session claim', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
  });

  test('register after guest plan claims session into My plans', async ({ page, request }) => {
    const create = await request.post(`${API_URL}/plan-sessions`, {
      data: {
        plan_type: 'night_out',
        answers: {
          city: 'Austin',
          interests: 'Live jazz',
          group_size: 4,
          budget_per_person: 65,
          dates: 'Saturday',
          start_time: '8:00 PM',
        },
      },
    });
    expect(create.ok()).toBeTruthy();
    const body = (await create.json()) as { data?: { plan_session?: { uuid?: string } } };
    const uuid = body.data?.plan_session?.uuid;
    expect(uuid).toBeTruthy();

    await page.addInitScript((sessionUuid) => {
      sessionStorage.setItem('plnr_plan_session', sessionUuid as string);
    }, uuid);

    const email = `qa+claim${Date.now()}@plnr.test`;
    await page.goto('/register');
    await page.getByLabel('Name').fill('Claim Tester');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByLabel('Confirm password').fill('password123');
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page).toHaveURL(/\/plans/, { timeout: 20_000 });
    await expect(page.getByText(/night out|austin|ideas|draft|gathering/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
