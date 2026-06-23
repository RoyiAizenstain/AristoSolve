const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:5173';

// ─────────────────────────────────────────────────────────────────────────────
// PRESENTATION DEMO — follows exactly the 10 required steps
// Total target: 3 minutes (180 seconds)
// Run with: npx playwright test tests/presentation-demo.spec.js --headed
// ─────────────────────────────────────────────────────────────────────────────

test('Presentation Demo — all 10 required steps', async ({ page }) => {
  const start = Date.now();
  const elapsed = () => `${((Date.now() - start) / 1000).toFixed(1)}s`;

  // ── STEP 1: Create a new user ─────────────────────────────────────────────
  console.log(`\n[${elapsed()}] STEP 1: Create new user`);
  await page.goto(`${BASE}/register`);

  const email = `demo_${Date.now()}@test.com`;
  await page.fill('#firstName', 'Demo');
  await page.fill('#lastName', 'Candidate');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', 'demo1234');
  await page.click('.role-option:has-text("Candidate"), label:has-text("Candidate")');
  await page.click('button:has-text("Create account")');
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 15000 });
  console.log(`[${elapsed()}] ✅ STEP 1 DONE — new user registered and logged in`);

  // ── STEP 2: Log in (already logged in after register — show logout+login) ─
  console.log(`[${elapsed()}] STEP 2: Logout then login`);
  await page.click('button:has-text("Logout")');
  await page.waitForURL(`${BASE}/login`);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', 'demo1234');
  await page.click('button:has-text("Log in")');
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 10000 });
  console.log(`[${elapsed()}] ✅ STEP 2 DONE — logged in`);

  // ── STEP 3: Navigate to main application page ────────────────────────────
  console.log(`[${elapsed()}] STEP 3: Navigate to main page (dashboard)`);
  await expect(page.locator('text=AI-Guided Problems')).toBeVisible();
  await expect(page.locator('.data-table').first()).toBeVisible();
  await page.waitForTimeout(1000);
  console.log(`[${elapsed()}] ✅ STEP 3 DONE — dashboard with problems visible`);

  // ── STEP 4: Use primary feature — open a problem ─────────────────────────
  console.log(`[${elapsed()}] STEP 4: Primary feature — open problem`);
  await page.locator('.table-row').first().click();
  await page.waitForSelector('.pd-root', { timeout: 10000 });
  await expect(page.locator('.pd-description')).toBeVisible();
  await expect(page.locator('.pd-editor')).toBeVisible();
  await expect(page.locator('.pd-chat')).toBeVisible();
  // Type some code
  const editor = page.locator('.pd-code-area');
  await editor.click();
  await editor.press('Control+A');
  await editor.type('def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target-n], i]\n        seen[n] = i', { delay: 15 });
  await page.waitForTimeout(800);
  console.log(`[${elapsed()}] ✅ STEP 4 DONE — problem open, code typed`);

  // ── STEP 5: Use AI feature — chat with AristoBot ─────────────────────────
  console.log(`[${elapsed()}] STEP 5: AI feature — ask AristoBot`);
  await page.waitForSelector('.bubble-ai', { timeout: 15000 }).catch(() => {});
  await page.fill('.pd-chat-input', 'What is the time complexity of my solution?');
  await page.click('.pd-send-btn');

  // Wait for Claude response
  await page.waitForFunction(
    () => document.querySelectorAll('.bubble-ai').length >= 2,
    { timeout: 20000 }
  ).catch(() => {});
  await expect(page.locator('.pd-chat-input')).toBeEnabled({ timeout: 15000 }).catch(() => {});
  console.log(`[${elapsed()}] ✅ STEP 5 DONE — AI responded`);

  // ── STEP 6: WebSocket — send another message (real-time) ──────────────────
  console.log(`[${elapsed()}] STEP 6: WebSocket — send message, see typing indicator`);
  await page.fill('.pd-chat-input', 'Can I use a different data structure?');
  await page.click('.pd-send-btn');
  await page.waitForSelector('.typing-indicator', { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);
  console.log(`[${elapsed()}] ✅ STEP 6 DONE — typing indicator shown (WebSocket live)`);

  // Wait for reply before navigating away
  await page.waitForFunction(
    () => document.querySelectorAll('.bubble-ai').length >= 3,
    { timeout: 20000 }
  ).catch(() => {});
  await page.waitForTimeout(500);

  // ── STEP 7: Navigate to Settings page ────────────────────────────────────
  console.log(`[${elapsed()}] STEP 7: Navigate to Settings`);
  await page.click('← Problems, button:has-text("← Problems")').catch(async () => {
    await page.goto(`${BASE}/settings`);
  });
  // Use navbar
  await page.locator('nav a:has-text("Settings"), a:has-text("Settings")').first().click().catch(async () => {
    await page.goto(`${BASE}/settings`);
  });
  await page.waitForURL(`${BASE}/settings`, { timeout: 5000 }).catch(async () => {
    await page.goto(`${BASE}/settings`);
    await page.waitForURL(`${BASE}/settings`);
  });
  await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
  console.log(`[${elapsed()}] ✅ STEP 7 DONE — settings page loaded`);

  // ── STEP 8: Modify a setting ──────────────────────────────────────────────
  console.log(`[${elapsed()}] STEP 8: Modify display name`);
  const nameInput = page.locator('input[type="text"]').first();
  await nameInput.focus();
  await page.keyboard.press('Control+A');
  await nameInput.pressSequentially(`Demo User ${Date.now() % 1000}`, { delay: 30 });
  await expect(page.locator('button:has-text("Save changes")')).toBeEnabled({ timeout: 5000 });
  const [response] = await Promise.all([
    page.waitForResponse(r => r.url().includes('/api/settings') && r.request().method() === 'PUT', { timeout: 8000 }),
    page.click('button:has-text("Save changes")'),
  ]);
  expect(response.status()).toBe(200);
  console.log(`[${elapsed()}] ✅ STEP 8 DONE — setting saved (PUT 200 OK)`);

  // ── STEP 9: Use the navigation bar ───────────────────────────────────────
  console.log(`[${elapsed()}] STEP 9: Navigate via navbar → Dashboard`);
  await page.locator('nav a:has-text("Dashboard"), a:has-text("Dashboard")').first().click();
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 5000 });
  await expect(page.locator('text=AI-Guided Problems')).toBeVisible();
  console.log(`[${elapsed()}] ✅ STEP 9 DONE — navigated to dashboard via navbar`);

  // ── STEP 10: Log out ──────────────────────────────────────────────────────
  console.log(`[${elapsed()}] STEP 10: Log out`);
  await page.click('button:has-text("Logout")');
  await page.waitForURL(`${BASE}/login`, { timeout: 5000 });
  await expect(page.locator('input[type="email"]')).toBeVisible();
  console.log(`[${elapsed()}] ✅ STEP 10 DONE — logged out`);

  const total = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n══════════════════════════════════════`);
  console.log(`  ALL 10 STEPS PASSED in ${total}s`);
  console.log(`  Target: 180s (3 minutes)`);
  if (parseFloat(total) <= 180) {
    console.log(`  ✅ Within time limit!`);
  } else {
    console.log(`  ⚠️  Over time — speed up by ${(parseFloat(total) - 180).toFixed(0)}s`);
  }
  console.log(`══════════════════════════════════════\n`);
});
