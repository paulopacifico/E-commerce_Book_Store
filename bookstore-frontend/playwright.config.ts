import { defineConfig, devices } from '@playwright/test';

const backendUrl = 'http://127.0.0.1:8081/api/books/5';
const frontendUrl = 'http://127.0.0.1:4300/books/5';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 1 : 0,
  workers: 1,
  reporter: process.env['CI'] ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4300',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'mvn -q spring-boot:run -Dspring-boot.run.arguments=--server.port=8081',
      cwd: '..',
      url: backendUrl,
      timeout: 120_000,
      reuseExistingServer: false,
    },
    {
      command: 'npm run start:e2e',
      url: frontendUrl,
      timeout: 120_000,
      reuseExistingServer: false,
    },
  ],
});
