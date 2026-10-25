import { defineConfig, devices } from "@playwright/test";

const isWindows = process.platform === "win32";
const npm = isWindows ? "npm.cmd" : "npm";
const appServer = (app: string, port: number) =>
  `${npm} run dev --prefix ${app} -- --hostname 127.0.0.1 --port ${port}`;
const apiMockEnv = { NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:8080" };

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 3,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: { trace: "retain-on-failure", screenshot: "only-on-failure", video: "retain-on-failure" },
  projects: [
    {
      name: "student-chromium",
      testMatch: "student.spec.ts",
      use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:3000" },
    },
    {
      name: "teacher-chromium",
      testMatch: "teacher.spec.ts",
      use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:3001" },
    },
    {
      name: "admin-chromium",
      testMatch: "admin.spec.ts",
      use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:3002" },
    },
  ],
  webServer: [
    {
      command: appServer("student", 3000),
      url: "http://127.0.0.1:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: apiMockEnv,
    },
    {
      command: appServer("teacher", 3001),
      url: "http://127.0.0.1:3001",
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: apiMockEnv,
    },
    {
      command: appServer("admin", 3002),
      url: "http://127.0.0.1:3002",
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: apiMockEnv,
    },
  ],
});
