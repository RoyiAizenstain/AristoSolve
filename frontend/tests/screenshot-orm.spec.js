const { test, expect } = require('@playwright/test');
const path = require('path');

const BASE = 'http://localhost:5173';
const SHOTS = path.join(__dirname, '../../screenshots');

// Better ORM relationship screenshot:
// Show the company evaluation modal which pulls data from:
// evaluations JOIN users JOIN problems JOIN conversations
// This is the clearest demo of ORM relationships working

test('03-orm-relationships', async ({ page }) => {
  // Log in as company
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', 'bob@example.com');
  await page.fill('input[type="password"]', 'company123');
  await page.click('button:has-text("Log in")');
  await page.waitForURL(`${BASE}/dashboard`);

  // Check if evaluation modal is available
  const viewBtn = page.locator('button:has-text("View")').first();
  const hasEval = await viewBtn.isVisible({ timeout: 3000 }).catch(() => false);

  if (hasEval) {
    // Open evaluation modal — shows data joined from evaluations + users + problems
    await viewBtn.click();
    await expect(page.locator('.modal')).toBeVisible({ timeout: 3000 });
    await page.screenshot({ path: `${SHOTS}/03-orm-evaluation-join.png`, fullPage: false });
  } else {
    // Fallback: show company dashboard "My Problems" + candidate progress
    // This still shows data loaded via ORM from multiple tables
    await expect(page.locator('h2:has-text("My Problems")')).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/03-orm-company-tables.png`, fullPage: false });
  }

  // Also capture the candidate "Assigned to me" section which uses:
  // progress JOIN problems — a clear many-to-many relationship in action
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', 'carol@example.com');
  await page.fill('input[type="password"]', 'candidate123');
  await page.click('button:has-text("Log in")');
  await page.waitForURL(`${BASE}/dashboard`);
  await page.waitForTimeout(1000);

  // Make sure "Assigned to me" section is visible (shows progress JOIN problems)
  const assignedSection = page.locator('h2:has-text("Assigned to me")');
  const hasAssigned = await assignedSection.isVisible({ timeout: 3000 }).catch(() => false);

  if (hasAssigned) {
    await assignedSection.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${SHOTS}/03-orm-many-to-many.png`, fullPage: false });
  } else {
    // Show the problems table which loads from DB via ORM
    await page.screenshot({ path: `${SHOTS}/03-orm-problems-from-db.png`, fullPage: false });
  }
});
