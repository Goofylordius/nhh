import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="rounded-[28px] border border-dashed border-white/10 bg-[radial-gradient(circle_at_top,rgba(61,231,184,0.12),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-8 py-12 text-center">
        <h3 className="font-display text-3xl text-white">{title}</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-300">{description}</p>
        {actionLabel && onAction ? (
          <div className="mt-6">
            <Button onClick={onAction} variant="secondary">
              {actionLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
