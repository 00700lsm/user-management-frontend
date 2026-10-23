// Single storage key shared by the Auth hook and HTTP boundary.
export const ACCESS_TOKEN_KEY = "um_access_token";
export const UNAUTHORIZED_EVENT = "um:unauthorized";
export const FORBIDDEN_EVENT = "um:forbidden";
// Dev/test-only MSW + unsigned-token flag. Never true in production builds.
export const mockEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === "true";
export const getAccessToken = () => sessionStorage.getItem(ACCESS_TOKEN_KEY);
export function clearAuthSession() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}
