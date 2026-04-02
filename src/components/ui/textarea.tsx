"use client";

import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "focus-ring min-h-[120px] w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400",
        className,
      )}
      {...props}
    />
  );
}

