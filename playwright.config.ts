import { defineConfig } from '@playwright/test';

// Both servers are local. Empty integrations override any developer .env values.
export const fixtureEnvironment = {
  CONTENT_API_URL: 'http://127.0.0.1:4329',
  CONTENT_API_TIMEOUT_MS: '5000',
  SITE_URL: 'https://central-asia.live',
  NEXT_PUBLIC_URL: '',
  NEXTAUTH_URL: 'http://127.0.0.1:3217', NEXTAUTH_SECRET: '',
  ADMIN_MONGODB_URI: '', DB_HOST: '', DB_PORT: '', DB_NAME: '', MONGODB_URI: '',
  CONTACT_MONGODB_URI: '', CONTACT_MONGODB_DATABASE: '', CONTACT_ORIGIN: '',
  CONTACT_RATE_LIMIT_SECRET: '', GOOGLE_ANALYTICS_ID: '', GOOGLE_MAPS_API_KEY: '',
};

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: { baseURL: 'http://127.0.0.1:3217', headless: true },
  webServer: [
    {
      command: 'rustc tests/fixtures/content-server.rs -o /tmp/guidebook-content-fixture && /tmp/guidebook-content-fixture',
      url: 'http://127.0.0.1:4329/health',
      reuseExistingServer: false,
    },
    {
      command: 'npm run build && npm start -- --hostname 127.0.0.1 --port 3217',
      url: 'http://127.0.0.1:3217/en',
      env: fixtureEnvironment,
      reuseExistingServer: false,
      timeout: 180000,
    },
  ],
});
