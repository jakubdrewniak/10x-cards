import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/HomePage";

test.describe("Home page", () => {
  test("should load the home page successfully", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Verify the page title
    await expect(page).toHaveTitle(/10x Cards/);

    // Verify the main heading is visible
    await expect(homePage.heading).toBeVisible();
  });

  test("should navigate to different sections of the site", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Navigate to About section (example)
    await homePage.navigateTo("About");

    // Verify we're on the About page
    await expect(page).toHaveURL(/.*about/);
  });

  test("should show login form when login button is clicked", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Click the login button
    await homePage.clickLogin();

    // Verify the login form appears
    await expect(page.getByRole("form")).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();

    // Take a screenshot for visual comparison
    await expect(page).toHaveScreenshot("login-form.png");
  });
});
