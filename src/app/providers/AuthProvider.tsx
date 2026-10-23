import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useAuthSession } from "../../features/auth/hooks/useAuthSession";
import type { AuthContextType } from "../../features/auth/hooks/useAuthSession";

export { mockEnabled } from "../../shared/api/session";

// Assembly only: Auth logic lives in features/auth/{api,hooks}.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={useAuthSession()}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthProvider is required");
  return ctx;
}
