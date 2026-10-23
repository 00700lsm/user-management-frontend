// Dev/test-only fixtures (never imported by production code paths).
// Tokens are NOT signed JWTs. MOCK_PASSWORD is a throwaway value for MSW only.
export type MockRole = "USER" | "ADMIN";
export const MOCK_PASSWORD = "mock-password-12";

export function makeToken(sub: string, roles: MockRole[], ttlSeconds: number) {
  const payload = { sub, roles, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const encoded = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  return ["dev-only", encoded, "unsigned"].join(".");
}
export const makeMockToken = (role: MockRole) => makeToken(role === "ADMIN" ? "1002" : "1001", [role], 900);

// FIX-USER / FIX-ADMIN / FIX-EXPIRED / FIX-INACTIVE / FIX-WITHDRAWN (contract docs/aa/mock-fixtures.md).
// "short-lived" is an extra ACTIVE user whose token expires in 3s (expiry-timer UX test).
export const LOGIN_FIXTURES: Record<string, { sub: string; roles: MockRole[]; ttl: number; active: boolean }> = {
  "dev-user": { sub: "1001", roles: ["USER"], ttl: 900, active: true },
  "dev-admin": { sub: "1002", roles: ["ADMIN"], ttl: 900, active: true },
  "expired-user": { sub: "1003", roles: ["USER"], ttl: -60, active: true },
  "short-lived": { sub: "1004", roles: ["USER"], ttl: 3, active: true },
  "forbidden-user": { sub: "1007", roles: ["USER"], ttl: 900, active: true }, // /users/me -> 403
  "revoked-user": { sub: "1008", roles: ["USER"], ttl: 900, active: true }, // /users/me -> 401 (token revoked)
  "inactive-user": { sub: "1005", roles: ["USER"], ttl: 900, active: false },
  "withdrawn-user": { sub: "1006", roles: ["USER"], ttl: 900, active: false },
};
