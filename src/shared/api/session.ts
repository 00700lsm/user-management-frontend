// Single storage key shared by the Auth provider and HTTP boundary.
export const ACCESS_TOKEN_KEY = "um_access_token";
export const getAccessToken = () => sessionStorage.getItem(ACCESS_TOKEN_KEY);
export function clearAuthSession() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.dispatchEvent(new Event("um:unauthorized"));
}
