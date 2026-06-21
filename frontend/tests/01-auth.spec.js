const { test, expect } = require('@playwright/test');
const { BASE, USERS, login, logout } = require('./helpers');

// Tests 1-5: Auth flow

test('1 - candidate login → dashboard', async ({ page }) => {
  await login(page, 'candidate');
  await expect(page).toHaveURL(`${BASE}/dashboard`);
  await expect(page.locator('text=AI-Guided Problems')).toBeVisible();
});

test('2 - company login → company dashboard', async ({ page }) => {
  await login(page, 'company');
  await expect(page.locator('text=Company Dashboard')).toBeVisible();
  await expect(page.locator('text=My Problems')).toBeVisible();
});

test('3 - admin login → admin dashboard', async ({ page }) => {
  await login(page, 'admin');
  await expect(page.locator('text=Admin Dashboard')).toBeVisible();
  await expect(page.locator('text=All Users')).toBeVisible();
});

test('4 - wrong password → error message', async ({ page }) => {
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', 'alice@example.com');
  await page.fill('input[type="password"]', 'wrongpassword');
  await page.click('button:has-text("Log in")');
  await expect(page.locator('text=Invalid email or password')).toBeVisible();
  await expect(page).toHaveURL(`${BASE}/login`);
});

test('5 - logout → redirect to /login', async ({ page }) => {
  await login(page, 'candidate');
  await logout(page);
  await expect(page).toHaveURL(`${BASE}/login`);
});

test('6 - register new candidate → dashboard', async ({ page }) => {
  await page.goto(`${BASE}/register`);
  const email = `test_${Date.now()}@example.com`;
  await page.fill('#firstName', 'Test');
  await page.fill('#lastName', 'User');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', 'test123');
  // select candidate role
  await page.click('label:has-text("Candidate"), .role-option:has-text("Candidate")');
  await page.click('button:has-text("Create account")');
  await expect(page).toHaveURL(`${BASE}/dashboard`);
});
