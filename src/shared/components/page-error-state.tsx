import { AlertTriangle } from "lucide-react";

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
      iconClassName="h-11 w-11 bg-destructive/10 text-destructive"
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
