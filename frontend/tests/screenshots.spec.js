const { test, expect } = require('@playwright/test');
const path = require('path');

const BASE = 'http://localhost:5173';
const SHOTS = path.join(__dirname, '../../screenshots');

async function login(page, email, password) {
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Log in")');
  await page.waitForURL(`${BASE}/dashboard`);
}

// ── Screenshot 1: Database-connected application ─────────────────────────────
test('01 - database-connected application', async ({ page }) => {
  await login(page, 'alice@example.com', 'admin123');
  await expect(page.locator('text=Admin Dashboard')).toBeVisible();
  await expect(page.locator('.data-table').first()).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/01-database-connected.png`, fullPage: false });
});

// ── Screenshot 2: Successful CRUD — create a problem ─────────────────────────
test('02 - successful CRUD operation', async ({ page }) => {
  await login(page, 'bob@example.com', 'company123');
  await page.click('button:has-text("+ Add Problem")');
  await page.waitForURL(/\/problems\/new/);
  await page.fill('#problem-title', 'Screenshot CRUD Problem');
  await page.locator('select').nth(0).selectOption({ index: 1 }); // medium
  await page.locator('select').nth(1).selectOption({ index: 0 });
  await page.locator('select').nth(2).selectOption({ index: 0 });
  await page.fill('textarea[placeholder*="Describe"]', 'This problem was created to demonstrate CRUD operations.');
  // Screenshot the filled form before saving
  await page.screenshot({ path: `${SHOTS}/02-crud-create-form.png`, fullPage: false });
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/dashboard`);
  // Screenshot the dashboard showing the new problem
  await page.screenshot({ path: `${SHOTS}/02-crud-after-create.png`, fullPage: false });
});

// ── Screenshot 3: ORM relationships — JOIN query result ───────────────────────
test('03 - ORM relationships working', async ({ page }) => {
  // Show the company dashboard which uses a JOIN (Progress + User + Problem)
  await login(page, 'bob@example.com', 'company123');
  // Assign problem to candidate to ensure progress records exist
  const assignBtn = page.locator('button:has-text("Assign")').first();
  if (await assignBtn.isVisible()) {
    await assignBtn.click();
    await page.locator('.modal select').selectOption({ index: 1 });
    await page.locator('.modal-footer button.btn-primary').click();
    await page.waitForTimeout(500);
  }
  await page.reload();
  await expect(page.locator('h2:has-text("My Problems")')).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/03-orm-company-dashboard.png`, fullPage: false });

  // Also screenshot the candidate dashboard "Assigned to me" section (JOIN result)
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', 'carol@example.com');
  await page.fill('input[type="password"]', 'candidate123');
  await page.click('button:has-text("Log in")');
  await page.waitForURL(`${BASE}/dashboard`);
  await page.screenshot({ path: `${SHOTS}/03-orm-assigned-to-me.png`, fullPage: false });
});

// ── Screenshot 4: WebSocket — 2 clients ──────────────────────────────────────
test('04 - websocket two clients', async ({ browser }) => {
  // Open two browser contexts (simulates two tabs/clients)
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();
  const page1 = await context1.newPage();
  const page2 = await context2.newPage();

  // Both log in as Carol and open the same problem
  await login(page1, 'carol@example.com', 'candidate123');
  await login(page2, 'carol@example.com', 'candidate123');

  // Navigate both to the same public problem
  await page1.goto(`${BASE}/problems/3`);
  await page2.goto(`${BASE}/problems/3`);

  // Wait for chat to load on both
  await page1.waitForSelector('.bubble-ai', { timeout: 10000 });
  await page2.waitForSelector('.bubble-ai', { timeout: 10000 });

  // Send a message from page1
  await page1.fill('.pd-chat-input', 'How does a stack work?');
  await page1.click('.pd-send-btn');

  // Wait for reply to appear on both
  await page1.waitForSelector('.typing-indicator', { timeout: 5000 }).catch(() => {});
  await page2.waitForSelector('.typing-indicator', { timeout: 5000 }).catch(() => {});

  // Screenshot page1
  await page1.screenshot({ path: `${SHOTS}/04-websocket-tab1.png`, fullPage: false });
  // Screenshot page2 — should show same messages arriving
  await page2.screenshot({ path: `${SHOTS}/04-websocket-tab2.png`, fullPage: false });

  await context1.close();
  await context2.close();
});

// ── Screenshot 5: AI feature — AristoBot + evaluation ────────────────────────
test('05 - AI feature input and output', async ({ page }) => {
  await login(page, 'carol@example.com', 'candidate123');
  await page.goto(`${BASE}/problems/3`);
  await page.waitForSelector('.bubble-ai', { timeout: 10000 });

  // Send a message and wait for AI reply
  await page.fill('.pd-chat-input', 'What data structure should I use for this problem?');
  await page.click('.pd-send-btn');

  // Wait for AristoBot reply (up to 15s for Claude or fallback)
  await page.waitForSelector('.bubble-ai:nth-child(2)', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);

  // Screenshot the chat with AI response
  await page.screenshot({ path: `${SHOTS}/05-ai-aristobot-chat.png`, fullPage: false });

  // Screenshot the evaluation modal (if evaluations exist)
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', 'bob@example.com');
  await page.fill('input[type="password"]', 'company123');
  await page.click('button:has-text("Log in")');
  await page.waitForURL(`${BASE}/dashboard`);

  const viewBtn = page.locator('button:has-text("View")').first();
  if (await viewBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await viewBtn.click();
    await page.waitForSelector('.modal', { timeout: 3000 });
    await page.screenshot({ path: `${SHOTS}/05-ai-evaluation-modal.png`, fullPage: false });
  }
});

// ── Screenshot 6: Database tables ────────────────────────────────────────────
test('06 - database tables', async ({ page }) => {
  // Show the admin dashboard as proof of DB tables being populated
  await login(page, 'alice@example.com', 'admin123');
  await expect(page.locator('text=Admin Dashboard')).toBeVisible();

  // Scroll to show users table
  await page.locator('h2:has-text("All Users")').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOTS}/06-database-tables-users.png`, fullPage: false });

  // Scroll to show problems table
  await page.locator('h2:has-text("All Problems")').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOTS}/06-database-tables-problems.png`, fullPage: false });
});
