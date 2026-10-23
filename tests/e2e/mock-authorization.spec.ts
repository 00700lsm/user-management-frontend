import { expect, test } from "@playwright/test";

test("mock USER cannot see admin page and mock ADMIN can enter", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Mock USER" }).click();
  await page.waitForURL("**/me"); // mock login is async (fixtures load via dynamic import)
  await page.goto("/admin/users");
  await expect(page.getByRole("heading", { name: "접근 권한이 없습니다" })).toBeVisible();
  await page.goto("/login");
  await page.getByRole("button", { name: "Mock ADMIN" }).click();
  await expect(page.getByRole("heading", { name: "사용자 관리" })).toBeVisible();
});
// Frontend-only G1; NOT real Auth, BE contract validation or G4 E2E.
