"use client";

import * as React from "react";
import { Bell, Search, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/hooks/useAuth";

interface TopNavbarProps {
  onMenuClick?: () => void;
}

export function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search security logs..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-gray-400 hover:text-gray-600 relative" aria-label="Notifications">
          <Bell size={20} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <div className="h-8 w-px bg-gray-200" />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.email ?? "—"}</p>
            <Badge variant={user?.role === "admin" ? "admin" : "user"} className="mt-0.5">
              {user?.role === "admin" ? "Admin" : "User"}
            </Badge>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
            {(user?.email ?? "U").substring(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}

