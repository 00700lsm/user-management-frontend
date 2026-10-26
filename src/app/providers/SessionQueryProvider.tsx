import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "./AuthProvider";

/**
 * One server-state cache per Auth session. Login, logout, 401 and expiry change the access token,
 * and the children get a brand-new empty cache in that same render, so data cached for user A is
 * never read in user B's session. The token is only a change signal; it is never a query key.
 */
export function SessionQueryProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth();
  const [session, setSession] = useState(() => ({ accessToken, client: new QueryClient() }));
  if (session.accessToken !== accessToken) setSession({ accessToken, client: new QueryClient() });

  // Drop the previous session's cache and abort its in-flight requests.
  const previous = useRef<QueryClient>(null);
  useEffect(() => {
    const old = previous.current;
    previous.current = session.client;
    if (old && old !== session.client) { void old.cancelQueries(); old.clear(); }
  }, [session.client]);

  return <QueryClientProvider client={session.client}>{children}</QueryClientProvider>;
}
