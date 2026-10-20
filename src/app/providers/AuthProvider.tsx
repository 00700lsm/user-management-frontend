import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

type Role = "USER" | "ADMIN";
interface Claims { sub: string; roles?: Role[]; exp?: number }
interface AuthContextType {
  isAuthenticated: boolean;
  roles: Role[];
  accessToken: string | null;
  login: (loginId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  mockLogin: (role: Role) => void;
  invalidate: () => void;
}
const TOKEN_KEY = "um_access_token";
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const mockEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === "true";

function decodeClaims(token: string): Claims | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized)) as Claims;
  } catch { return null; }
}
function rolesFrom(token: string | null): Role[] {
  const claims = token ? decodeClaims(token) : null;
  if (!claims || (claims.exp && claims.exp * 1000 < Date.now())) return [];
  return (claims.roles ?? []).filter((x): x is Role => x === "USER" || x === "ADMIN");
}
function validToken(token: string | null): boolean {
  if (!token) return false;
  const claims = decodeClaims(token);
  return !!claims && !!claims.sub && (!claims.exp || claims.exp * 1000 > Date.now());
}
function initialToken(): string | null {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (validToken(token)) return token;
  sessionStorage.removeItem(TOKEN_KEY);
  return null;
}
function makeMockToken(role: Role) {
  const payload = { sub: role === "ADMIN" ? "1002" : "1001", roles: [role], exp: Math.floor(Date.now() / 1000) + 900 };
  const encoded = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  return ["dev-only", encoded, "unsigned"].join(".");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setToken] = useState<string | null>(initialToken);
  const invalidate = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);
  const setSession = useCallback((token: string) => {
    if (!validToken(token)) throw new Error("Invalid accessToken");
    sessionStorage.setItem(TOKEN_KEY, token);
    setToken(token);
  }, []);
  const login = useCallback(async (loginId: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginId, password }),
    });
    if (!res.ok) throw new Error("로그인에 실패했습니다. 자격 증명을 확인해 주세요.");
    const result = await res.json() as { accessToken: string; tokenType: string };
    if (result.tokenType.toLowerCase() !== "bearer") throw new Error("Unsupported token type");
    setSession(result.accessToken);
  }, [setSession]);
  const logout = useCallback(async () => {
    try {
      if (accessToken && !mockEnabled) {
        await fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } });
      }
    } finally {
      invalidate();
    }
  }, [accessToken, invalidate]);
  const mockLogin = useCallback((role: Role) => {
    if (!mockEnabled) throw new Error("Mock authentication is disabled");
    setSession(makeMockToken(role)); // NOT a signed JWT; dev browser mock only.
  }, [setSession]);
  const value = useMemo<AuthContextType>(() => ({
    isAuthenticated: validToken(accessToken),
    roles: rolesFrom(accessToken), accessToken, login, logout, mockLogin, invalidate,
  }), [accessToken, login, logout, mockLogin, invalidate]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthProvider is required");
  return ctx;
}
