import { expect, test } from "@playwright/test";

test.describe("doses tab", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/patients");
    const firstPatient = page.locator('a[href^="/patients/"]').first();
    test.skip(!(await firstPatient.isVisible()), "No patients available in this org.");

    await firstPatient.click();
    await page.getByRole("link", { name: /doses/i }).click();
  });

  test("doses tab loads without errors", async ({ page }) => {
    await expect(page.getByRole("link", { name: /^Doses$/i })).toBeVisible();
    await expect(page.getByText(/No doses scheduled yet\.|Page \d+ of \d+/i)).toBeVisible();
  });

  test("status filter tabs render and are clickable", async ({ page }) => {
    for (const filter of ["All", "Pending", "Taken", "Skipped", "Missed"]) {
      await page.getByRole("button", { name: filter }).click();
      await expect(page.getByRole("button", { name: filter })).toBeVisible();
    }
  });

  test("Mark dose dialog opens", async ({ page }) => {
    const markButton = page.getByRole("button", { name: /^Mark$/i }).first();
    test.skip(!(await markButton.isVisible()), "No PENDING doses to mark.");

    await markButton.click();
    await expect(page.getByRole("heading", { name: /Mark /i })).toBeVisible();
  });

  test("cancelling mark dialog closes it", async ({ page }) => {
    const markButton = page.getByRole("button", { name: /^Mark$/i }).first();
    test.skip(!(await markButton.isVisible()), "No PENDING doses to mark.");

    await markButton.click();
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page.getByRole("button", { name: /confirm taken|confirm skipped/i })).toHaveCount(0);
  });

  test("marking a dose as TAKEN shows success toast", async ({ page }) => {
    const markButton = page.getByRole("button", { name: /^Mark$/i }).first();
    test.skip(!(await markButton.isVisible()), "No PENDING doses to mark.");

    await markButton.click();
    await page.getByRole("button", { name: /confirm taken/i }).click();
    await expect(page.getByText(/Dose marked as taken|Already marked by someone else/i)).toBeVisible();
  });
});
