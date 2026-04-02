"use client";

import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClassName: Record<Variant, string> = {
  primary:
    "bg-slate-100 text-slate-950 hover:bg-white focus-visible:ring-slate-200 disabled:bg-slate-500 disabled:text-slate-300",
  secondary:
    "bg-mint-500 text-slate-950 hover:bg-mint-400 focus-visible:ring-mint-400 disabled:bg-mint-900 disabled:text-mint-200",
  ghost:
    "bg-transparent text-slate-200 hover:bg-white/10 focus-visible:ring-slate-400 disabled:text-slate-500",
  danger:
    "bg-clay-500 text-white hover:bg-clay-400 focus-visible:ring-clay-400 disabled:bg-clay-900 disabled:text-clay-200",
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition",
        variantClassName[variant],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
