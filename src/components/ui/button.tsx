"use client";

import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClassName: Record<Variant, string> = {
  primary:
    "bg-ink-900 text-white hover:bg-ink-800 focus-visible:ring-ink-900 disabled:bg-ink-300",
  secondary:
    "bg-mint-500 text-white hover:bg-mint-600 focus-visible:ring-mint-500 disabled:bg-mint-200",
  ghost:
    "bg-transparent text-ink-800 hover:bg-ink-100 focus-visible:ring-ink-400 disabled:text-ink-300",
  danger:
    "bg-clay-600 text-white hover:bg-clay-700 focus-visible:ring-clay-500 disabled:bg-clay-300",
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

