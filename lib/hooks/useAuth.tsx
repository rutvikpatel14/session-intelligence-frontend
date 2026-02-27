"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, authClient } from "@/lib/api";
import type { AuthUser } from "@/lib/auth";
import { clearAuthState, setAccessToken, setCsrfToken } from "@/lib/auth";
import { detectDeviceName } from "@/lib/utils";
import toast from "react-hot-toast";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  requiresVerification: boolean;
  suspiciousSessionId: string | null;
  login: (params: { email: string; password: string; deviceName?: string }) => Promise<void>;
  register: (params: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  markVerified: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [suspiciousSessionId, setSuspiciousSessionId] = useState<string | null>(null);
  const router = useRouter();

  function applyRefreshPayload(response: { data: unknown }) {
    const data = response.data as {
      user: AuthUser;
      accessToken: string;
      csrfToken: string;
      session?: { id: string; isSuspicious: boolean };
    };

    setUser(data.user);
    setAccessToken(data.accessToken);
    setCsrfToken(data.csrfToken);

    if (data.session?.isSuspicious) {
      setRequiresVerification(true);
      setSuspiciousSessionId(data.session.id);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setLoading(true);
      try {
        const response = await authClient.post("/auth/refresh", {});
        if (cancelled) return;
        applyRefreshPayload(response);
      } catch {
        if (!cancelled) {
          clearAuthState();
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (typeof window !== "undefined") {
      void bootstrap();
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  // Background session check so that admin-forced logouts
  // take effect without the user manually refreshing.
  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    const interval = window.setInterval(async () => {
      try {
        const response = await authClient.post("/auth/refresh", {});
        if (cancelled) return;
        applyRefreshPayload(response);
      } catch {
        if (cancelled) return;
        clearAuthState();
        setUser(null);
        setRequiresVerification(false);
        setSuspiciousSessionId(null);
        router.push("/login");
      }
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [user, router]);

  const login = async ({ email, password, deviceName }: { email: string; password: string; deviceName?: string }) => {
    try {
      let publicIp: string | undefined;
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        if (res.ok) {
          const data = (await res.json()) as { ip?: string };
          if (data.ip) {
            publicIp = data.ip;
          }
        }
      } catch {
        // ignore, will fall back to server-side IP detection on backend
      }

      const response = await authClient.post("/auth/login", {
        email,
        password,
        deviceName: deviceName ?? detectDeviceName(),
        ipAddress: publicIp,
      });

      const data = response.data as {
        user: AuthUser;
        accessToken: string;
        csrfToken: string;
        session: { id: string; isSuspicious: boolean };
        requiresVerification: boolean;
      };

      setUser(data.user);
      setAccessToken(data.accessToken);
      setCsrfToken(data.csrfToken);
      setRequiresVerification(data.requiresVerification);
      setSuspiciousSessionId(data.requiresVerification ? data.session.id : null);

      toast.success("Logged in successfully");
      router.push("/dashboard");
    } catch (error) {
      const { getApiErrorMessage } = await import("@/lib/utils");
      toast.error(getApiErrorMessage(error, "Unable to login"));
      throw error;
    }
  };

  const register = async ({ email, password }: { email: string; password: string }) => {
    try {
      await authClient.post("/auth/register", { email, password });
      toast.success("Account created. Please sign in.");
      router.push("/login");
    } catch (error) {
      const { getApiErrorMessage } = await import("@/lib/utils");
      toast.error(getApiErrorMessage(error, "Unable to register"));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout", {});
    } catch {
      // ignore
    } finally {
      clearAuthState();
      setUser(null);
      setRequiresVerification(false);
      setSuspiciousSessionId(null);
      router.push("/login");
    }
  };

  const markVerified = () => {
    setRequiresVerification(false);
    setSuspiciousSessionId(null);
  };

  const value: AuthContextValue = {
    user,
    loading,
    requiresVerification,
    suspiciousSessionId,
    login,
    register,
    logout,
    markVerified,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

