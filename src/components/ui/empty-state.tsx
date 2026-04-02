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
    <Card className="p-8 text-center">
      <h3 className="font-display text-3xl text-ink-900">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm text-ink-700">{description}</p>
      {actionLabel && onAction ? (
        <div className="mt-6">
          <Button onClick={onAction} variant="secondary">
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

