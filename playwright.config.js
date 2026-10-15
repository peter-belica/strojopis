import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: 3,
  timeout: 30000,
  expect: { timeout: 7000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:4174', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } }
  ],
  // E2E always consumes built static files, without a Vite development server.
  webServer: { command: 'python3 -m http.server 4174 --bind 127.0.0.1 --directory dist', url: 'http://127.0.0.1:4174', reuseExistingServer: false, stdout: 'ignore', stderr: 'ignore' }
});
