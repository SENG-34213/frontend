import { expect, test } from "@playwright/test";
import { assignment, mockPortalApi, studentCourse } from "./support";

test("student can sign in, browse courses and submit an assignment", async ({ page }) => {
  const requests = await mockPortalApi(page, "STUDENT");
  await page.goto("/");
  await page.getByLabel("Email address").fill("student@example.test");
  await page.locator('input[type="password"]').fill("valid-password");
  await page.getByRole("button", { name: "Sign in to TiT" }).click();
  await page.getByRole("button", { name: "My Courses", exact: true }).click();
  await expect(page.getByRole("heading", { name: "My Courses" })).toBeVisible();
  await expect(page.getByText(studentCourse.courseName)).toBeVisible();
  await page
    .getByRole("button", { name: /^Assignments/ })
    .first()
    .click();
  await expect(page.getByRole("heading", { name: assignment.title })).toBeVisible();
  await page.getByRole("button", { name: "Submit Work" }).click();
  await expect(page.getByRole("heading", { name: assignment.title })).toBeVisible();
  await page.getByRole("textbox").last().fill("Our project will support collaborative learning.");
  await page.getByRole("button", { name: "Submit Assignment for Grading" }).click();
  await expect(page.getByText(/Assignment submitted successfully/i)).toBeVisible();
  expect(
    requests.some((request) =>
      request.pathname.endsWith("/assignments/assignment-e2e-1/submissions"),
    ),
  ).toBeTruthy();
});

test("student login shows an accessible error and pending state", async ({ page }) => {
  await mockPortalApi(page, "STUDENT", { delayLoginMs: 450 });
  await page.goto("/");
  await page.getByLabel("Email address").fill("student@example.test");
  await page.locator('input[type="password"]').fill("wrong-password");
  await page.getByRole("button", { name: "Sign in to TiT" }).click();
  await expect(page.getByRole("button", { name: /Signing in/i })).toBeDisabled();
  await expect(page.getByText("Invalid email or password.", { exact: true })).toBeVisible();
});

test("student can reach quiz and communication views without teacher navigation", async ({
  page,
}) => {
  const requests = await mockPortalApi(page, "STUDENT");
  await page.goto("/?view=quizzes");
  await page.getByLabel("Email address").fill("student@example.test");
  await page.locator('input[type="password"]').fill("valid-password");
  await page.getByRole("button", { name: "Sign in to TiT" }).click();
  await expect(page.getByRole("heading", { name: "Quizzes & Knowledge Checks" })).toBeVisible();
  await expect(page.getByText("Project fundamentals", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Start Quiz" }).click();
  await page.getByRole("button", { name: "Begin Quiz" }).click();
  await expect
    .poll(() =>
      requests
        .filter((request) => request.pathname.includes("/quiz"))
        .map((request) => request.pathname),
    )
    .toContain("/api/quizzes/quiz-e2e-1/attempts");
  await expect(page.getByText("Question 1 of 1")).toBeVisible();
  await expect(
    page.getByText("Which activity should begin a software project?", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Understanding user needs" }).click();
  await page.getByRole("button", { name: "Review & Finish" }).click();
  await page.getByRole("button", { name: "Confirm & Submit" }).click();
  await expect(page.getByRole("dialog", { name: "Quiz Results" })).toBeVisible();
  await expect(page.getByText("100% · Passed with Distinction")).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Messages" }).click();
  await expect(
    page.getByRole("heading", { name: "Messages & Course Communication" }),
  ).toBeVisible();
  await page
    .getByPlaceholder("Write your academic query or message...")
    .fill("Could you clarify the project scope?");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByText("Could you clarify the project scope?", { exact: true })).toHaveCount(
    2,
  );
  await expect(page.getByText("Teacher Portal", { exact: true })).toHaveCount(0);
});
