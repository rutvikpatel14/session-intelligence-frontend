"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, description, children, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md pointer-events-auto overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {description && <p className="text-sm text-gray-500">{description}</p>}
            </div>
            <Button variant="ghost" onClick={onClose} aria-label="Close">
              ✕
            </Button>
          </div>
          <div className="p-6">{children}</div>
          {footer && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

