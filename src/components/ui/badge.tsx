import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneClasses = {
    default: "bg-ink-100 text-ink-800",
    success: "bg-mint-100 text-mint-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-clay-100 text-clay-800",
  };

  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", toneClasses[tone])}>
      {children}
    </span>
  );
}

