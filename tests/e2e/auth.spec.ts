import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

// G1 Mock UI only (MSW fixtures). NOT real Auth, BE contract validation, G3 or G4.
const PW = "mock-password-12";
const NEW_PW = "brand-new-password-1";

async function login(page: Page, loginId: string, password = PW) {
  await page.goto("/login");
  await page.getByLabel("로그인 ID").fill(loginId);
  await page.getByLabel("비밀번호", { exact: true }).fill(password);
  await page.getByRole("button", { name: "로그인", exact: true }).click();
}

test("login then logout returns to /login", async ({ page }) => {
  await login(page, "dev-user");
  await expect(page.getByRole("heading", { name: "내 정보" })).toBeVisible();
  await page.getByRole("button", { name: "로그아웃" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/me");
  await expect(page).toHaveURL(/\/login$/);
});

test("empty submit is blocked; wrong, INACTIVE and unknown accounts share one message", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(page.getByLabel("로그인 ID")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("로그인 ID를 입력해 주세요.")).toBeVisible();
  for (const [id, pw] of [["dev-user", "wrong-password"], ["inactive-user", PW], ["withdrawn-user", PW]]) {
    await login(page, id, pw);
    await expect(page.getByRole("alert")).toContainText("아이디 또는 비밀번호가 올바르지 않습니다.");
  }
});

test("change password: errors keep the session, success forces re-login", async ({ page }) => {
  await login(page, "dev-user");
  await page.getByRole("link", { name: "비밀번호 변경" }).click();
  await expect(page.getByRole("heading", { name: "비밀번호 변경" })).toBeVisible();

  await page.getByLabel("이전 비밀번호", { exact: true }).fill(PW);
  await page.getByLabel("새 비밀번호", { exact: true }).fill(NEW_PW);
  await page.getByLabel("새 비밀번호 확인", { exact: true }).fill("something-else-123");
  await page.getByRole("button", { name: "비밀번호 변경", exact: true }).click();
  await expect(page.getByText("새 비밀번호가 일치하지 않습니다.")).toBeVisible();

  await page.getByLabel("이전 비밀번호", { exact: true }).fill("wrong-old-password");
  await page.getByLabel("새 비밀번호 확인", { exact: true }).fill(NEW_PW);
  await page.getByRole("button", { name: "비밀번호 변경", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("이전 비밀번호가 올바르지 않습니다.");
  await expect(page).toHaveURL(/\/settings\/password$/);

  await page.getByLabel("이전 비밀번호", { exact: true }).fill(PW);
  await page.getByRole("button", { name: "비밀번호 변경", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("비밀번호가 변경되었습니다");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("status")).toContainText("새 비밀번호로 다시 로그인해 주세요.");
  await page.goto("/me");
  await expect(page).toHaveURL(/\/login$/);
});

test("401 from an API sends the user to /login with the expiry notice", async ({ page }) => {
  await login(page, "revoked-user"); // mock: /users/me answers 401
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("status")).toContainText("로그인이 만료되었습니다. 다시 로그인해 주세요.");
});

test("token exp timer logs the user out with the expiry notice", async ({ page }) => {
  await login(page, "short-lived"); // mock token lives 3s
  await expect(page.getByRole("heading", { name: "내 정보" })).toBeVisible();
  await expect(page).toHaveURL(/\/login$/, { timeout: 8_000 });
  await expect(page.getByRole("status")).toContainText("로그인이 만료되었습니다. 다시 로그인해 주세요.");
});

test("403 shows the re-login notice without logging out", async ({ page }) => {
  await login(page, "forbidden-user"); // mock: /users/me answers 403
  const alert = page.getByRole("alert").filter({ hasText: "접근 권한이 없습니다. 권한이 변경되었다면 다시 로그인해 주세요." });
  await expect(alert).toBeVisible();
  await expect(page).toHaveURL(/\/me$/); // still logged in
  await alert.getByRole("button", { name: "재로그인" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/me");
  await expect(page).toHaveURL(/\/login$/);
});
