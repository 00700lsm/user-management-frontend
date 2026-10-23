import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError } from "../../../shared/api/client";
import { FALLBACK_ERROR_MESSAGE, changePassword, getAuthErrorMessage, login, logout } from "./authApi";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const stubFetch = (res: Response) => { const f = vi.fn().mockResolvedValue(res); vi.stubGlobal("fetch", f); return f; };

afterEach(() => { vi.unstubAllGlobals(); sessionStorage.clear(); });

describe("login", () => {
  it.each(["Bearer", "bearer", "BEARER"])("accepts tokenType %s", async (tokenType) => {
    stubFetch(json({ accessToken: "a.b.c", tokenType }));
    await expect(login({ loginId: "u", password: "p" })).resolves.toBe("a.b.c");
  });
  it("does not throw a TypeError when tokenType is absent", async () => {
    stubFetch(json({ accessToken: "a.b.c" }));
    await expect(login({ loginId: "u", password: "p" })).resolves.toBe("a.b.c");
  });
  it("rejects other token types and malformed bodies with a mapped (non-English) message", async () => {
    stubFetch(json({ accessToken: "a.b.c", tokenType: "Basic" }));
    const err = await login({ loginId: "u", password: "p" }).catch(e => e);
    expect(err).toBeInstanceOf(ApiRequestError);
    expect(getAuthErrorMessage(err)).toBe(FALLBACK_ERROR_MESSAGE);
    stubFetch(json({}));
    await expect(login({ loginId: "u", password: "p" })).rejects.toBeInstanceOf(ApiRequestError);
  });
  it("keeps the server code on 401 without touching the session", async () => {
    sessionStorage.setItem("um_access_token", "keep");
    stubFetch(json({ code: "INVALID_CREDENTIALS", message: "Bad credentials" }, 401));
    const err = await login({ loginId: "u", password: "p" }).catch(e => e);
    expect(err).toMatchObject({ status: 401, code: "INVALID_CREDENTIALS" });
    expect(getAuthErrorMessage(err)).toBe("아이디 또는 비밀번호가 올바르지 않습니다.");
    expect(sessionStorage.getItem("um_access_token")).toBe("keep");
  });
});

describe("logout / changePassword", () => {
  it("send the Bearer header through apiRequest", async () => {
    sessionStorage.setItem("um_access_token", "tok");
    const f = stubFetch(new Response(null, { status: 204 }));
    await logout();
    await changePassword({ oldPassword: "a", newPassword: "b" });
    expect(f.mock.calls[0][0]).toBe("/api/auth/logout");
    expect(f.mock.calls[1][0]).toBe("/api/auth/password/change");
    for (const call of f.mock.calls) expect((call[1].headers as Record<string, string>).Authorization).toBe("Bearer tok");
    expect(f.mock.calls[1][1].body).toBe(JSON.stringify({ oldPassword: "a", newPassword: "b" }));
  });
  it("400 keeps the session and exposes the code", async () => {
    sessionStorage.setItem("um_access_token", "tok");
    stubFetch(json({ code: "INVALID_OLD_PASSWORD", message: "Old password mismatch" }, 400));
    const err = await changePassword({ oldPassword: "a", newPassword: "b" }).catch(e => e);
    expect(err).toMatchObject({ status: 400, code: "INVALID_OLD_PASSWORD" });
    expect(sessionStorage.getItem("um_access_token")).toBe("tok");
  });
  it("401 clears the session", async () => {
    sessionStorage.setItem("um_access_token", "tok");
    stubFetch(json({ code: "UNAUTHORIZED", message: "x" }, 401));
    await logout().catch(() => undefined);
    expect(sessionStorage.getItem("um_access_token")).toBeNull();
  });
});

describe("getAuthErrorMessage", () => {
  const cases: [string, string][] = [
    ["UNAUTHORIZED", "로그인이 만료되었습니다. 다시 로그인해 주세요."],
    ["FORBIDDEN", "접근 권한이 없습니다. 권한이 변경되었다면 다시 로그인해 주세요."],
    ["INVALID_CREDENTIALS", "아이디 또는 비밀번호가 올바르지 않습니다."],
    ["INVALID_OLD_PASSWORD", "이전 비밀번호가 올바르지 않습니다."],
    ["PASSWORD_POLICY_VIOLATION", "새 비밀번호는 12자 이상, 72바이트 이하로 입력해 주세요."],
    ["VALIDATION_FAILED", "입력 형식이 올바르지 않습니다. 입력값을 확인해 주세요."],
  ];
  it.each(cases)("%s", (code, message) => {
    expect(getAuthErrorMessage(new ApiRequestError(400, code, "English text"))).toBe(message);
  });
  it("falls back for unknown codes and non-API errors", () => {
    expect(getAuthErrorMessage(new ApiRequestError(500, "SOMETHING", "Internal error"))).toBe(FALLBACK_ERROR_MESSAGE);
    expect(getAuthErrorMessage(new TypeError("Failed to fetch"))).toBe(FALLBACK_ERROR_MESSAGE);
  });
});
