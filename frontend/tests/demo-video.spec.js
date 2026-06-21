const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:5173';

// Full product story:
// 1. Company assigns a test to a candidate
// 2. Candidate sees assigned test, solves it, chats with AristoBot, submits
// 3. Company sees the AI evaluation report

test('AristoSolve Demo', async ({ page }) => {

  // ── PART 1: Company assigns a test ───────────────────────────────────────
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(1000);
  await page.fill('input[type="email"]', 'bob@example.com');
  await page.waitForTimeout(400);
  await page.fill('input[type="password"]', 'company123');
  await page.waitForTimeout(400);
  await page.click('button:has-text("Log in")');
  await page.waitForURL(`${BASE}/dashboard`);
  await page.waitForTimeout(2000);

  // Show company dashboard
  await expect(page.locator('h2:has-text("My Problems")')).toBeVisible();
  await page.waitForTimeout(1500);

  // Click Assign on the first problem
  const assignBtn = page.locator('.table-row button:has-text("Assign")').first();
  await expect(assignBtn).toBeVisible({ timeout: 5000 });
  await assignBtn.click();
  await page.waitForSelector('.modal', { timeout: 3000 });
  await page.waitForTimeout(1000);

  // Select Carol as candidate
  await page.locator('.modal select').selectOption({ index: 1 });
  await page.waitForTimeout(800);

  // Set a deadline
  const deadline = page.locator('.modal input[type="date"]');
  await deadline.fill('2026-07-15');
  await page.waitForTimeout(800);

  // Click Assign
  await page.locator('.modal-footer button.btn-primary').click();
  await expect(page.locator('.modal')).not.toBeVisible({ timeout: 3000 });
  await page.waitForTimeout(1500);

  // Logout company
  await page.click('button:has-text("Logout")');
  await page.waitForURL(`${BASE}/login`);
  await page.waitForTimeout(1000);

  // ── PART 2: Candidate sees assigned test and solves it ────────────────────
  await page.fill('input[type="email"]', 'carol@example.com');
  await page.waitForTimeout(400);
  await page.fill('input[type="password"]', 'candidate123');
  await page.waitForTimeout(400);
  await page.click('button:has-text("Log in")');
  await page.waitForURL(`${BASE}/dashboard`);
  await page.waitForTimeout(2000);

  // Show "Assigned to me" section
  const assignedSection = page.locator('h2:has-text("Assigned to me")');
  if (await assignedSection.isVisible({ timeout: 3000 }).catch(() => false)) {
    await assignedSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);

    // Click Start on the assigned problem
    await page.locator('text=Assigned to me').waitFor();
    await page.locator('.table-row button:has-text("Start"), .table-row button:has-text("Review")').first().click();
  } else {
    // Fallback: open first problem from table
    await page.locator('.table-row').first().click();
  }

  await page.waitForSelector('.pd-root', { timeout: 10000 });
  await page.waitForTimeout(2000);

  // Show 3-panel layout
  await page.waitForTimeout(1500);

  // Wait for AristoBot greeting
  await page.waitForSelector('.bubble-ai', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);

  // Type a solution
  const editor = page.locator('.pd-code-area');
  await editor.click();
  await editor.press('Control+A');
  await editor.type('def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i', { delay: 25 });
  await page.waitForTimeout(1500);

  // Chat with AristoBot
  await page.fill('.pd-chat-input', 'I used a hash map to get O(n) time complexity');
  await page.waitForTimeout(600);
  await page.click('.pd-send-btn');

  await page.waitForSelector('.typing-indicator', { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(1000);

  await page.waitForFunction(
    () => document.querySelectorAll('.bubble-ai').length >= 2,
    { timeout: 15000 }
  ).catch(() => {});
  // Wait for input to be enabled (AristoBot finished replying)
  await expect(page.locator('.pd-chat-input')).toBeEnabled({ timeout: 15000 });
  await page.waitForTimeout(1500);

  // Second message
  await page.fill('.pd-chat-input', 'What edge cases should I consider?');
  await page.waitForTimeout(500);
  await page.click('.pd-send-btn');

  await page.waitForFunction(
    () => document.querySelectorAll('.bubble-ai').length >= 3,
    { timeout: 15000 }
  ).catch(() => {});
  await page.waitForTimeout(2000);

  // Submit the solution
  await page.click('button:has-text("Submit")');
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 15000 });
  await page.waitForTimeout(2000);

  // Logout candidate
  await page.click('button:has-text("Logout")');
  await page.waitForURL(`${BASE}/login`);
  await page.waitForTimeout(1000);

  // ── PART 3: Company sees AI evaluation ───────────────────────────────────
  await page.fill('input[type="email"]', 'bob@example.com');
  await page.waitForTimeout(400);
  await page.fill('input[type="password"]', 'company123');
  await page.waitForTimeout(400);
  await page.click('button:has-text("Log in")');
  await page.waitForURL(`${BASE}/dashboard`);
  await page.waitForTimeout(2000);

  // Show Candidate Evaluations table
  await page.locator('h2:has-text("Candidate Evaluations")').scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);

  // Open evaluation modal
  const viewBtn = page.locator('button:has-text("View")').first();
  if (await viewBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await viewBtn.click();
    await page.waitForSelector('.modal', { timeout: 5000 });
    await page.waitForTimeout(4000); // let grader read score + dimensions
    // Click ✕ to close
    await page.locator('.modal-close').click();
    await expect(page.locator('.modal')).not.toBeVisible({ timeout: 3000 });
    await page.waitForTimeout(1500);
  }

  await page.waitForTimeout(1500);
});
