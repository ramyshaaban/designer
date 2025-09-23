import { test, expect } from "@playwright/test";

test("sign in and access designer", async ({ page }) => {
  await page.goto("/signin");
  await page.getByPlaceholder("Email").fill("admin@demo.test");
  await page.getByPlaceholder("Password").fill("password");
  await Promise.all([
    page.waitForURL(/designer/),
    page.getByRole("button", { name: "Continue" }).click(),
  ]);
  await expect(page).toHaveURL(/designer/);
});


