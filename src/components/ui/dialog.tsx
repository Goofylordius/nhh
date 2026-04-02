"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  size = "default",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "default" | "wide";
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-3 sm:items-center sm:p-6"
      role="dialog"
    >
      <div
        className={cn(
          "max-h-[92vh] w-full overflow-hidden rounded-[28px] bg-white shadow-card",
          size === "wide" ? "max-w-6xl" : "max-w-3xl",
        )}
      >
        <div className="flex items-start justify-between border-b border-ink-100 px-5 py-4">
          <div>
            <h2 className="font-display text-2xl text-ink-900">{title}</h2>
            {description ? <p className="mt-1 text-sm text-ink-700">{description}</p> : null}
          </div>
          <Button aria-label="Dialog schliessen" onClick={onClose} variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-[calc(92vh-88px)] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

