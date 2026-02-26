"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { SessionTable, type SessionRow } from "@/components/session/session-table";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/hooks/useAuth";
import { Modal } from "@/components/ui/modal";
import { ShieldAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);
  const [isLogoutAllModalOpen, setIsLogoutAllModalOpen] = useState(false);
  const { suspiciousSessionId, markVerified } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/sessions");
      const items = (res.data.sessions ?? []) as Array<SessionRow>;
      setSessions(
        items.map((s) => ({
          id: s.id,
          deviceName: s.deviceName,
          ipAddress: s.ipAddress,
          country: s.country,
          userAgent: s.userAgent,
          isSuspicious: s.isSuspicious,
          createdAt: s.createdAt,
          lastUsedAt: s.lastUsedAt,
        }))
      );
    } catch {
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleLogoutOne = async (id: string) => {
    try {
      await api.delete(`/sessions/${id}`);
      toast.success("Session logged out");
      if (suspiciousSessionId === id) {
        markVerified();
      }
      void load();
    } catch {
      toast.error("Failed to logout session");
    }
  };

  const handleLogoutAll = async () => {
    setLoadingAll(true);
    try {
      await api.delete("/sessions");
      toast.success("All sessions logged out");
      markVerified();
      void load();
    } catch {
      toast.error("Failed to logout all sessions");
    } finally {
      setLoadingAll(false);
      setIsLogoutAllModalOpen(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await api.post("/auth/verify-session", { sessionId: id });
      toast.success("Session verified");
      markVerified();
      void load();
    } catch {
      toast.error("Failed to verify session");
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Active Sessions</h1>
            <p className="text-gray-500">Manage and monitor all devices currently signed into your account.</p>
          </div>
          <Button variant="danger" onClick={() => setIsLogoutAllModalOpen(true)}>
            Logout All Devices
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-28" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-gray-500">
              No active sessions.
            </div>
          ) : (
            <SessionTable sessions={sessions} onLogoutOne={handleLogoutOne} showVerify onVerify={handleVerify} />
          )}
        </div>
      </div>

      <Modal
        isOpen={isLogoutAllModalOpen}
        onClose={() => setIsLogoutAllModalOpen(false)}
        title="Logout all devices?"
        description="This will immediately terminate all active sessions (including this one)."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsLogoutAllModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" isLoading={loadingAll} onClick={handleLogoutAll}>
              Logout All
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-100">
          <ShieldAlert className="text-red-500 shrink-0" size={24} />
          <p className="text-sm text-red-700">
            You will need to sign back in on all devices. This action cannot be undone.
          </p>
        </div>
      </Modal>
    </AppShell>
  );
}

