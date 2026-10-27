import type { components } from "../../../shared/api/generated/schema";
import { apiRequest, ApiRequestError } from "../../../shared/api/client";

export type Role = components["schemas"]["Role"];
export type RoleCode = Role["code"];
export type UserRoles = components["schemas"]["UserRoles"];
export type UpdateRolesRequest = components["schemas"]["UpdateRolesRequest"];

const MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "로그인이 만료되었습니다. 다시 로그인해 주세요.",
  // Shell already shows the re-login banner for 403. Keep this sentence different.
  FORBIDDEN: "이 화면을 볼 권한이 없습니다.",
  NOT_FOUND: "사용자를 찾을 수 없습니다.",
  VALIDATION_FAILED: "역할을 하나 이상, 중복 없이 선택해 주세요.",
};
export const PERMISSION_FALLBACK_ERROR_MESSAGE = "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";

/** Maps ApiError.code to a Korean message. Never surfaces raw server or browser text. */
export function getPermissionErrorMessage(error: unknown): string {
  return error instanceof ApiRequestError ? MESSAGES[error.code] ?? PERMISSION_FALLBACK_ERROR_MESSAGE : PERMISSION_FALLBACK_ERROR_MESSAGE;
}

/** GET /admin/roles (listRoles, REQ-PERM-001). */
export const listRoles = (signal?: AbortSignal) => apiRequest<Role[]>("/admin/roles", { signal });

/** GET /admin/users/{id}/roles (getUserRoles, REQ-PERM-002). */
export const getUserRoles = (userId: number, signal?: AbortSignal) =>
  apiRequest<UserRoles>(`/admin/users/${userId}/roles`, { signal });

/** PUT /admin/users/{id}/roles (replaceUserRoles, REQ-PERM-002). Replaces the whole role set. */
export const replaceUserRoles = (userId: number, body: UpdateRolesRequest) =>
  apiRequest<UserRoles>(`/admin/users/${userId}/roles`, { method: "PUT", body: JSON.stringify(body) });
