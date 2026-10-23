import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiRequestError } from "../../../shared/api/client";
import { ACCESS_TOKEN_KEY, UNAUTHORIZED_EVENT, clearAuthSession } from "../../../shared/api/session";
import * as authApi from "../api/authApi";
import { isValidToken, rolesFrom, scheduleExpiry } from "./authToken";
import type { Role } from "./authToken";

export type SessionEndReason = "expired" | "passwordChanged";

export interface AuthContextType {
  isAuthenticated: boolean;
  /** Why the session ended (drives the /login notice); undefined for a plain logout. */
  endReason: SessionEndReason | undefined;
  roles: Role[];
  accessToken: string | null;
  login: (loginId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  mockLogin: (role: Role) => Promise<void>;
  invalidate: (reason?: SessionEndReason) => void;
}

function initialToken(): string | null {
  const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (isValidToken(token)) return token;
  sessionStorage.removeItem(ACCESS_TOKEN_KEY); // expired/invalid tokens are discarded on load
  return null;
}

export function useAuthSession(): AuthContextType {
  const [accessToken, setToken] = useState<string | null>(initialToken);
  const [endReason, setEndReason] = useState<SessionEndReason>();
  const invalidate = useCallback((reason?: SessionEndReason) => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    setToken(null);
    setEndReason(reason);
  }, []);
  const setSession = useCallback((token: string) => {
    if (!isValidToken(token)) throw new ApiRequestError(401, "UNAUTHORIZED", "");
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    setToken(token);
    setEndReason(undefined);
  }, []);

  // 401 path (apiRequest, expiry timer): storage is already cleared; Protected redirects to /login with the expiry notice.
  useEffect(() => {
    const onUnauthorized = () => { setToken(null); setEndReason("expired"); };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);
  // Token expiry reuses the 401 path.
  useEffect(() => (accessToken ? scheduleExpiry(accessToken, clearAuthSession) : undefined), [accessToken]);

  const login = useCallback(async (loginId: string, password: string) => {
    setSession(await authApi.login({ loginId, password }));
  }, [setSession]);
  const logout = useCallback(async () => {
    try {
      if (accessToken) await authApi.logout();
    } catch {
      console.warn("logout request failed; session cleared locally");
    } finally {
      invalidate();
    }
  }, [accessToken, invalidate]);
  const mockLogin = useCallback(async (role: Role) => {
    // Inline guard so the dynamic import is dead-code-eliminated from production builds.
    if (!(import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === "true")) throw new Error("Mock authentication is disabled");
    const { makeMockToken } = await import("../../../shared/mocks/fixtures");
    setSession(makeMockToken(role)); // NOT a signed JWT; dev browser mock only.
  }, [setSession]);

  return useMemo<AuthContextType>(() => ({
    isAuthenticated: isValidToken(accessToken), endReason,
    roles: rolesFrom(accessToken), accessToken, login, logout, mockLogin, invalidate,
  }), [accessToken, endReason, login, logout, mockLogin, invalidate]);
}
