import type { components } from "../../../shared/api/generated/schema";
import { apiRequest, ApiRequestError } from "../../../shared/api/client";
import type { ApiError } from "../../../shared/api/client";

type LoginRequest = components["schemas"]["LoginRequest"];
type TokenResponse = components["schemas"]["TokenResponse"];
type ChangePasswordRequest = components["schemas"]["ChangePasswordRequest"];

const MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "로그인이 만료되었습니다. 다시 로그인해 주세요.",
  FORBIDDEN: "접근 권한이 없습니다. 권한이 변경되었다면 다시 로그인해 주세요.",
  INVALID_CREDENTIALS: "아이디 또는 비밀번호가 올바르지 않습니다.",
  INVALID_OLD_PASSWORD: "이전 비밀번호가 올바르지 않습니다.",
  PASSWORD_POLICY_VIOLATION: "새 비밀번호는 12자 이상, 72바이트 이하로 입력해 주세요.",
  VALIDATION_FAILED: "입력 형식이 올바르지 않습니다. 입력값을 확인해 주세요.",
};
export const FALLBACK_ERROR_MESSAGE = "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";

/** Maps ApiError.code to a Korean message. Never surfaces raw (English) exception text. */
export function getAuthErrorMessage(error: unknown): string {
  return error instanceof ApiRequestError ? MESSAGES[error.code] ?? FALLBACK_ERROR_MESSAGE : FALLBACK_ERROR_MESSAGE;
}

/** POST /auth/login -> accessToken. Plain fetch: a 401 here is a credential failure, not a session expiry. */
export async function login(body: LoginRequest): Promise<string> {
  const res = await fetch("/api/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null) as Partial<ApiError> | null;
    throw new ApiRequestError(res.status, err?.code ?? (res.status === 401 ? "INVALID_CREDENTIALS" : "UNKNOWN"), err?.message ?? "");
  }
  const result = await res.json().catch(() => null) as Partial<TokenResponse> | null;
  // tokenType is "Bearer" per OpenAPI; absent is tolerated, any other scheme is rejected.
  const type = result?.tokenType;
  if (typeof result?.accessToken !== "string" || (type != null && String(type).toLowerCase() !== "bearer")) {
    throw new ApiRequestError(res.status, "INVALID_RESPONSE", "");
  }
  return result.accessToken;
}

export const logout = () => apiRequest<void>("/auth/logout", { method: "POST" });

export const changePassword = (body: ChangePasswordRequest) =>
  apiRequest<void>("/auth/password/change", { method: "POST", body: JSON.stringify(body) });
