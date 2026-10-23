import { http, HttpResponse } from "msw";
import { LOGIN_FIXTURES, MOCK_PASSWORD, makeToken } from "./fixtures";

// These handlers are imported ONLY when import.meta.env.DEV and VITE_ENABLE_MOCKS=true.
// The fixtures use only fields present in the pinned OpenAPI schemas.
function roleOf(req: Request): "ADMIN" | "USER" | null {
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as { roles?: string[]; exp?: number };
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload.roles?.includes("ADMIN") ? "ADMIN" : payload.roles?.includes("USER") ? "USER" : null;
  } catch { return null; }
}
const subOf = (req: Request) => {
  try { return (JSON.parse(atob(req.headers.get("Authorization")!.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as { sub?: string }).sub; }
  catch { return undefined; }
};
const mkUser = (id: number, role: string) => ({
  id, loginId: role === "ADMIN" ? "dev-admin" : "dev-user",
  name: role === "ADMIN" ? "관리자 예시" : "사용자 예시",
  email: role === "ADMIN" ? "admin@example.test" : "user@example.test",
  status: "ACTIVE",
  createdAt: "2026-01-01T00:00:00Z",
});
const apiError = (status: number, code: string, message: string) => HttpResponse.json({ code, message }, { status });
const denied = (code: number) => code === 401
  ? apiError(401, "UNAUTHORIZED", "로그인이 필요합니다.") : apiError(403, "FORBIDDEN", "접근 권한이 없습니다.");
const utf8Bytes = (s: string) => new TextEncoder().encode(s).length;

export const handlers = [
  http.post("/api/auth/login", async ({ request }) => {
    const body = await request.json().catch(() => null) as { loginId?: string; password?: string } | null;
    const account = body?.loginId ? LOGIN_FIXTURES[body.loginId] : undefined;
    // Empty input, wrong password, INACTIVE and WITHDRAWN all share one 401 (no status leak).
    if (!account || !account.active || !body?.password || body.password !== MOCK_PASSWORD) {
      return apiError(401, "INVALID_CREDENTIALS", "아이디 또는 비밀번호가 올바르지 않습니다.");
    }
    return HttpResponse.json({ accessToken: makeToken(account.sub, account.roles, account.ttl), tokenType: "Bearer" });
  }),
  http.post("/api/auth/logout", ({ request }) =>
    roleOf(request) ? new HttpResponse(null, { status: 204 }) : denied(401)),
  http.post("/api/auth/password/change", async ({ request }) => {
    if (!roleOf(request)) return denied(401);
    const body = await request.json().catch(() => null) as { oldPassword?: string; newPassword?: string } | null;
    if (!body?.oldPassword || !body.newPassword) return apiError(400, "VALIDATION_FAILED", "요청 형식이 올바르지 않습니다.");
    if (body.oldPassword !== MOCK_PASSWORD) return apiError(400, "INVALID_OLD_PASSWORD", "기존 비밀번호가 일치하지 않습니다.");
    if (Array.from(body.newPassword).length < 12 || utf8Bytes(body.newPassword) > 72) {
      return apiError(400, "PASSWORD_POLICY_VIOLATION", "비밀번호 정책을 만족하지 않습니다.");
    }
    return new HttpResponse(null, { status: 204 });
  }),
  http.get("/api/users/me", ({ request }) => {
    const role = roleOf(request);
    if (!role || subOf(request) === "1008") return denied(401);
    if (subOf(request) === "1007") return denied(403);
    return HttpResponse.json(mkUser(role === "ADMIN" ? 1002 : 1001, role));
  }),
  http.get("/api/admin/users", ({ request }) => {
    const role = roleOf(request);
    if (!role) return denied(401);
    if (role !== "ADMIN") return denied(403);
    return HttpResponse.json({ items: [mkUser(1001, "USER"), mkUser(1002, "ADMIN")], page: 0, size: 20, total: 2 });
  }),
];
