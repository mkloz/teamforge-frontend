import { AlertTriangle } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface PageErrorStateProps {
  title: string;
  description: string;
  retryLabel?: string;
  className?: string;
  onRetry: () => void;
}

export function PageErrorState({
  title,
  description,
  retryLabel = "Try again",
  className,
  onRetry,
}: PageErrorStateProps) {
  return (
    <section
      aria-labelledby="page-error-heading"
      className={cn(
        "rounded-2xl border border-destructive/15 bg-destructive/5 p-6",
        className,
      )}
    >
      <div
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"
        aria-hidden="true"
      >
        <AlertTriangle size={20} />
      </div>

      <h1 id="page-error-heading" className="text-2xl font-bold text-ink">
        {title}
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-muted">
        {description}
      </p>

      <Button className="mt-5" variant="primary" onClick={onRetry}>
        {retryLabel}
      </Button>
    </section>
  );
}
