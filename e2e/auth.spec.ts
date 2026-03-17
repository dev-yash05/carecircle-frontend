import { expect, test } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("authentication and public access", () => {
  const protectedRoutes = ["/dashboard", "/patients", "/team", "/superadmin"];

  for (const route of protectedRoutes) {
    test(`visiting ${route} redirects to /login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login$/);
    });
  }

  test("renders the CareCircle brand mark", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Welcome to CareCircle")).toBeVisible();
  });

  test("renders the Google sign-in button", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /continue with google/i })).toBeVisible();
  });

  test("Google button navigates to backend OAuth endpoint", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /continue with google/i }).click();

    await expect
      .poll(() => {
        const currentUrl = page.url();
        return (
          currentUrl.includes("oauth2/authorization/google") ||
          currentUrl.includes("accounts.google.com")
        );
      }, { timeout: 5_000 })
      .toBeTruthy();
  });

  test("shows 'return to your page' when ?from param is present", async ({ page }) => {
    await page.goto("/login?from=%2Fpatients");
    await expect(page.getByText(/return to your page/i)).toBeVisible();
  });
});
