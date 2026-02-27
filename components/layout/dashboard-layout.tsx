"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center p-4 bg-white border-b border-gray-200">
          <Button
            variant="ghost"
            onClick={() => setSidebarOpen(true)}
            className="p-1"
          >
            <Menu size={24} />
          </Button>
          <h1 className="ml-4 text-lg font-semibold">Dashboard</h1>
        </div>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}