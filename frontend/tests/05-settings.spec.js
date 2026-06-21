const { test, expect } = require('@playwright/test');
const { BASE, login } = require('./helpers');

// Tests 22-23: Settings

test('22 - change display name → settings PUT request succeeds', async ({ page }) => {
  await login(page, 'candidate');
  await page.goto(`${BASE}/settings`);
  const input = page.locator('input[type="text"]').first();
  await input.focus();
  await page.keyboard.press('Control+A');
  await input.pressSequentially(`Carol ${Date.now()}`, { delay: 30 });
  await expect(page.locator('button:has-text("Save changes")')).toBeEnabled({ timeout: 5000 });
  // Intercept PUT /api/settings and verify 200 response
  const [response] = await Promise.all([
    page.waitForResponse(r => r.url().includes('/api/settings') && r.request().method() === 'PUT', { timeout: 8000 }),
    page.click('button:has-text("Save changes")'),
  ]);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.success).toBe(true);
});

test('23 - toggle theme → page switches appearance', async ({ page }) => {
  await login(page, 'candidate');
  // check initial theme (dark by default)
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'dark');
  // click theme toggle in navbar
  await page.click('.theme-toggle, button[aria-label*="theme" i], button:has-text("☀"), button:has-text("🌙")');
  await expect(html).toHaveAttribute('data-theme', 'light');
  // toggle back
  await page.click('.theme-toggle, button[aria-label*="theme" i], button:has-text("☀"), button:has-text("🌙")');
  await expect(html).toHaveAttribute('data-theme', 'dark');
});
