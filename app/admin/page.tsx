"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Table, TableRow, TableCell } from "@/components/ui/table";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/hooks/useAuth";
import { Search, ShieldAlert, ShieldCheck, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateDDMMYYYY } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminSessionRow {
  id: string;
  deviceName: string;
  ipAddress: string;
  country: string;
  userAgent: string;
  isSuspicious: boolean;
  createdAt: string;
  lastUsedAt: string;
  user: {
    id: string;
    email: string;
    role: "admin" | "user";
  };
}

export default function AdminPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<AdminSessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [forcing, setForcing] = useState(false);
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    void reload();
  }, [user?.role]);

  async function reload() {
    if (user?.role !== "admin") {
      setLoading(false);
      return;
    }
    setLoading(true);
    setReloading(true);
    try {
      const res = await api.get("/admin/sessions");
      setSessions(res.data.sessions ?? []);
    } catch {
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
      setReloading(false);
    }
  }

  const handleForceLogout = async (id: string) => {
    try {
      await api.delete(`/admin/sessions/${id}`);
      toast.success("Session terminated");
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch {
      toast.error("Failed to terminate session");
    }
  };

  const filtered = sessions.filter((s) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return (
      s.user.email.toLowerCase().includes(needle) ||
      s.user.role.toLowerCase().includes(needle) ||
      s.deviceName.toLowerCase().includes(needle) ||
      s.ipAddress.toLowerCase().includes(needle) ||
      s.country.toLowerCase().includes(needle)
    );
  });

  const handleForceLogoutFiltered = async () => {
    if (filtered.length === 0) return;
    setForcing(true);
    try {
      await Promise.all(filtered.map((s) => api.delete(`/admin/sessions/${s.id}`)));
      toast.success("Forced logout executed");
      setSessions((prev) => prev.filter((s) => !filtered.some((f) => f.id === s.id)));
    } catch {
      toast.error("Failed to force logout sessions");
    } finally {
      setForcing(false);
    }
  };

  if (user?.role !== "admin") {
    return (
      <AppShell>
        <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
          You do not have permission to access the admin dashboard.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-500">Monitor and manage user sessions across the entire organization.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <Button variant="secondary" size="sm" isLoading={reloading} onClick={reload}>
              Refresh
            </Button>
            <Button variant="danger" className="gap-2" isLoading={forcing} onClick={handleForceLogoutFiltered}>
              <UserX size={16} />
              Force Logout
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-56" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-28" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-52" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-60" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-gray-500">No sessions found.</div>
          ) : (
            <>
              <Table headers={["User Email", "Role", "Device", "IP Address", "Country", "Created", "Last Used", "Risk Status", ""]}>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-xs">
                          {s.user.email.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{s.user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.user.role === "admin" ? "admin" : "user"}>
                        {s.user.role === "admin" ? "Admin" : "User"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">{s.deviceName}</TableCell>
                    <TableCell className="font-mono text-xs">{s.ipAddress}</TableCell>
                    <TableCell>{s.country}</TableCell>
                    <TableCell className="text-gray-500">{formatDateDDMMYYYY(s.createdAt)}</TableCell>
                    <TableCell className="text-gray-500">{formatDateDDMMYYYY(s.lastUsedAt || s.createdAt)}</TableCell>
                    <TableCell>
                      {s.isSuspicious ? (
                        <div className="flex items-center gap-1.5 text-amber-600 font-medium">
                          <ShieldAlert size={14} />
                          <span>Suspicious</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-green-600 font-medium">
                          <ShieldCheck size={14} />
                          <span>Secure</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleForceLogout(s.id)}>
                        Force logout
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <p className="text-sm text-gray-500">Showing {filtered.length} sessions</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled>
                    Previous
                  </Button>
                  <Button size="sm" variant="outline" disabled>
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

