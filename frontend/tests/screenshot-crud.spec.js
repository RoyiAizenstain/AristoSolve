const { test, expect } = require('@playwright/test');
const path = require('path');

const BASE = 'http://localhost:5173';
const SHOTS = path.join(__dirname, '../../screenshots');

test('02-crud-operation', async ({ page }) => {
  // Login as company
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', 'bob@example.com');
  await page.fill('input[type="password"]', 'company123');
  await page.click('button:has-text("Log in")');
  await page.waitForURL(`${BASE}/dashboard`);

  // Screenshot 1: Dashboard BEFORE create (READ)
  await expect(page.locator('h2:has-text("My Problems")')).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/02-crud-1-read-before.png`, fullPage: false });

  // CREATE: Add a new problem
  const title = `CRUD Demo Problem`;
  await page.click('button:has-text("+ Add Problem")');
  await page.waitForURL(/\/problems\/new/);
  await page.fill('#problem-title', title);
  await page.locator('select').nth(0).selectOption('hard');
  await page.locator('select').nth(1).selectOption({ index: 2 });
  await page.locator('select').nth(2).selectOption({ index: 0 });
  await page.fill('textarea[placeholder*="Describe"]', 'This problem was created to demonstrate the CREATE operation of full CRUD via Sequelize ORM + MySQL.');

  // Screenshot 2: Filled CREATE form
  await page.screenshot({ path: `${SHOTS}/02-crud-2-create-form.png`, fullPage: false });

  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/dashboard`);
  await expect(page.locator(`.problem-title:has-text("${title}")`)).toBeVisible({ timeout: 5000 });

  // Screenshot 3: Dashboard AFTER create — new row visible
  await page.screenshot({ path: `${SHOTS}/02-crud-3-after-create.png`, fullPage: false });

  // UPDATE: Edit the problem
  const editBtn = page.locator('.table-row').filter({ hasText: title }).locator('button:has-text("Edit")');
  await editBtn.click();
  await page.waitForURL(/\/edit/);
  await page.fill('#problem-title', `${title} (Updated)`);

  // Screenshot 4: Edit form
  await page.screenshot({ path: `${SHOTS}/02-crud-4-update-form.png`, fullPage: false });

  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/dashboard`);

  // Screenshot 5: After update — title changed
  await expect(page.locator(`.problem-title:has-text("${title} (Updated)")`)).toBeVisible({ timeout: 5000 });
  await page.screenshot({ path: `${SHOTS}/02-crud-5-after-update.png`, fullPage: false });
});
