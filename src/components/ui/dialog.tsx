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
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/78 p-3 backdrop-blur-md sm:items-center sm:p-6"
      role="dialog"
    >
      <div
        className={cn(
          "max-h-[92vh] w-full overflow-hidden rounded-[32px] border border-white/10 bg-[#0b1220]/96 shadow-[0_28px_120px_-34px_rgba(0,0,0,0.75)]",
          size === "wide" ? "max-w-6xl" : "max-w-3xl",
        )}
      >
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
          <div className="min-w-0">
            <h2 className="font-display text-2xl text-white">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-300">{description}</p> : null}
          </div>
          <Button aria-label="Dialog schliessen" onClick={onClose} variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-[calc(92vh-92px)] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
