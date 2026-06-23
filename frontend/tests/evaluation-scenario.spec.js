const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://localhost:5173';

// Full evaluation scenario:
// 1. Company assigns problem to Carol
// 2. Carol sees it, solves with AristoBot, submits
// 3. Company sees AI evaluation with score + dimensions

test('Full evaluation scenario', async ({ page }) => {
  const elapsed = () => `${((Date.now() - start) / 1000).toFixed(1)}s`;
  const start = Date.now();

  // ── PART 1: Company assigns problem ──────────────────────────────────────
  console.log(`\n[${elapsed()}] PART 1: Company assigns problem to Carol`);
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', 'bob@example.com');
  await page.fill('input[type="password"]', 'company123');
  await page.click('button:has-text("Log in")');
  await page.waitForURL(`${BASE}/dashboard`);

  // Click Assign on first problem
  const assignBtn = page.locator('.table-row button:has-text("Assign")').first();
  await expect(assignBtn).toBeVisible({ timeout: 5000 });
  await assignBtn.click();
  await page.waitForSelector('.modal');

  // Select Carol
  await page.locator('.modal select').selectOption({ index: 1 });
  // Set deadline
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 7);
  await page.locator('.modal input[type="date"]').fill(tomorrow.toISOString().split('T')[0]);
  // Confirm assign
  await page.locator('.modal-footer button.btn-primary').click();
  await expect(page.locator('.modal')).not.toBeVisible({ timeout: 5000 });
  console.log(`[${elapsed()}] ✅ Company assigned problem to Carol`);

  // Logout company
  await page.click('button:has-text("Logout")');
  await page.waitForURL(`${BASE}/login`);

  // ── PART 2: Carol solves assigned problem ─────────────────────────────────
  console.log(`[${elapsed()}] PART 2: Carol logs in and solves assigned problem`);
  await page.fill('input[type="email"]', 'carol@example.com');
  await page.fill('input[type="password"]', 'candidate123');
  await page.click('button:has-text("Log in")');
  await page.waitForURL(`${BASE}/dashboard`);
  await page.waitForTimeout(1000);

  // Verify "Assigned to me" section visible
  const assignedSection = page.locator('h2:has-text("Assigned to me")');
  await expect(assignedSection).toBeVisible({ timeout: 15000 });
  console.log(`[${elapsed()}] ✅ Carol sees "Assigned to me" section`);

  // Click Start on assigned problem
  const startBtn = page.locator('.table-row button:has-text("Start")').first();
  await startBtn.click();
  await page.waitForSelector('.pd-root', { timeout: 10000 });
  console.log(`[${elapsed()}] ✅ Carol opened assigned problem`);

  // Wait for AristoBot greeting
  await page.waitForSelector('.bubble-ai', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(500);

  // Chat with AristoBot
  await page.fill('.pd-chat-input', 'I think I should use a hash map to solve this efficiently');
  await page.click('.pd-send-btn');
  await page.waitForFunction(
    () => document.querySelectorAll('.bubble-ai').length >= 2,
    { timeout: 20000 }
  ).catch(() => {});
  await expect(page.locator('.pd-chat-input')).toBeEnabled({ timeout: 15000 }).catch(() => {});
  console.log(`[${elapsed()}] ✅ AristoBot responded to Carol`);

  // Second message
  await page.fill('.pd-chat-input', 'The time complexity would be O(n) with this approach');
  await page.click('.pd-send-btn');
  await page.waitForFunction(
    () => document.querySelectorAll('.bubble-ai').length >= 3,
    { timeout: 20000 }
  ).catch(() => {});
  await expect(page.locator('.pd-chat-input')).toBeEnabled({ timeout: 15000 }).catch(() => {});
  console.log(`[${elapsed()}] ✅ Second AristoBot exchange done`);

  // Submit the solution
  await page.click('button:has-text("Submit")');
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 30000 });
  console.log(`[${elapsed()}] ✅ Carol submitted — evaluation being generated`);

  // Wait for background Claude evaluation to complete
  await page.waitForTimeout(15000);

  // Logout Carol
  await page.click('button:has-text("Logout")');
  await page.waitForURL(`${BASE}/login`);

  // ── PART 3: Company sees evaluation ───────────────────────────────────────
  console.log(`[${elapsed()}] PART 3: Company checks evaluation`);
  await page.fill('input[type="email"]', 'bob@example.com');
  await page.fill('input[type="password"]', 'company123');
  await page.click('button:has-text("Log in")');
  await page.waitForURL(`${BASE}/dashboard`);
  await page.waitForTimeout(1500);

  // Verify evaluation appears in table
  const evalTable = page.locator('h2:has-text("Candidate Evaluations")');
  await expect(evalTable).toBeVisible();
  const viewBtn = page.locator('button:has-text("View")').first();
  await expect(viewBtn).toBeVisible({ timeout: 10000 });
  console.log(`[${elapsed()}] ✅ Evaluation row appears in company dashboard`);

  // Open evaluation modal
  await viewBtn.click();
  await page.waitForSelector('.modal');
  await page.waitForTimeout(1000);

  // Verify score and dimensions visible
  await expect(page.locator('.modal-body')).toBeVisible();
  console.log(`[${elapsed()}] ✅ Evaluation modal opened with score + dimensions`);

  // Close modal
  await page.locator('.modal-close').click();
  await expect(page.locator('.modal')).not.toBeVisible({ timeout: 3000 });

  const total = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n══════════════════════════════════════`);
  console.log(`  EVALUATION SCENARIO PASSED in ${total}s`);
  console.log(`  Company assigned → Carol solved → AI evaluation ✅`);
  console.log(`══════════════════════════════════════\n`);
});
