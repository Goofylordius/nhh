import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <section className={cn("glass-panel", className)}>{children}</section>;
}

export function CardHeader({
  className,
  title,
  description,
  action,
}: {
  className?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-3 border-b border-ink-100 px-5 py-4 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div>
        <h2 className="font-display text-2xl text-ink-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-ink-700">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function CardContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

