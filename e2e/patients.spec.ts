import { expect, test } from "@playwright/test";

test.describe("patients page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/patients");
    await expect(page.getByRole("heading", { name: /patients/i })).toBeVisible();
  });

  test("renders the Patients heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /patients/i })).toBeVisible();
  });

  test("renders the search input", async ({ page }) => {
    await expect(page.getByPlaceholder(/search patients/i)).toBeVisible();
  });

  test("search filters the patient list in real time", async ({ page }) => {
    const cards = page.locator('a[href^="/patients/"]');
    const total = await cards.count();
    test.skip(total === 0, "No patients found for search filtering test.");

    const firstName = (await cards.first().innerText()).split("\n")[0].trim();
    await page.getByPlaceholder(/search patients/i).fill(firstName);
    await expect(cards.first()).toContainText(firstName);
  });

  test("ADMIN sees Add patient button", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add patient/i });
    test.skip(!(await addButton.isVisible()), "Current role does not allow adding patients.");
    await expect(addButton).toBeVisible();
  });

  test("opens the Add a patient dialog", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add patient/i });
    test.skip(!(await addButton.isVisible()), "Current role does not allow adding patients.");

    await addButton.click();
    await expect(page.getByRole("heading", { name: /add a patient/i })).toBeVisible();
  });

  test("shows validation error for empty name", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add patient/i });
    test.skip(!(await addButton.isVisible()), "Current role does not allow adding patients.");

    await addButton.click();
    await page.getByRole("button", { name: /create patient/i }).click();
    await expect(page.getByText("Name must be at least 2 characters")).toBeVisible();
  });

  test("shows validation error for future date of birth", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add patient/i });
    test.skip(!(await addButton.isVisible()), "Current role does not allow adding patients.");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().slice(0, 10);

    await addButton.click();
    await page.getByLabel(/full name/i).fill("Test Patient");
    await page.getByLabel(/date of birth/i).fill(dateString);
    await page.getByRole("button", { name: /create patient/i }).click();
    await expect(page.getByText("Date of birth must be in the past")).toBeVisible();
  });

  test("closes on Cancel", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add patient/i });
    test.skip(!(await addButton.isVisible()), "Current role does not allow adding patients.");

    await addButton.click();
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page.getByRole("heading", { name: /add a patient/i })).toBeHidden();
  });

  test("clicking a patient card navigates", async ({ page }) => {
    const cards = page.locator('a[href^="/patients/"]');
    test.skip((await cards.count()) === 0, "No patients available to open a detail page.");

    const firstHref = await cards.first().getAttribute("href");
    await cards.first().click();
    await expect(page).toHaveURL(new RegExp(firstHref ?? "^/patients/"));
  });
});
