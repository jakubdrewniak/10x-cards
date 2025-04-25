import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// W modułach ES musimy stworzyć __dirname samodzielnie
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.test
dotenv.config({ path: resolve(__dirname, ".env.test") });

// Validate required environment variables
const requiredEnvVars = ["E2E_USERNAME", "E2E_PASSWORD", "E2E_USER_ID"];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  console.error("Please add these to your .env.test file");

  // Don't fail immediately to allow developers to see this message
  if (process.env.CI) {
    process.exit(1);
  }
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "tests",
      testMatch: /.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
      teardown: "cleanup",
    },
    {
      name: "cleanup",
      testMatch: /global\.teardown\.ts/,
    },
  ],
  webServer: {
    command: "npm run astro dev -- --mode test",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
