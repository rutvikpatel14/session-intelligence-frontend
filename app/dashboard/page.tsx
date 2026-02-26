"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Clock, ArrowUpRight, Smartphone, Monitor, Globe } from "lucide-react";
import { formatDateDDMMYYYY } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalSessions: number;
  suspiciousSessions: number;
  lastLoginAt: string | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sessions, setSessions] = useState<
    Array<{
      deviceName: string;
      ipAddress: string;
      isSuspicious: boolean;
      createdAt: string;
      lastUsedAt: string;
      country: string;
      userAgent: string;
    }>
  >([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api.get("/sessions");
        if (cancelled) return;
        const list = (res.data.sessions ?? []) as Array<{
          deviceName: string;
          ipAddress: string;
          isSuspicious: boolean;
          createdAt: string;
          lastUsedAt: string;
          country: string;
          userAgent: string;
        }>;
        setSessions(list);
        const sorted = [...list].sort(
          (a, b) => new Date(b.lastUsedAt || b.createdAt).getTime() - new Date(a.lastUsedAt || a.createdAt).getTime()
        );
        const lastLoginAt = sorted[0]?.createdAt ?? null;
        setStats({
          totalSessions: list.length,
          suspiciousSessions: list.filter((s) => s.isSuspicious).length,
          lastLoginAt,
        });
      } catch {
        if (!cancelled) {
          setStats({ totalSessions: 0, suspiciousSessions: 0, lastLoginAt: null });
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const computed = stats ?? { totalSessions: 0, suspiciousSessions: 0, lastLoginAt: null };
  const isStatsLoading = stats === null;

  const recentActivity = [...sessions]
    .sort((a, b) => new Date(b.lastUsedAt || b.createdAt).getTime() - new Date(a.lastUsedAt || a.createdAt).getTime())
    .slice(0, 3)
    .map((s) => {
      if (s.isSuspicious) {
        return {
          event: "Suspicious session detected",
          device: s.deviceName,
          ip: s.ipAddress,
          time: formatDateDDMMYYYY(s.lastUsedAt || s.createdAt),
          status: "warning" as const,
        };
      }
      return {
        event: "Session active",
        device: s.deviceName,
        ip: s.ipAddress,
        time: formatDateDDMMYYYY(s.lastUsedAt || s.createdAt),
        status: "success" as const,
      };
    });

  const deviceCounts = sessions.reduce(
    (acc, s) => {
      const needle = `${s.deviceName} ${s.userAgent}`.toLowerCase();
      if (needle.includes("iphone") || needle.includes("android") || needle.includes("ios") || needle.includes("ipad")) {
        acc.mobile += 1;
      } else if (needle.includes("postman") || needle.includes("curl") || needle.includes("api")) {
        acc.other += 1;
      } else {
        acc.desktop += 1;
      }
      return acc;
    },
    { desktop: 0, mobile: 0, other: 0 }
  );

  const total = Math.max(1, deviceCounts.desktop + deviceCounts.mobile + deviceCounts.other);
  const deviceDistribution = [
    { label: "Desktop (macOS/Windows)", value: Math.round((deviceCounts.desktop / total) * 100), icon: Monitor },
    { label: "Mobile (iOS/Android)", value: Math.round((deviceCounts.mobile / total) * 100), icon: Smartphone },
    { label: "Other/API", value: Math.round((deviceCounts.other / total) * 100), icon: Globe },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back{user?.email ? `, ${user.email}` : ""}
            </h1>
            <p className="text-gray-500">Here is a summary of your system security status.</p>
          </div>
          <div className="flex gap-3">
            <Badge variant={computed.suspiciousSessions === 0 ? "success" : "warning"} className="px-3 py-1">
              {computed.suspiciousSessions === 0 ? "System Healthy" : "Attention Needed"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:border-blue-200 transition-colors cursor-default">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Sessions</p>
                {isStatsLoading ? (
                  <div className="mt-2">
                    <Skeleton className="h-10 w-20" />
                  </div>
                ) : (
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">{computed.totalSessions}</h3>
                )}
              </div>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Monitor size={20} />
              </div>
            </div>
          </Card>

          <Card className="hover:border-blue-200 transition-colors cursor-default">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Suspicious Sessions</p>
                {isStatsLoading ? (
                  <div className="mt-2">
                    <Skeleton className="h-10 w-16" />
                  </div>
                ) : (
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">{computed.suspiciousSessions}</h3>
                )}
              </div>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <AlertTriangle size={20} />
              </div>
            </div>
          </Card>

          <Card className="hover:border-blue-200 transition-colors cursor-default">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Last Login</p>
                {isStatsLoading ? (
                  <div className="mt-2">
                    <Skeleton className="h-10 w-48" />
                  </div>
                ) : (
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">
                    {computed.lastLoginAt ? formatDateDDMMYYYY(computed.lastLoginAt) : "—"}
                  </h3>
                )}
              </div>
              <div className="p-2 rounded-lg bg-green-50 text-green-600">
                <Clock size={20} />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Security Overview" description="Recent authentication events across your account.">
            <div className="space-y-6 mt-4">
              {recentActivity.length === 0 ? (
                <div className="text-sm text-gray-500">No recent activity.</div>
              ) : (
                recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.status === "success"
                            ? "bg-green-50 text-green-600"
                            : activity.status === "warning"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {activity.status === "success" ? (
                          <Shield size={18} />
                        ) : activity.status === "warning" ? (
                          <AlertTriangle size={18} />
                        ) : (
                          <Clock size={18} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{activity.event}</p>
                        <p className="text-xs text-gray-500">{activity.device}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-900">{activity.time}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{activity.ip}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card title="Device Distribution" description="Active sessions categorized by device type.">
            <div className="space-y-4 mt-4">
              {deviceDistribution.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <item.icon size={16} className="text-gray-400" />
                      <span>{item.label}</span>
                    </div>
                    <span className="font-semibold">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

