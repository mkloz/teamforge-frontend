import { AlertTriangle, ArrowLeft, RefreshCw, WifiOff } from "lucide-react";
import { ErrorNetworkRetryVisual } from "@/assets/error-state/error-network-retry";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

type ActivityConversationFeedbackVariant = "error" | "missing" | "offline";

interface ActivityConversationFeedbackProps {
  actionLabel: string;
  description: string;
  isActionLoading?: boolean;
  title: string;
  variant: ActivityConversationFeedbackVariant;
  onAction: () => Promise<void> | void;
}

function getFeedbackIcon(variant: ActivityConversationFeedbackVariant) {
  switch (variant) {
    case "missing":
      return ArrowLeft;
    case "offline":
      return WifiOff;
    default:
      return AlertTriangle;
  }
}

export function ActivityConversationFeedback({
  actionLabel,
  description,
  isActionLoading = false,
  title,
  variant,
  onAction,
}: ActivityConversationFeedbackProps) {
  const Icon = getFeedbackIcon(variant);
  const isOffline = variant === "offline";

  return (
    <section
      className="flex min-h-0 flex-1 items-center justify-center bg-canvas/30 px-6 py-10 text-center"
      role="status"
    >
      <div className="flex w-full max-w-sm flex-col items-center">
        <ErrorNetworkRetryVisual className="h-36 w-auto text-foreground" />
        <span
          className={cn(
            "mt-5 flex size-11 items-center justify-center rounded-full border",
            isOffline
              ? "border-spark-amber/35 bg-spark-amber/10 text-spark-amber"
              : "border-destructive/30 bg-destructive/10 text-destructive",
            variant === "missing" &&
              "border-forge-teal/30 bg-forge-teal/10 text-forge-teal",
          )}
          aria-hidden="true"
        >
          <Icon size={19} />
        </span>
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
          {variant === "missing" ? (
            <ArrowLeft size={14} />
          ) : (
            <RefreshCw size={14} />
          )}
          {actionLabel}
        </Button>
      </div>
    </section>
  );
}
