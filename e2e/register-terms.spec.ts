import { expect, test } from '@playwright/test';

test.describe('Register terms acceptance', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop project only');
  });

  test('blocks account creation until the terms are accepted', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();

    const copy = page.locator('.terms-accept p');
    const text = (await copy.innerText()).replace(/\s+/g, ' ');
    expect(text.indexOf('Terms and Conditions')).toBeGreaterThanOrEqual(0);
    expect(text.indexOf('Terms and Conditions')).toBeLessThan(text.indexOf('I have read and accept'));
    expect(text.indexOf('Privacy Policy')).toBeLessThan(text.indexOf('I have read and accept'));

    await expect(page.getByRole('link', { name: 'Terms and Conditions' })).toHaveAttribute('href', /\/terms$/);
    await expect(page.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', /\/privacy$/);

    await page.getByLabel('Name').fill('QA Tester');
    await page.getByLabel('Email').fill(`qa+terms${Date.now()}@plnr.test`);
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByLabel('Confirm password').fill('password123');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText('Accept the terms and conditions to create an account.')).toBeVisible();
    await expect(page).toHaveURL(/\/register/);

    const termsPopup = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Terms and Conditions' }).click();
    const termsPage = await termsPopup;
    await expect(termsPage).toHaveURL(/\/terms$/);
    await termsPage.close();

    const privacyPopup = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Privacy Policy' }).click();
    const privacyPage = await privacyPopup;
    await expect(privacyPage).toHaveURL(/\/privacy$/);
    await privacyPage.close();

    const checkbox = page.getByRole('checkbox', { name: /terms and conditions of the plnr app/i });
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    await page.reload();
    await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
    await expect(checkbox).not.toBeChecked();
  });
});
