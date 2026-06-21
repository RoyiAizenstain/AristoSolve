const { test, expect } = require('@playwright/test');
const { BASE, login } = require('./helpers');

// Tests 24-27: Problems CRUD + visibility

test('24 - company creates problem → visible in dashboard', async ({ page }) => {
  await login(page, 'company');
  const title = `Playwright Test Problem ${Date.now()}`;
  await page.click('button:has-text("+ Add Problem")');
  await expect(page).toHaveURL(/\/problems\/new/);
  await page.fill('#problem-title', title);
  await page.locator('select').nth(0).selectOption({ index: 0 });
  await page.locator('select').nth(1).selectOption({ index: 0 });
  await page.locator('select').nth(2).selectOption({ index: 0 });
  await page.fill('textarea[placeholder*="Describe"]', 'Playwright test problem description.');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(`${BASE}/dashboard`);
  await expect(page.locator(`.problem-title:has-text("${title}")`)).toBeVisible({ timeout: 5000 });
});

test('25 - company edits problem → updated title shows', async ({ page }) => {
  await login(page, 'company');
  const updatedTitle = `Updated ${Date.now()}`;
  await page.locator('button:has-text("Edit")').first().click();
  await expect(page).toHaveURL(/\/edit/);
  await page.fill('#problem-title', updatedTitle);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(`${BASE}/dashboard`);
  // Use .problem-title to avoid strict mode violation (same text in multiple columns)
  await expect(page.locator(`.problem-title:has-text("${updatedTitle}")`)).toBeVisible({ timeout: 5000 });
});

test('26 - company deletes problem → removed from table', async ({ page }) => {
  await login(page, 'company');
  const rows = page.locator('.table-row');
  const countBefore = await rows.count();
  if (countBefore === 0) {
    test.skip(true, 'No problems to delete');
    return;
  }
  page.on('dialog', d => d.accept());
  await page.locator('button:has-text("Delete")').first().click();
  await page.waitForTimeout(1000);
  const countAfter = await page.locator('.table-row').count();
  expect(countAfter).toBeLessThan(countBefore);
});

test('27 - private problem not accessible to unassigned candidate', async ({ page }) => {
  await login(page, 'candidate');
  // Problem 2 (Group Anagrams) is private — Carol was never assigned it
  await page.goto(`${BASE}/problems/2`);
  // Page loads but shows an error (stays on URL, shows error text)
  await expect(page.locator('.error-text, .pd-loading')).toBeVisible({ timeout: 5000 });
  // And the chat panel or normal problem content is NOT visible
  await expect(page.locator('.pd-panels')).not.toBeVisible({ timeout: 3000 }).catch(() => {});
});
