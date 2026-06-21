// Shared helpers used across all test files

const BASE = 'http://localhost:5173';

const USERS = {
  admin:     { email: 'alice@example.com',  password: 'admin123',     role: 'admin' },
  company:   { email: 'bob@example.com',    password: 'company123',   role: 'company' },
  candidate: { email: 'carol@example.com',  password: 'candidate123', role: 'candidate' },
  candidate2:{ email: 'dave@example.com',   password: 'candidate123', role: 'candidate' },
};

async function login(page, role = 'candidate') {
  const user = USERS[role];
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.click('button:has-text("Log in")');
  await page.waitForURL(`${BASE}/dashboard`);
}

async function logout(page) {
  await page.click('button:has-text("Logout")');
  await page.waitForURL(`${BASE}/login`);
}

module.exports = { BASE, USERS, login, logout };
