import { Check, X } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

interface AttentionQueueActionButton {
  ariaLabel: string;
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
  title: string | undefined;
}

interface AttentionQueueItemActionsProps {
  accept: AttentionQueueActionButton & {
    label: string;
  };
  decline: AttentionQueueActionButton;
}

export function AttentionQueueItemActions({
  accept,
  decline,
}: AttentionQueueItemActionsProps) {
  return (
    <div className="flex shrink-0 items-center justify-end gap-1.5">
      <Button
        size="icon-sm"
        className="size-9 sm:w-auto sm:px-3"
        loading={accept.loading}
        disabled={accept.disabled}
        onClick={accept.onClick}
        aria-label={accept.ariaLabel}
        title={accept.title}
      >
        <Check className="size-3" />
        <span className="hidden sm:inline">{accept.label}</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-9 text-muted-foreground hover:enabled:bg-destructive-soft hover:enabled:text-destructive"
        loading={decline.loading}
        disabled={decline.disabled}
        onClick={decline.onClick}
        aria-label={decline.ariaLabel}
        title={decline.title}
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}
