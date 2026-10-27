import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError } from "../../../shared/api/client";
import { PERMISSION_FALLBACK_ERROR_MESSAGE, getPermissionErrorMessage, getUserRoles, listRoles, replaceUserRoles } from "./permissionApi";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const stubFetch = (res: Response) => { const f = vi.fn().mockResolvedValue(res); vi.stubGlobal("fetch", f); return f; };
const ROLES = [{ code: "ADMIN", name: "Administrator" }, { code: "USER", name: "General user" }];

afterEach(() => { vi.unstubAllGlobals(); sessionStorage.clear(); });

describe("permission API", () => {
  it("GETs /api/admin/roles with the Bearer token", async () => {
    sessionStorage.setItem("um_access_token", "tok");
    const f = stubFetch(json(ROLES));
    await expect(listRoles()).resolves.toEqual(ROLES);
    expect(f.mock.calls[0][0]).toBe("/api/admin/roles");
    expect((f.mock.calls[0][1].headers as Record<string, string>).Authorization).toBe("Bearer tok");
  });

  it("PUTs the replacement role set and keeps NOT_FOUND", async () => {
    sessionStorage.setItem("um_access_token", "tok");
    const saved = { userId: 1001, roleCodes: ["USER", "ADMIN"] };
    const f = stubFetch(json(saved));
    await expect(replaceUserRoles(1001, { roleCodes: ["USER", "ADMIN"] })).resolves.toEqual(saved);
    expect(f.mock.calls[0][0]).toBe("/api/admin/users/1001/roles");
    expect(f.mock.calls[0][1].method).toBe("PUT");
    expect(JSON.parse(f.mock.calls[0][1].body)).toEqual({ roleCodes: ["USER", "ADMIN"] });

    stubFetch(json({ code: "NOT_FOUND", message: "missing" }, 404));
    await expect(getUserRoles(999)).rejects.toMatchObject({ status: 404, code: "NOT_FOUND" });
  });
});

describe("getPermissionErrorMessage", () => {
  it("maps known codes to Korean and hides the raw server text", () => {
    expect(getPermissionErrorMessage(new ApiRequestError(403, "FORBIDDEN", "Access denied")))
      .toBe("이 화면을 볼 권한이 없습니다.");
    expect(getPermissionErrorMessage(new ApiRequestError(404, "NOT_FOUND", "missing")))
      .toBe("사용자를 찾을 수 없습니다.");
    expect(getPermissionErrorMessage(new ApiRequestError(500, "OTHER", "boom"))).toBe(PERMISSION_FALLBACK_ERROR_MESSAGE);
    expect(getPermissionErrorMessage(new TypeError("Failed to fetch"))).toBe(PERMISSION_FALLBACK_ERROR_MESSAGE);
  });
});
