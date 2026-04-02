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
        "focus-ring w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition placeholder:text-slate-500 hover:border-white/15 focus:border-mint-400/50 focus:bg-white/8",
        className,
      )}
      {...props}
    />
  );
}
