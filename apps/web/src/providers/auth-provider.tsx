"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { clearStoredSession, readStoredSession, writeStoredSession } from "@/lib/auth-storage";
import { api, createAuthHeaders, getApiErrorMessage, type ApiResponse } from "@/lib/api";
import type { AuthSession, AuthUser } from "@/types/app";

type AuthContextValue = {
  session: AuthSession | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: { email: string; password: string }) => Promise<AuthSession>;
  register: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<AuthSession>;
  logout: () => void;
  refreshProfile: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function persistSession(session: AuthSession | null) {
  if (session) {
    writeStoredSession(session);
    return;
  }

  clearStoredSession();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    queueMicrotask(() => {
      if (!isMounted) {
        return;
      }

      const storedSession = readStoredSession();

      if (!storedSession) {
        setIsLoading(false);
        return;
      }

      setSession(storedSession);

      void api
        .get<ApiResponse<AuthUser>>("/auth/me", {
          headers: createAuthHeaders(storedSession.token),
        })
        .then((response) => {
          if (!isMounted) {
            return;
          }

          const nextSession = {
            token: storedSession.token,
            user: response.data.data,
          } satisfies AuthSession;

          setSession(nextSession);
          persistSession(nextSession);
        })
        .catch(() => {
          if (!isMounted) {
            return;
          }

          setSession(null);
          persistSession(null);
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  async function login(input: { email: string; password: string }) {
    const response = await api.post<ApiResponse<AuthSession>>("/auth/login", input);
    const nextSession = response.data.data;

    setSession(nextSession);
    persistSession(nextSession);

    return nextSession;
  }

  async function register(input: {
    name: string;
    email: string;
    password: string;
  }) {
    const response = await api.post<ApiResponse<AuthSession>>(
      "/auth/register",
      input,
    );
    const nextSession = response.data.data;

    setSession(nextSession);
    persistSession(nextSession);

    return nextSession;
  }

  function logout() {
    setSession(null);
    persistSession(null);
  }

  async function refreshProfile() {
    if (!session?.token) {
      return null;
    }

    try {
      const response = await api.get<ApiResponse<AuthUser>>("/auth/me", {
        headers: createAuthHeaders(session.token),
      });
      const nextSession = {
        token: session.token,
        user: response.data.data,
      } satisfies AuthSession;

      setSession(nextSession);
      persistSession(nextSession);

      return nextSession.user;
    } catch (error) {
      setSession(null);
      persistSession(null);
      throw new Error(
        getApiErrorMessage(error, "Unable to refresh the current session."),
      );
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isAuthenticated: Boolean(session),
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
