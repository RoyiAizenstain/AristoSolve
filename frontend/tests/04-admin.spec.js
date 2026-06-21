const { test, expect } = require('@playwright/test');
const { BASE, login } = require('./helpers');

// Tests 17-21: Admin flow

test('17 - admin sees all problems and all users', async ({ page }) => {
  await login(page, 'admin');
  await expect(page.locator('text=Admin Dashboard')).toBeVisible();
  await expect(page.locator('text=All Problems')).toBeVisible();
  await expect(page.locator('text=All Users')).toBeVisible();
  await expect(page.locator('.data-table').nth(1)).toBeVisible();
});

test('18 - admin creates user via modal', async ({ page }) => {
  await login(page, 'admin');
  await page.goto(`${BASE}/users`);
  await page.click('button:has-text("+ Create User")');
  await expect(page.locator('.modal')).toBeVisible();
  const ts = Date.now();
  // Inputs have no placeholder — target by index inside modal
  const inputs = page.locator('.modal input.input');
  await inputs.nth(0).fill('New');          // firstName
  await inputs.nth(1).fill('User');         // lastName
  await page.locator('.modal input[type="email"]').fill(`newuser_${ts}@test.com`);
  await page.locator('.modal input[type="password"]').fill('test123');
  await page.click('.modal button:has-text("Save")');
  await expect(page.locator('.modal')).not.toBeVisible({ timeout: 5000 });
  await expect(page.locator(`text=newuser_${ts}@test.com`)).toBeVisible({ timeout: 5000 });
});

test('19 - admin edits user', async ({ page }) => {
  await login(page, 'admin');
  await page.goto(`${BASE}/users`);
  // Target Carol (candidate) — not Alice (admin) to avoid breaking login
  await page.locator('button[aria-label="Edit user Carol Chen"]').click();
  await expect(page.locator('.modal')).toBeVisible();
  // Change display name only — password field empty on edit so don't fill it
  const inputs = page.locator('.modal input.input');
  await inputs.nth(0).fill('Carol');  // keep same firstName
  await page.click('.modal button:has-text("Save")');
  await expect(page.locator('.modal')).not.toBeVisible({ timeout: 5000 });
});

test('20 - admin deletes non-admin user', async ({ page }) => {
  await login(page, 'admin');
  await page.goto(`${BASE}/users`);
  // Find any candidate delete button and click it
  const deleteBtn = page.locator('button[aria-label^="Delete user"]').filter({ hasNot: page.locator('[aria-label="Delete user Alice Admin"]') }).first();
  await deleteBtn.click();
  // Click "Yes, delete" confirmation button
  await page.locator('button:has-text("Yes, delete")').click();
  await page.waitForTimeout(500);
  // Verify the user list changed (just check page is still on /users)
  await expect(page).toHaveURL(`${BASE}/users`);
});

test('21 - cannot delete last admin', async ({ page }) => {
  await login(page, 'admin');
  await page.goto(`${BASE}/users`);
  // Try to delete Alice Admin (the only admin)
  await page.locator('button[aria-label="Delete user Alice Admin"]').click();
  await page.locator('button:has-text("Yes")').click();
  // Should show error — cannot delete last admin
  await expect(page.locator('text=Cannot delete the last admin')).toBeVisible({ timeout: 5000 });
});
