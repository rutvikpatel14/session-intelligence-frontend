"use client";

import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/lib/hooks/useAuth";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const { loading, requiresVerification, suspiciousSessionId, markVerified } = useAuth();
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();

  const handleVerify = async () => {
    if (!suspiciousSessionId) return;
    setVerifying(true);
    try {
      await api.post("/auth/verify-session", { sessionId: suspiciousSessionId });
      markVerified();
      toast.success("Session verified");
      router.refresh();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Verification failed"));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      <DashboardLayout>
        {loading ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-7 w-64" />
                <Skeleton className="h-4 w-80" />
              </div>
              <Skeleton className="h-7 w-28 rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-3 h-10 w-20" />
                <Skeleton className="mt-4 h-3 w-40" />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-3 h-10 w-16" />
                <Skeleton className="mt-4 h-3 w-44" />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-3 h-10 w-48" />
                <Skeleton className="mt-4 h-3 w-36" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="mt-2 h-4 w-64" />
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-56" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-44" />
                        <Skeleton className="h-3 w-52" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="mt-2 h-4 w-72" />
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-56" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-52" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </DashboardLayout>

      <Modal
        isOpen={requiresVerification}
        title="Suspicious session detected"
        description="We noticed a login from an unrecognized country or IP range. Please verify this session to continue."
        onClose={() => {}}
        footer={
          <>
            <Button variant="secondary" onClick={() => router.push("/sessions")}>
              View sessions
            </Button>
            <Button variant="primary" isLoading={verifying} onClick={handleVerify}>
              Verify this session
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
          <div className="text-amber-700 text-sm">
            Until verified, refresh tokens are blocked for this session.
          </div>
        </div>
      </Modal>
    </>
  );
}

