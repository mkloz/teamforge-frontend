import { AlertTriangle } from "lucide-react";

import { ErrorPageDataLoadVisual } from "@/assets/error-state/error-page-data-load";
import { FeedbackState } from "@/shared/components/feedback-state";
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
    <FeedbackState
      headingId="page-error-heading"
      icon={<AlertTriangle size={20} />}
      iconClassName="bg-destructive/10 text-destructive size-11"
      visual={<ErrorPageDataLoadVisual className="w-36 text-foreground" />}
      className={cn(
        "max-w-none border-destructive/15 bg-destructive/5 shadow-none",
        className,
      )}
      containerClassName="block min-h-0 p-0"
      descriptionClassName="max-w-xl"
      title={title}
      description={description}
      actions={
        <Button variant="primary" onClick={onRetry}>
          {retryLabel}
        </Button>
      }
    />
  );
}
