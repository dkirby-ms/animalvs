import { defineConfig } from "@playwright/test";

if (!process.env.TEST_DATABASE_URL) throw new Error("Run npm run test:browser to provision an isolated database.");

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  use: { baseURL: "http://127.0.0.1:41873", trace: "retain-on-failure" },
  webServer: [
    {
      command: "node --import tsx apps/api/src/dev.ts",
      env: {
        DATABASE_URL: process.env.TEST_DATABASE_URL, NODE_ENV: "development",
        LOCAL_AUTH_ENABLED: "true", PORT: "31873",
      },
      url: "http://127.0.0.1:31873/api/config", reuseExistingServer: false,
    },
    {
      command: "npm run dev -w @animalvs/web -- --port 41873 --strictPort",
      env: { API_PROXY_TARGET: "http://127.0.0.1:31873" },
      url: "http://127.0.0.1:41873", reuseExistingServer: false,
    },
  ],
});
