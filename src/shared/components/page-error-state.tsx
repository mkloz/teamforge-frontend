import { AlertTriangle, RefreshCw } from "lucide-react";

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
      visual={
        <ErrorPageDataLoadVisual className="h-32 w-auto text-foreground" />
      }
      className={cn(className, "max-w-md")}
      title={title}
      description={description}
      actions={
        <Button className="min-w-36" variant="primary" onClick={onRetry}>
          <RefreshCw size={16} />
          {retryLabel}
        </Button>
      }
    />
  );
}
