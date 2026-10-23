import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError } from "../../../shared/api/client";
import { USER_FALLBACK_ERROR_MESSAGE, getMyProfile, getUserErrorMessage } from "./userApi";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const stubFetch = (res: Response) => { const f = vi.fn().mockResolvedValue(res); vi.stubGlobal("fetch", f); return f; };
const ME = { id: 1001, loginId: "dev-user", name: "사용자 예시", email: "user@example.test", status: "ACTIVE", createdAt: "2026-01-01T00:00:00Z" };

afterEach(() => { vi.unstubAllGlobals(); sessionStorage.clear(); });

describe("getMyProfile", () => {
  it("GETs /api/users/me with the Bearer token and returns the User", async () => {
    sessionStorage.setItem("um_access_token", "tok");
    const f = stubFetch(json(ME));
    await expect(getMyProfile()).resolves.toEqual(ME);
    expect(f.mock.calls[0][0]).toBe("/api/users/me");
    expect(f.mock.calls[0][1].method ?? "GET").toBe("GET");
    expect((f.mock.calls[0][1].headers as Record<string, string>).Authorization).toBe("Bearer tok");
  });
  it("keeps the server code on failure", async () => {
    stubFetch(json({ code: "FORBIDDEN", message: "Access denied" }, 403));
    await expect(getMyProfile()).rejects.toMatchObject({ status: 403, code: "FORBIDDEN" });
  });
});

describe("getUserErrorMessage", () => {
  it("maps known codes to Korean, never the raw server text", () => {
    expect(getUserErrorMessage(new ApiRequestError(403, "FORBIDDEN", "Access denied")))
      .toBe("이 정보를 볼 권한이 없습니다.");
  });
  it("falls back for unknown codes and network errors", () => {
    expect(getUserErrorMessage(new ApiRequestError(500, "SOMETHING", "Internal error"))).toBe(USER_FALLBACK_ERROR_MESSAGE);
    expect(getUserErrorMessage(new TypeError("Failed to fetch"))).toBe(USER_FALLBACK_ERROR_MESSAGE);
  });
});
