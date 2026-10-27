import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserRoles, listRoles, replaceUserRoles } from "../api/permissionApi";
import type { UpdateRolesRequest } from "../api/permissionApi";

export const ROLES_QUERY_KEY = ["admin", "roles"] as const;
export const userRolesQueryKey = (userId: number) => ["admin", "users", userId, "roles"] as const;

export function useRoles() {
  return useQuery({ queryKey: ROLES_QUERY_KEY, queryFn: ({ signal }) => listRoles(signal), retry: false });
}

export function useUserRoles(userId: number, enabled: boolean) {
  return useQuery({
    queryKey: userRolesQueryKey(userId),
    queryFn: ({ signal }) => getUserRoles(userId, signal),
    enabled,
    retry: false,
  });
}

/** PUT the user's roles, then keep the returned set as the cached assignment. */
export function useReplaceUserRoles(userId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateRolesRequest) => replaceUserRoles(userId, body),
    onSuccess: (saved) => { queryClient.setQueryData(userRolesQueryKey(userId), saved); },
  });
}
