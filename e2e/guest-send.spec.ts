import { test, expect } from '@playwright/test';

const runAiFlow = process.env.PLAYWRIGHT_RUN_AI === '1' || !!process.env.ANTHROPIC_API_KEY;

async function mailpitHasMessageTo(email: string): Promise<boolean> {
  try {
    const response = await fetch('http://127.0.0.1:8025/api/v1/messages');
    if (!response.ok) {
      return false;
    }

    const payload = (await response.json()) as {
      messages?: Array<{ To?: Array<{ Address?: string }> }>;
    };

    return (payload.messages ?? []).some((message) =>
      (message.To ?? []).some((to) => to.Address?.toLowerCase() === email.toLowerCase()),
    );
  } catch {
    return false;
  }
}

test.describe('FLOW-01 / MAIL-01 guest send', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
    test.skip(!runAiFlow, 'Set PLAYWRIGHT_RUN_AI=1 (backend must have ANTHROPIC_API_KEY)');
  });

  test('guest night out reaches send and lands in Mailpit', async ({ page }) => {
    const email = `qa+${Date.now()}@plnr.test`;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateValue = tomorrow.toISOString().slice(0, 10);

    await page.goto('/plan/night_out');

    // City (location search)
    await page.getByPlaceholder(/search for a city/i).fill('Austin');
    await page.getByRole('button', { name: /austin/i }).first().click({ timeout: 15_000 });
    await page.getByRole('button', { name: /continue/i }).click();

    // Interests — pick a preset chip
    await page.getByRole('button', { name: /^live jazz$/i }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Group size
    await page.locator('input[type="number"]').fill('4');
    await page.getByRole('button', { name: /continue/i }).click();

    // Budget
    await page.locator('input[type="number"]').fill('65');
    await page.getByRole('button', { name: /continue/i }).click();

    // Date
    await page.locator('input[type="date"]').fill(dateValue);
    await page.getByRole('button', { name: /continue/i }).click();

    // Time
    await page.locator('input[type="time"]').fill('20:00');
    await page.getByRole('button', { name: /plan my night out/i }).click();

    await expect(page.getByRole('status').getByText(/gathering results/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page).toHaveURL(/\/suggestions/, { timeout: 120_000 });

    await page.getByRole('button', { name: /choose this plan/i }).first().click();
    await expect(page).toHaveURL(/\/confirm/);
    await expect(page.getByText(/generate your perfect night out/i)).toBeVisible();

    await page.getByRole('button', { name: /generate itinerary/i }).click();
    await expect(page).toHaveURL(/\/itinerary/, { timeout: 120_000 });

    await page.getByRole('button', { name: /send to my email/i }).click();
    await page.getByLabel('Email').fill(email);
    await page.getByRole('button', { name: /^sign up & send$/i }).click();

    const signupDialog = page.getByRole('dialog');
    await expect(signupDialog.getByText(/create your free account/i)).toBeVisible();
    await signupDialog.getByLabel('Name').fill('QA Guest');
    await signupDialog.getByLabel('Password', { exact: true }).fill('password');
    await signupDialog.getByLabel('Confirm password').fill('password');
    await signupDialog.getByRole('button', { name: /^sign up & send$/i }).click();

    await expect(page.getByText(/we emailed your itinerary/i)).toBeVisible({ timeout: 45_000 });
    await expect(page.getByRole('button', { name: /view itinerary with venue links/i })).toBeVisible();
    await expect(page.getByText(/saved to your account/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /plan another outing/i })).toBeVisible();
    await expect(page.getByText(/book this|want us to book|payment/i)).toHaveCount(0);
    await expect.poll(async () => mailpitHasMessageTo(email), { timeout: 30_000 }).toBeTruthy();
  });
});
