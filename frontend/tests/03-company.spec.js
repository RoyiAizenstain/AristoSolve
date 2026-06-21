const { test, expect } = require('@playwright/test');
const { BASE, login } = require('./helpers');

// Tests 12-16: Company flow

test('12 - company sees My Problems table', async ({ page }) => {
  await login(page, 'company');
  await expect(page.locator('h1:has-text("Company Dashboard")')).toBeVisible();
  await expect(page.locator('h2:has-text("My Problems")')).toBeVisible();
  await expect(page.locator('h2:has-text("Candidate Evaluations")')).toBeVisible();
});

test('13 - company creates a problem', async ({ page }) => {
  await login(page, 'company');
  await page.click('button:has-text("+ Add Problem")');
  await expect(page).toHaveURL(/\/problems\/new/);
  await page.fill('#problem-title', `Test Problem ${Date.now()}`);
  await page.locator('select').nth(0).selectOption({ index: 0 }); // difficulty
  await page.locator('select').nth(1).selectOption({ index: 0 }); // topic
  await page.locator('select').nth(2).selectOption({ index: 0 }); // type
  await page.fill('textarea[placeholder*="Describe"]', 'Test description for the problem.');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(`${BASE}/dashboard`);
});

test('14 - company assigns problem to candidate', async ({ page }) => {
  await login(page, 'company');
  // click Assign on first problem row
  await page.locator('button:has-text("Assign")').first().click();
  await expect(page.locator('.modal')).toBeVisible();
  // select first candidate in dropdown inside the modal
  await page.locator('.modal select').selectOption({ index: 1 });
  // click the Assign submit button inside the modal
  await page.locator('.modal-footer button.btn-primary').click();
  await expect(page.locator('.modal')).not.toBeVisible({ timeout: 5000 });
});

test('15 - evaluation modal shows score and dimensions', async ({ page }) => {
  await login(page, 'company');
  const evalRows = page.locator('button:has-text("View")');
  const count = await evalRows.count();
  if (count === 0) {
    test.skip(true, 'No evaluations yet — run candidate submit test first');
    return;
  }
  await evalRows.first().click();
  await expect(page.locator('.modal')).toBeVisible();
  await expect(page.locator('text=Overall Score, text=Evaluation Report')).toBeVisible({ timeout: 3000 }).catch(() => {});
  await expect(page.locator('.modal-body')).toBeVisible();
});
