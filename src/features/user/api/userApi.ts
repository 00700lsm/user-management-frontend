import { apiRequest, ApiRequestError } from "../../../shared/api/client";
import type { ApiUser } from "../../../shared/api/client";

const MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "로그인이 만료되었습니다. 다시 로그인해 주세요.",
  // The Shell banner already offers re-login on 403; the page only says what happened (no duplicate text).
  FORBIDDEN: "이 정보를 볼 권한이 없습니다.",
};
export const USER_FALLBACK_ERROR_MESSAGE = "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";

/** Maps ApiError.code to a Korean message. Never surfaces raw (English) server or browser text. */
export function getUserErrorMessage(error: unknown): string {
  return error instanceof ApiRequestError ? MESSAGES[error.code] ?? USER_FALLBACK_ERROR_MESSAGE : USER_FALLBACK_ERROR_MESSAGE;
}

/** GET /users/me (getMyProfile, REQ-USER-002). The server decides whose profile from the token. */
export const getMyProfile = (signal?: AbortSignal) => apiRequest<ApiUser>("/users/me", { signal });
