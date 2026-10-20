import { http, HttpResponse } from "msw";

// These handlers are imported ONLY when import.meta.env.DEV and VITE_ENABLE_MOCKS=true.
// The fixtures use only fields present in the pinned OpenAPI schemas.
function roleOf(req: Request): "ADMIN" | "USER" | null {
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as { roles?: string[] };
    return payload.roles?.includes("ADMIN") ? "ADMIN" : payload.roles?.includes("USER") ? "USER" : null;
  } catch { return null; }
}
const mkUser = (id: number, role: string) => ({
  id, loginId: role === "ADMIN" ? "dev-admin" : "dev-user",
  name: role === "ADMIN" ? "관리자 예시" : "사용자 예시",
  email: role === "ADMIN" ? "admin@example.test" : "user@example.test",
  status: "ACTIVE",
  createdAt: "2026-01-01T00:00:00Z",
});
const denied = (code: number) => HttpResponse.json({ code: code === 401 ? "UNAUTHORIZED" : "FORBIDDEN", message: code === 401 ? "로그인이 필요합니다." : "접근 권한이 없습니다." }, { status: code });
export const handlers = [
  http.get("/api/users/me", ({ request }) => {
    const role = roleOf(request);
    if (!role) return denied(401);
    return HttpResponse.json(mkUser(role === "ADMIN" ? 1002 : 1001, role));
  }),
  http.get("/api/admin/users", ({ request }) => {
    const role = roleOf(request);
    if (!role) return denied(401);
    if (role !== "ADMIN") return denied(403);
    return HttpResponse.json({ items: [mkUser(1001, "USER"), mkUser(1002, "ADMIN")], page: 0, size: 20, total: 2 });
  }),
];
