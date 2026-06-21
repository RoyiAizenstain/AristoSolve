const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 120000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    headless: false,
    video: 'on',
    viewport: { width: 1280, height: 720 },
  },
  reporter: [['list']],
  outputDir: './demo-output',
});
