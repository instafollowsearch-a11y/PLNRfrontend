import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test, type APIRequestContext } from '@playwright/test';

import { DEMO_ADMIN, DEMO_USER, loginAs } from './helpers';

const API_URL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:8088/api/v1';
const runAiFlow = process.env.PLAYWRIGHT_RUN_AI === '1';
const BACKEND_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../backend');

function runArtisan(args: string): string {
  return execSync(`php artisan ${args}`, {
    cwd: BACKEND_ROOT,
    encoding: 'utf8',
    env: {
      ...process.env,
      XDG_CONFIG_HOME: path.join(BACKEND_ROOT, 'storage/psysh'),
    },
  });
}

function parseKeyedOutput(output: string, key: string): string {
  const line = output
    .split('\n')
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${key}=`));

  if (!line) {
    throw new Error(`Missing ${key} in artisan output:\n${output}`);
  }

  return line.slice(key.length + 1).trim();
}

async function loginToken(request: APIRequestContext, email: string, password: string): Promise<string> {
  let response = null;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    response = await request.post(`${API_URL}/auth/login`, {
      data: { email, password },
    });

    if (response.ok()) {
      break;
    }

    if (response.status() === 429) {
      await new Promise((resolve) => setTimeout(resolve, 2_000 * (attempt + 1)));
      continue;
    }

    break;
  }

  expect(response?.ok(), `login failed ${response?.status()}`).toBeTruthy();
  const body = (await response!.json()) as { data?: { token?: string } };
  expect(body.data?.token).toBeTruthy();

  return body.data!.token!;
}

async function ensurePro(_request: APIRequestContext, _token: string) {
  runArtisan(`plnr:seed-demo-plan ${DEMO_USER.email} --activate-pro`);
}

async function mailpitHasTo(email: string): Promise<boolean> {
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

test.describe('Pro features — human QA', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
  });

  test('landing shows weekend picks entry without booking copy', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /weekend picks/i })).toBeVisible();
    await expect(page.getByText(/book this|book optional|manage bookings/i)).toHaveCount(0);
  });

  test('free user hits Pro paywall on weekend page after login', async ({ page, request }) => {
    runArtisan(`plnr:seed-demo-plan ${DEMO_USER.email} --reset-pro`);

    await loginAs(page, DEMO_USER.email, DEMO_USER.password);
    await page.goto('/weekend');
    await expect(page.getByRole('heading', { name: /weekend picks are a pro feature/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('button', { name: /upgrade to pro/i })).toBeVisible();

    const token = await loginToken(request, DEMO_USER.email, DEMO_USER.password);
    const me = await request.get(`${API_URL}/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect((await me.json()).data.user.is_pro).toBe(false);
  });

  test('header upgrade opens the home Pro section and checkout requires Stripe', async ({ page }) => {
    runArtisan(`plnr:seed-demo-plan ${DEMO_USER.email} --reset-pro`);

    await loginAs(page, DEMO_USER.email, DEMO_USER.password);
    await page.goto('/plans');
    await page.getByRole('banner').getByRole('button', { name: /upgrade to pro/i }).click();
    await expect(page).toHaveURL(/#plnr-pro/);
    await expect(page.getByRole('heading', { name: /your weekend is already planned/i })).toBeVisible();

    await page.getByRole('button', { name: /get pro/i }).click();
    await expect(page.getByText(/stripe is not configured/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /get pro/i })).toBeVisible();
  });

  test('admin settings expose Pro price and store URLs', async ({ page }) => {
    await loginAs(page, DEMO_ADMIN.email, DEMO_ADMIN.password);
    await page.goto('/admin/settings');
    await expect(page.getByRole('heading', { name: /app settings/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /stripe billing/i })).toBeVisible();
    await expect(page.getByText(/pro price/i).first()).toBeVisible();
    await expect(page.getByPlaceholder(/apps\.apple\.com/i)).toBeVisible();
    await expect(page.getByPlaceholder(/play\.google\.com/i)).toBeVisible();
  });

  test('share invite → register with prefilled email → Shared with you', async ({
    page,
    browser,
    request,
  }) => {
    const inviteeEmail = `share+${Date.now()}@plnr.test`;
    const ownerToken = await loginToken(request, DEMO_USER.email, DEMO_USER.password);
    await ensurePro(request, ownerToken);

    const seeded = runArtisan(`plnr:seed-demo-plan ${DEMO_USER.email} --activate-pro`);
    const uuid = parseKeyedOutput(seeded, 'PLAN_UUID');

    await loginAs(page, DEMO_USER.email, DEMO_USER.password);
    await page.goto(`/plan/night_out/itinerary?session=${uuid}`);
    await expect(page.getByText(/austin jazz night/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /share plan/i })).toBeVisible();
    await page.getByRole('button', { name: /share plan/i }).click();
    await page.getByLabel(/invitee email/i).fill(inviteeEmail);
    await page.getByRole('button', { name: /send invite/i }).click();
    await expect(page.getByText(new RegExp(`invite sent to\\s+${inviteeEmail.replace('+', '\\+')}`, 'i'))).toBeVisible({
      timeout: 15_000,
    });

    const token = parseKeyedOutput(
      runArtisan(`plnr:seed-demo-plan --latest-share=${inviteeEmail}`),
      'SHARE_TOKEN',
    );

    // Fresh context: loginAs uses addInitScript which would re-inject the owner token.
    const inviteeContext = await browser.newContext();
    const inviteePage = await inviteeContext.newPage();

    try {
      await inviteePage.goto(`/invite/${token}`);
      await expect(inviteePage.getByRole('heading', { name: /you are invited to a plan/i })).toBeVisible({
        timeout: 15_000,
      });
      await expect(inviteePage.getByText(new RegExp(inviteeEmail.replace('+', '\\+'), 'i'))).toBeVisible();
      await inviteePage.getByRole('button', { name: /^create account$/i }).click();

      await expect(inviteePage.getByLabel(/^email$/i)).toHaveValue(inviteeEmail);
      await inviteePage.getByLabel(/^name$/i).fill('Share Friend');
      await inviteePage.getByLabel(/^password$/i).fill('password123');
      await inviteePage.getByLabel(/confirm password/i).fill('password123');
      await inviteePage.getByRole('button', { name: /create account(?:\s*&\s*accept)?/i }).click();

      await expect(inviteePage).toHaveURL(/\/plans/, { timeout: 20_000 });
      await inviteePage.getByRole('button', { name: /shared with you/i }).click();
      await expect(inviteePage.getByText(/shared by/i).first()).toBeVisible({ timeout: 15_000 });
      await expect(inviteePage.getByText(/austin/i).first()).toBeVisible();

      const mailed = await mailpitHasTo(inviteeEmail);
      if (!mailed) {
        test.info().annotations.push({
          type: 'note',
          description: 'Mailpit invite not observed (optional)',
        });
      }
    } finally {
      await inviteeContext.close();
    }
  });

  test('wrong account on invite can switch and see create-account CTA', async ({ page, request }) => {
    const inviteeEmail = `switch+${Date.now()}@plnr.test`;
    const ownerToken = await loginToken(request, DEMO_USER.email, DEMO_USER.password);
    await ensurePro(request, ownerToken);

    const seeded = runArtisan(
      `plnr:seed-demo-plan ${DEMO_USER.email} --activate-pro --share=${inviteeEmail}`,
    );
    const token = parseKeyedOutput(seeded, 'SHARE_TOKEN');

    await loginAs(page, DEMO_USER.email, DEMO_USER.password);
    await page.goto(`/invite/${token}`);
    await expect(page.getByRole('heading', { name: /wrong account/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: /switch account/i }).click();
    await expect(page.getByRole('button', { name: /^create account$/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /log out/i })).toHaveCount(0);
  });

  test('weekend generate + email (AI gated)', async ({ page, request }) => {
    test.skip(!runAiFlow, 'Set PLAYWRIGHT_RUN_AI=1 with working Anthropic key + synced events');

    const token = await loginToken(request, DEMO_USER.email, DEMO_USER.password);
    await ensurePro(request, token);
    runArtisan('events:sync Austin');

    await loginAs(page, DEMO_USER.email, DEMO_USER.password);
    await page.goto('/weekend');
    await expect(page.getByRole('heading', { name: /your weekend picks/i })).toBeVisible();
    await page.getByPlaceholder(/search city or pick on map/i).fill('Austin');
    await page.getByRole('button', { name: /austin/i }).first().click();
    await page.getByRole('button', { name: /^live jazz$/i }).click();
    await page.getByRole('button', { name: /generate picks/i }).click();
    await expect(page.getByRole('button', { name: /email my picks/i })).toBeVisible({
      timeout: 120_000,
    });
    await page.getByRole('button', { name: /email my picks/i }).click();
    await expect(page.getByText(/picks sent/i)).toBeVisible({ timeout: 30_000 });
  });
});
