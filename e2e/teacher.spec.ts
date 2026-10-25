import { expect, test, type Page } from "@playwright/test";
import { mockPortalApi } from "./support";

async function signInAsTeacher(page: Page) {
  await page.getByLabel("Email address").fill("teacher@example.test");
  await page.locator('input[type="password"]').fill("valid-password");
  await page.getByRole("button", { name: "Sign in to TiT" }).click();
}

test("teacher can access courses and assignments", async ({ page }) => {
  await mockPortalApi(page, "TEACHER");
  await page.goto("/");
  await signInAsTeacher(page);
  await page
    .getByRole("button", { name: /My Courses/ })
    .first()
    .click();
  await expect(page.getByRole("heading", { name: /My Courses/i })).toBeVisible();
  await page.getByRole("button", { name: "Assignments", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Assignments/i })).toBeVisible();
});

test("teacher profile loading failure offers recovery", async ({ page }) => {
  await mockPortalApi(page, "TEACHER", { failTeacherProfile: true });
  await page.goto("/");
  await signInAsTeacher(page);
  await expect(
    page.getByRole("heading", { name: "We could not load your teacher profile." }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
});

test("teacher portal rejects an account with the student role", async ({ page }) => {
  await mockPortalApi(page, "TEACHER", { loginRole: "STUDENT" });
  await page.goto("/");
  await signInAsTeacher(page);
  await expect(
    page.getByText("This account does not have access to the teacher workspace.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sign in to your workspace" })).toBeVisible();
});
