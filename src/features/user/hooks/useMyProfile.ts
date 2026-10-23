import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "../api/userApi";

/** Single cache key for the signed-in user's profile; the profile update (PATCH) will invalidate it. */
export const MY_PROFILE_QUERY_KEY = ["users", "me"] as const;

export function useMyProfile() {
  return useQuery({ queryKey: MY_PROFILE_QUERY_KEY, queryFn: getMyProfile, retry: false });
}
