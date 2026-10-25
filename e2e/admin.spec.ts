import { expect, test } from "@playwright/test";
import { mockPortalApi } from "./support";

test("admin can sign in and access administrative navigation", async ({ page }) => {
  await mockPortalApi(page, "ADMIN");
  await page.goto("/");
  await page.getByLabel("Email address").fill("admin@example.test");
  await page.locator('input[type="password"]').fill("valid-password");
  await page.getByRole("button", { name: "Sign in to TiT" }).click();
  await expect(page.getByText(/Administration/i).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Students", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Courses", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Administrators", exact: true })).toHaveCount(0);
});

test("admin login failure remains on the sign-in form", async ({ page }) => {
  await mockPortalApi(page, "ADMIN");
  await page.goto("/");
  await page.getByLabel("Email address").fill("admin@example.test");
  await page.locator('input[type="password"]').fill("wrong-password");
  await page.getByRole("button", { name: "Sign in to TiT" }).click();
  await expect(page.getByText("Invalid email or password.", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sign in to administration" })).toBeVisible();
});
