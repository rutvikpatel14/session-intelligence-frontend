import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "admin" | "user";
  className?: string;
}

export function Badge({ children, variant = "neutral", className }: BadgeProps) {
  const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
    success: "bg-green-50 text-green-700 border-green-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    danger: "bg-red-50 text-red-700 border-red-100",
    info: "bg-blue-50 text-blue-700 border-blue-100",
    neutral: "bg-gray-50 text-gray-700 border-gray-100",
    admin: "bg-amber-500 text-white border-amber-500",
    user: "bg-blue-600 text-white border-blue-600",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

