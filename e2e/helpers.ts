import { expect, type APIResponse, type Page } from '@playwright/test';

export const DEMO_USER = {
  email: 'user@plnr.test',
  password: 'password',
};

export const DEMO_ADMIN = {
  email: 'admin@plnr.test',
  password: 'password',
};

const API_URL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:8088/api/v1';

/** Prefer API login to avoid Laravel auth throttle during multi-spec runs. */
export async function loginAs(page: Page, email: string, password: string) {
  let response: APIResponse | null = null;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    response = await page.request.post(`${API_URL}/auth/login`, {
      data: { email, password },
    });

    if (response.ok()) {
      break;
    }

    if (response.status() === 429) {
      await page.waitForTimeout(2_000 * (attempt + 1));
      continue;
    }

    break;
  }

  expect(response?.ok(), `login API failed: ${response?.status()}`).toBeTruthy();
  const body = (await response!.json()) as { data?: { token?: string } };
  const token = body.data?.token;
  expect(token).toBeTruthy();

  await page.addInitScript((authToken) => {
    localStorage.setItem('plnr_auth_token', authToken);
  }, token as string);

  const home = email === DEMO_ADMIN.email ? '/admin' : '/plans';
  await page.goto(home);
  await expect(page).toHaveURL(new RegExp(home.replace('/', '\\/')), { timeout: 15_000 });
}

export async function loginViaForm(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /^log in$/i }).click();
  await expect(page).toHaveURL(/\/(plans|admin)/, { timeout: 15_000 });
}

export async function expectDesktopNoHamburger(page: Page) {
  await expect(page.getByRole('button', { name: /open menu/i })).toBeHidden();
}
