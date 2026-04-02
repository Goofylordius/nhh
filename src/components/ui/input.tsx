"use client";

import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "focus-ring w-full rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-400",
        className,
      )}
      {...props}
    />
  );
}
