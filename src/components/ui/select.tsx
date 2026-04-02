"use client";

import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "focus-ring w-full rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

