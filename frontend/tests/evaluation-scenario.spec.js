const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://localhost:5173';

// Fresh company account per run so register always works
const TS        = Date.now();
const NEW_EMAIL = `demo.company.${TS}@test.com`;
const NEW_PASS  = 'demo1234';

test('Final presentation — all 10 required steps', async ({ page, context }) => {
  const start = Date.now();
  const t = () => `[${((Date.now() - start) / 1000).toFixed(1)}s]`;

  // ── STEP 1: Register — show invalid input, then valid ────────────────────
  console.log(`\n${t()} STEP 1: Register`);
  await page.goto(`${BASE}/register`);

  // 1a — invalid: submit empty form → field errors appear
  await page.click('button:has-text("Create account")');
  await expect(page.locator('.error-text').first()).toBeVisible({ timeout: 5000 });
  console.log(`${t()} ✅ 1a: Invalid input — ⚠ errors shown on empty fields`);

  // 1b — valid: fill form as company user
  await page.fill('#firstName', 'Demo');
  await page.fill('#lastName', 'Company');
  await page.fill('#email', NEW_EMAIL);
  await page.fill('#password', NEW_PASS);
  await page.locator('label.role-option').filter({ hasText: 'Company' }).click();
  await page.click('button:has-text("Create account")');
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 20000 });
  console.log(`${t()} ✅ 1b: New company user registered → CREATE user in DB`);

  // ── STEP 2: Login — show wrong password, then correct ───────────────────
  console.log(`\n${t()} STEP 2: Login`);
  await page.click('button:has-text("Logout")');
  await page.waitForURL(`${BASE}/login`, { timeout: 5000 });

  // 2a — wrong password → error banner
  await page.fill('#email', NEW_EMAIL);
  await page.fill('#password', 'wrongpassword');
  await page.click('button:has-text("Log in")');
  await expect(page.locator('.error-banner')).toBeVisible({ timeout: 8000 });
  console.log(`${t()} ✅ 2a: Wrong password — ✖ error banner shown`);

  // 2b — correct password → dashboard
  await page.fill('#password', NEW_PASS);
  await page.click('button:has-text("Log in")');
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 20000 });
  console.log(`${t()} ✅ 2b: Logged in successfully`);

  // ── STEP 3: Main application page ───────────────────────────────────────
  console.log(`\n${t()} STEP 3: Main page`);
  await expect(page.locator('h1:has-text("Company Dashboard")')).toBeVisible({ timeout: 5000 });
  console.log(`${t()} ✅ 3: Company Dashboard visible`);

  // ── STEP 4a+b: CREATE + UPDATE (DELETE comes after AI demo) ─────────────
  console.log(`\n${t()} STEP 4: Primary feature (CREATE → UPDATE)`);

  // 4a — CREATE problem
  await page.click('button:has-text("+ Add Problem")');
  await page.waitForURL(`${BASE}/problems/new`, { timeout: 8000 });
  const problemTitle = `Demo Problem ${TS}`;
  await page.fill('#problem-title', problemTitle);
  await page.locator('textarea[placeholder*="Describe"]').fill('A test problem created for the presentation demo.');
  await page.click('button:has-text("Create Problem")');
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 10000 });
  await expect(page.locator(`.table-row:has-text("${problemTitle}")`)).toBeVisible({ timeout: 8000 });
  console.log(`${t()} ✅ 4a: Problem created → CREATE DB call`);

  // 4b — UPDATE problem
  await page.locator(`.table-row:has-text("${problemTitle}") button:has-text("Edit")`).click();
  await page.waitForURL(/\/problems\/\d+\/edit/, { timeout: 8000 });
  await page.fill('#problem-title', `${problemTitle} EDITED`);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 10000 });
  await expect(page.locator(`.table-row:has-text("${problemTitle} EDITED")`)).toBeVisible({ timeout: 8000 });
  console.log(`${t()} ✅ 4b: Problem edited → UPDATE DB call`);

  // ── STEP 5: AI feature — open the edited problem ─────────────────────────
  console.log(`\n${t()} STEP 5: AI feature`);

  // Click the edited problem to open it
  await page.locator(`.table-row:has-text("${problemTitle} EDITED") .problem-title`).click();
  await page.waitForSelector('.pd-root', { timeout: 10000 });
  const problemPageUrl = page.url();

  // Wait for AristoBot greeting
  await page.waitForSelector('.bubble-ai', { timeout: 20000 });

  // 5a — empty input: send button disabled
  await expect(page.locator('.pd-send-btn')).toBeDisabled({ timeout: 3000 });
  console.log(`${t()} ✅ 5a: Empty input — send button disabled (greyed out)`);

  // 5b — real message → AristoBot replies
  const aiBefore = await page.locator('.bubble-ai').count();
  await page.fill('.pd-chat-input', 'I think we should use a hash map to achieve O(n) time complexity');
  await expect(page.locator('.pd-send-btn')).toBeEnabled({ timeout: 3000 });
  await page.click('.pd-send-btn');
  await page.waitForFunction(
    (before) => document.querySelectorAll('.bubble-ai').length > before,
    aiBefore,
    { timeout: 30000 }
  );
  console.log(`${t()} ✅ 5b: AristoBot replied → AI feature working`);

  // ── STEP 6: WebSocket — 2-tab live update ───────────────────────────────
  console.log(`\n${t()} STEP 6: WebSocket live update`);

  const page2 = await context.newPage();
  await page2.goto(problemPageUrl);
  await page2.waitForSelector('.pd-root', { timeout: 10000 });
  await page2.waitForSelector('.bubble-ai', { timeout: 20000 });
  console.log(`${t()} ✅ 6a: Second tab opened on same problem URL`);

  const aiCountTab1 = await page.locator('.bubble-ai').count();
  const aiCountTab2 = await page2.locator('.bubble-ai').count();
  await page.fill('.pd-chat-input', 'What about the space complexity?');
  await page.click('.pd-send-btn');

  await Promise.all([
    page.waitForFunction(
      (before) => document.querySelectorAll('.bubble-ai').length > before,
      aiCountTab1,
      { timeout: 30000 }
    ),
    page2.waitForFunction(
      (before) => document.querySelectorAll('.bubble-ai').length > before,
      aiCountTab2,
      { timeout: 30000 }
    ),
  ]);
  console.log(`${t()} ✅ 6b: Reply appeared in BOTH tabs → WebSocket live sync confirmed`);
  await page2.close();

  // ── STEP 7: Settings page ────────────────────────────────────────────────
  // ProblemDetail has no navbar — exit back to dashboard first
  console.log(`\n${t()} STEP 7: Settings`);
  await page.click('button:has-text("← Problems")');
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 5000 });
  await page.locator('a.nav-link:has-text("Settings")').click();
  await page.waitForURL(`${BASE}/settings`, { timeout: 5000 });
  await page.waitForSelector('#displayName', { timeout: 5000 });
  console.log(`${t()} ✅ 7: Settings page loaded`);

  // ── STEP 8: Modify a setting ─────────────────────────────────────────────
  console.log(`\n${t()} STEP 8: Modify setting`);
  await page.fill('#displayName', `Demo User ${TS}`);
  await page.click('button:has-text("Save changes")');
  await expect(page.locator('.toast')).toBeVisible({ timeout: 5000 });
  console.log(`${t()} ✅ 8: Display name saved → UPDATE DB call`);

  // ── STEP 9: Navbar navigation back to Dashboard ──────────────────────────
  console.log(`\n${t()} STEP 9: Navbar navigation`);
  await page.locator('a.nav-link:has-text("Dashboard")').click();
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 5000 });
  await expect(page.locator('h1:has-text("Company Dashboard")')).toBeVisible({ timeout: 5000 });
  console.log(`${t()} ✅ 9: Navigated to Dashboard via navbar`);

  // ── STEP 4c: DELETE (shown after returning to dashboard) ─────────────────
  console.log(`\n${t()} STEP 4c: DELETE problem`);
  page.once('dialog', dialog => dialog.accept());
  const [deleteResp] = await Promise.all([
    page.waitForResponse(
      resp => resp.request().method() === 'DELETE' && resp.url().includes('/problems'),
      { timeout: 15000 }
    ),
    page.locator(`.table-row:has-text("${problemTitle} EDITED") button:has-text("Delete")`).click(),
  ]);
  console.log(`${t()} DELETE status: ${deleteResp.status()}`);
  await page.waitForLoadState('load', { timeout: 10000 });
  await page.waitForTimeout(1000);
  await expect(page.locator(`.table-row:has-text("${problemTitle} EDITED")`)).not.toBeVisible({ timeout: 8000 });
  console.log(`${t()} ✅ 4c: Problem deleted → DELETE DB call`);

  // ── STEP 10: Logout ──────────────────────────────────────────────────────
  console.log(`\n${t()} STEP 10: Logout`);
  await page.click('button:has-text("Logout")');
  await page.waitForURL(`${BASE}/login`, { timeout: 5000 });
  console.log(`${t()} ✅ 10: Logged out → redirected to /login`);

  // ── Summary ──────────────────────────────────────────────────────────────
  const total = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n${'═'.repeat(52)}`);
  console.log(`  ALL 10 PRESENTATION STEPS PASSED in ${total}s`);
  console.log(`  ✅ Register (invalid + valid) → CREATE user`);
  console.log(`  ✅ Login (wrong pw + correct)`);
  console.log(`  ✅ Main page → CREATE → UPDATE problem`);
  console.log(`  ✅ AI (empty blocked + real reply)`);
  console.log(`  ✅ WebSocket (2-tab live sync)`);
  console.log(`  ✅ Settings → modify → navbar → DELETE → logout`);
  console.log(`${'═'.repeat(52)}\n`);
});
