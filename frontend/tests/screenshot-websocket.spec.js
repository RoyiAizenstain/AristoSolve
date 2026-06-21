const { test } = require('@playwright/test');
const path = require('path');

const BASE = 'http://localhost:5173';
const SHOTS = path.join(__dirname, '../../screenshots');

test('04-websocket-two-clients', async ({ browser }) => {
  // Two separate browser contexts = two independent clients
  const ctx1 = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page1 = await ctx1.newPage();
  const page2 = await ctx2.newPage();

  // Login both as Carol on the same public problem (problem 3 = Valid Parentheses)
  for (const page of [page1, page2]) {
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"]', 'carol@example.com');
    await page.fill('input[type="password"]', 'candidate123');
    await page.click('button:has-text("Log in")');
    await page.waitForURL(`${BASE}/dashboard`);
    await page.goto(`${BASE}/problems/3`);
    await page.waitForSelector('.pd-chat', { timeout: 15000 });
    await page.waitForTimeout(3000); // let socket connect + initial message load
  }

  // Screenshot both clients at the same state (same conversation loaded)
  await page1.screenshot({ path: `${SHOTS}/04-websocket-client1-initial.png`, fullPage: false });
  await page2.screenshot({ path: `${SHOTS}/04-websocket-client2-initial.png`, fullPage: false });

  // Send message from Client 1
  await page1.fill('.pd-chat-input', 'Can binary search work on unsorted arrays?');
  await page1.click('.pd-send-btn');
  await page1.waitForTimeout(500);

  // Screenshot Client 1 showing message sent + typing indicator
  await page1.screenshot({ path: `${SHOTS}/04-websocket-client1-sent.png`, fullPage: false });

  // Screenshot Client 2 — should show typing indicator synced via Socket.IO
  await page2.screenshot({ path: `${SHOTS}/04-websocket-client2-synced.png`, fullPage: false });

  // Wait for reply then screenshot both
  await page1.waitForTimeout(5000);
  await page1.screenshot({ path: `${SHOTS}/04-websocket-client1-reply.png`, fullPage: false });
  await page2.screenshot({ path: `${SHOTS}/04-websocket-client2-reply.png`, fullPage: false });

  await ctx1.close();
  await ctx2.close();
});
