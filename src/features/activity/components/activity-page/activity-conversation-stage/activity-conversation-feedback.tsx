import { ArrowLeft, RefreshCw } from "lucide-react";
import { ErrorNetworkRetryVisual } from "@/assets/error-state/error-network-retry";
import { Button } from "@/shared/components/ui/button";

type ActivityConversationFeedbackVariant = "error" | "missing" | "offline";

interface ActivityConversationFeedbackProps {
  actionLabel: string;
  description: string;
  isActionLoading?: boolean;
  title: string;
  variant: ActivityConversationFeedbackVariant;
  onAction: () => Promise<void> | void;
}

export function ActivityConversationFeedback({
  actionLabel,
  description,
  isActionLoading = false,
  title,
  variant,
  onAction,
}: ActivityConversationFeedbackProps) {
  const ActionIcon = variant === "missing" ? ArrowLeft : RefreshCw;

  return (
    <section
      className="flex min-h-0 flex-1 items-center justify-center bg-canvas/30 px-6 py-10 text-center"
      role="status"
    >
      <div className="flex w-full max-w-sm flex-col items-center">
        <ErrorNetworkRetryVisual className="h-36 w-auto text-foreground" />
        <h2 className="mt-4 font-bold text-ink text-lg leading-tight">
          {title}
        </h2>
        <p className="mt-2 text-slate-muted text-sm leading-relaxed">
          {description}
        </p>
        <Button
          className="mt-6 rounded-lg"
          loading={isActionLoading}
          size="sm"
          variant={variant === "missing" ? "outline" : "primary"}
          onClick={() => void onAction()}
        >
          <ActionIcon size={14} />
          {actionLabel}
        </Button>
      </div>
    </section>
  );
}
