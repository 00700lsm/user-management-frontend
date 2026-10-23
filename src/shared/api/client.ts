import type { components } from "./generated/schema";
export type ApiUser = components["schemas"]["User"];
export type ApiRole = components["schemas"]["Role"];
export type ApiError = components["schemas"]["ApiError"];
import { getAccessToken, clearAuthSession, FORBIDDEN_EVENT } from "./session";

/** Error thrown for every non-2xx response; `code` is ApiError.code (or "UNKNOWN"). */
export class ApiRequestError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) {
    super(message);
    this.name = "ApiRequestError";
  }
}

// Shared fetch boundary. The UI role is advisory: Backend authorization is authoritative.
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (response.status === 401) {
    clearAuthSession();
    throw new ApiRequestError(401, "UNAUTHORIZED", "로그인이 만료되었습니다. 다시 로그인해 주세요.");
  }
  if (response.status === 403) {
    window.dispatchEvent(new Event(FORBIDDEN_EVENT)); // Shell shows the re-login notice; no auto logout.
    throw new ApiRequestError(403, "FORBIDDEN", "접근 권한이 없습니다.");
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null) as Partial<ApiError> | null;
    throw new ApiRequestError(response.status, body?.code ?? "UNKNOWN", body?.message ?? `요청 실패 (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
