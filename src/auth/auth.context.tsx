import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearSessionHint, readSessionHint } from "./auth.storage";
import { getAuthConfig } from "./auth.config";
import { checkBackendSession } from "./auth.service";
import type { AuthSession, AuthStatus } from "./auth.types";

type AuthContextValue = {
  config: ReturnType<typeof getAuthConfig>;
  error: string | null;
  session: AuthSession | null;
  status: AuthStatus;
  markAuthenticated: (session: AuthSession) => void;
  markUnauthenticated: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const config = useMemo(() => getAuthConfig(), []);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        if (!config.authEnabled) {
          if (isMounted) {
            setSession({ authenticated: true });
            setStatus("authenticated");
          }
          return;
        }

        const backendSession = await checkBackendSession();
        const sessionHint = readSessionHint();
        const resolvedSession =
          backendSession || (sessionHint?.authenticated ? sessionHint : null);

        if (!isMounted) return;
        setSession(resolvedSession);
        setStatus(
          resolvedSession?.authenticated ? "authenticated" : "unauthenticated",
        );
      } catch (caughtError) {
        if (!isMounted) return;
        setSession(null);
        setStatus("unauthenticated");
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Could not verify authentication.",
        );
      }
    }

    function handleUnauthorized() {
      clearSessionHint();
      setSession(null);
      setStatus("unauthenticated");
    }

    void bootstrap();
    window.addEventListener("ecalendar:unauthorized", handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener("ecalendar:unauthorized", handleUnauthorized);
    };
  }, [config.authEnabled]);

  const value = useMemo<AuthContextValue>(
    () => ({
      config,
      error,
      session,
      status,
      markAuthenticated: (nextSession) => {
        setSession(nextSession);
        setError(null);
        setStatus("authenticated");
      },
      markUnauthenticated: () => {
        clearSessionHint();
        setSession(null);
        setStatus("unauthenticated");
      },
    }),
    [config, error, session, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
