import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneClasses = {
    default: "bg-white/10 text-slate-200 ring-1 ring-white/10",
    success: "bg-mint-500/16 text-mint-200 ring-1 ring-mint-400/20",
    warning: "bg-amber-400/14 text-amber-200 ring-1 ring-amber-300/20",
    danger: "bg-clay-500/14 text-clay-200 ring-1 ring-clay-300/20",
  };

  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", toneClasses[tone])}>
      {children}
    </span>
  );
}
