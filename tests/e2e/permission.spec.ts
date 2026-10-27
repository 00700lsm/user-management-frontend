import { expect, test } from "@playwright/test";

// G1 Mock UI only. A live Backend is not required for this file.
test("admin reviews roles and replaces a user's role set", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Mock ADMIN" }).click();
  await expect(page.getByRole("heading", { name: "사용자 관리" })).toBeVisible();

  await page.getByRole("link", { name: "역할 관리" }).click();
  await expect(page.getByRole("heading", { name: "역할 관리" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Administrator" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "General user" })).toBeVisible();

  await page.getByRole("link", { name: "사용자 관리" }).click();
  await page.getByRole("link", { name: "dev-user" }).click();
  await page.getByRole("link", { name: "권한 관리" }).click();
  await expect(page.getByRole("heading", { name: "사용자 권한" })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: /General user/ })).toBeChecked();

  await page.getByRole("checkbox", { name: /General user/ }).uncheck();
  await page.getByRole("button", { name: "권한 저장" }).click();
  await expect(page.getByRole("alert")).toContainText("역할을 하나 이상 선택해 주세요.");

  await page.getByRole("checkbox", { name: /General user/ }).check();
  await page.getByRole("checkbox", { name: /Administrator/ }).check();
  await page.getByRole("button", { name: "권한 저장" }).click();
  await expect(page.getByRole("status")).toContainText("역할을 저장했습니다.");
  await expect(page.getByRole("checkbox", { name: /Administrator/ })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: /General user/ })).toBeChecked();
});

test("a missing user shows the not-found message", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Mock ADMIN" }).click();
  await expect(page.getByRole("heading", { name: "사용자 관리" })).toBeVisible();
  await page.goto("/admin/users/9999/roles");
  await expect(page.getByRole("alert")).toContainText("사용자를 찾을 수 없습니다.");
  await expect(page.getByRole("checkbox")).toHaveCount(0);
});
