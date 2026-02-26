"use client";

import { Sidebar } from "@/components/layout/sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

