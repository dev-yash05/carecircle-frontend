import { expect, test } from "@playwright/test";

test.describe("vitals tab", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/patients");
    const firstPatient = page.locator('a[href^="/patients/"]').first();
    test.skip(!(await firstPatient.isVisible()), "No patients available in this org.");

    await firstPatient.click();
    await page.getByRole("link", { name: /vitals/i }).click();
  });

  test("vitals tab loads without errors", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /^Vitals$/i })).toBeVisible();
    await expect(page.getByText(/Track trends and anomalies over time\./i)).toBeVisible();
  });

  test("vital type tabs switch the chart and table", async ({ page }) => {
    await page.getByRole("button", { name: /blood sugar/i }).click();
    await page.getByRole("button", { name: /spo2/i }).click();
    await page.getByRole("button", { name: /temperature/i }).click();
    await expect(page.getByRole("heading", { name: /recent readings/i })).toBeVisible();
  });

  test("Record vital dialog opens", async ({ page }) => {
    const trigger = page.getByRole("button", { name: /record vital/i }).first();
    test.skip(!(await trigger.isVisible()), "Current role is likely VIEWER.");

    await trigger.click();
    await expect(page.getByRole("heading", { name: /record a vital/i })).toBeVisible();
  });

  test("switching vital type to SpO2 shows single value field", async ({ page }) => {
    const trigger = page.getByRole("button", { name: /record vital/i }).first();
    test.skip(!(await trigger.isVisible()), "Current role is likely VIEWER.");

    await trigger.click();
    await page.getByLabel(/vital type/i).selectOption("SPO2");
    await expect(page.getByLabel(/SpO2 \(%\)/i)).toBeVisible();
  });
});
