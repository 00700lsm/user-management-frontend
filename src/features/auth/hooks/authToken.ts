export type Role = "USER" | "ADMIN";
interface Claims { sub?: string; roles?: unknown; exp?: number }

// Display-only decoding: the signature is verified by the Backend, never here.
export function decodeClaims(token: string): Claims | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    return JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/"))) as Claims;
  } catch { return null; }
}
export function isValidToken(token: string | null, now = Date.now()): boolean {
  const claims = token ? decodeClaims(token) : null;
  return !!claims?.sub && (!claims.exp || claims.exp * 1000 > now);
}
export function rolesFrom(token: string | null): Role[] {
  const claims = token && isValidToken(token) ? decodeClaims(token) : null;
  return Array.isArray(claims?.roles) ? claims.roles.filter((x): x is Role => x === "USER" || x === "ADMIN") : [];
}

const MAX_TIMEOUT_MS = 2 ** 31 - 1;
/** Calls onExpire at the JWT `exp` time; returns a cancel function. No `exp` => nothing scheduled. */
export function scheduleExpiry(token: string, onExpire: () => void): () => void {
  const exp = decodeClaims(token)?.exp;
  if (!exp) return () => {};
  const ms = Math.max(exp * 1000 - Date.now(), 0);
  if (ms > MAX_TIMEOUT_MS) return () => {}; // ponytail: setTimeout overflow ceiling (~24d); tokens are 15 min
  const id = setTimeout(onExpire, ms);
  return () => clearTimeout(id);
}
