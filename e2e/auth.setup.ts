import fs from "fs";
import path from "path";
import { test as setup } from "@playwright/test";

const authDir = path.join(__dirname, ".auth");
const authFile = path.join(authDir, "user.json");

setup("authenticate", async ({ page, context }) => {
  const token = process.env.CARECIRCLE_TEST_TOKEN;

  if (!token) {
    setup.skip(true, "CARECIRCLE_TEST_TOKEN not set. Skipping authenticated setup.");
  }

  fs.mkdirSync(authDir, { recursive: true });

  await page.goto("/login");

  await context.addCookies([
    {
      name: "access_token",
      value: token ?? "",
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  await context.storageState({ path: authFile });
});
