import { defineConfig } from '@playwright/test';

// Local servers only. Database credentials are empty; Maps/analytics IDs are synthetic.
// Browser tests intercept third-party requests so no real integrations are contacted.
export const fixtureEnvironment = {
  CONTENT_API_URL: 'http://127.0.0.1:4329',
  CONTENT_API_TIMEOUT_MS: '5000',
  SITE_URL: 'https://central-asia.live',
  NEXT_PUBLIC_URL: '',
  NEXTAUTH_URL: 'https://127.0.0.1:3217', NEXTAUTH_SECRET: 'isolated-browser-fixture-secret-never-use-in-production',
  ADMIN_MONGODB_URI: 'mongodb://127.0.0.1:4330', DB_HOST: '', DB_PORT: '', DB_NAME: 'guidebook_admin_fixture', MONGODB_URI: '',
  ADMIN_TRUSTED_IP_HEADER: '',
  CONTACT_MONGODB_URI: '', CONTACT_MONGODB_DATABASE: '', CONTACT_ORIGIN: '',
  CONTACT_RATE_LIMIT_SECRET: '', GOOGLE_ANALYTICS_ID: 'G-TESTONLY', GOOGLE_MAPS_API_KEY: 'test-only-not-a-valid-key',
};

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: { baseURL: 'http://127.0.0.1:3217', headless: true },
  webServer: [
    {
      command: 'node tests/fixtures/admin-server.mjs',
      url: 'http://127.0.0.1:4331',
      reuseExistingServer: false,
      timeout: 30000,
    },
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
