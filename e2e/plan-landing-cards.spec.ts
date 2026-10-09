import { test, expect } from '@playwright/test';

test('plan type cards are a bit shorter and still open a plan', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'What are you planning?' })).toBeVisible();

  const cards = page.locator('.plan-landing-card');
  await expect(cards).toHaveCount(4);

  const first = cards.first();
  await first.scrollIntoViewIfNeeded();
  const heights = await cards.evaluateAll((els) =>
    els.map((el) => Math.round(el.getBoundingClientRect().height)),
  );
  const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
  const height = heights[0] ?? 0;
  expect(height, `card height ${height}px`).toBeGreaterThan(isMobile ? 320 : 280);
  expect(height, `card height ${height}px`).toBeLessThan(isMobile ? 390 : 340);

  await expect(first).toContainText('Plan My Date Night');
  await expect(first).toContainText('Romantic evening tailored to you and your partner.');
  const action = first.locator('.plan-landing-card__action');
  await expect(action).toBeVisible();
  await expect(action).toContainText('Start');

  const cardBox = await first.boundingBox();
  const actionBox = await action.boundingBox();
  expect(cardBox).not.toBeNull();
  expect(actionBox).not.toBeNull();
  expect((actionBox?.y ?? 0) + (actionBox?.height ?? 0)).toBeLessThanOrEqual((cardBox?.y ?? 0) + (cardBox?.height ?? 0) + 1);

  await first.click();
  await expect(page).toHaveURL(/\/plan\/date_night$/);
});
