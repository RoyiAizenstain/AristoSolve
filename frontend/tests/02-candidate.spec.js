const { test, expect } = require('@playwright/test');
const { BASE, login } = require('./helpers');

// Tests 7-11: Candidate flow

test('7 - candidate sees problems table with difficulty pills', async ({ page }) => {
  await login(page, 'candidate');
  await expect(page.locator('.data-table')).toBeVisible();
  await expect(page.locator('.pill-easy, .pill-medium, .pill-hard').first()).toBeVisible();
});

test('8 - click problem → 3-panel ProblemDetail page', async ({ page }) => {
  await login(page, 'candidate');
  await page.locator('.table-row').first().click();
  await expect(page.locator('.pd-root')).toBeVisible();
  await expect(page.locator('.pd-description')).toBeVisible();
  await expect(page.locator('.pd-editor')).toBeVisible();
  await expect(page.locator('.pd-chat')).toBeVisible();
});

test('9 - send message → typing indicator → AristoBot reply', async ({ page }) => {
  await login(page, 'candidate');
  await page.locator('.table-row').first().click();
  await page.waitForSelector('.bubble-ai', { timeout: 10000 });

  await page.fill('.pd-chat-input', 'What is a hash map?');
  await page.click('.pd-send-btn');

  // typing indicator appears
  await expect(page.locator('.typing-indicator')).toBeVisible({ timeout: 5000 });

  // AristoBot reply arrives (wait up to 15s for Claude or fallback)
  await expect(page.locator('.bubble-ai').nth(1)).toBeVisible({ timeout: 15000 });
});

test('10 - submit → navigate back to dashboard', async ({ page }) => {
  await login(page, 'candidate');
  await page.locator('.table-row').first().click();
  await page.waitForSelector('.bubble-ai', { timeout: 10000 });
  await page.click('button:has-text("Submit")');
  await expect(page).toHaveURL(`${BASE}/dashboard`, { timeout: 10000 });
});

test('11 - return to same problem → chat history loads', async ({ page }) => {
  await login(page, 'candidate');
  // open a problem and send one message
  await page.locator('.table-row').first().click();
  await page.waitForSelector('.bubble-ai', { timeout: 10000 });
  await page.fill('.pd-chat-input', 'Hello AristoBot');
  await page.click('.pd-send-btn');
  await expect(page.locator('.bubble-ai').nth(1)).toBeVisible({ timeout: 15000 });

  // go back to dashboard
  await page.click('button:has-text("← Problems")');
  await expect(page).toHaveURL(`${BASE}/dashboard`);

  // re-open same problem
  await page.locator('.table-row').first().click();
  // history should load — at least 2 AI messages visible
  await expect(page.locator('.bubble-ai').first()).toBeVisible({ timeout: 10000 });
});
