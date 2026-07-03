import { Bookmark, Trash2 } from "lucide-react";
import type { MouseEvent } from "react";
import { Button } from "@/shared/components/ui/button";

interface SavedMessageBubbleActionsProps {
  onRemove: () => Promise<void> | void;
}

export function SavedMessageBubbleActions({
  onRemove,
}: SavedMessageBubbleActionsProps) {
  function handleRemove(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    void onRemove();
  }

  return (
    <div className="mt-1 flex w-full max-w-2xl flex-wrap items-center gap-x-2 gap-y-1 px-2">
      <span className="inline-flex items-center gap-1 font-bold text-micro text-slate-muted/70">
        <Bookmark className="size-3 fill-current" aria-hidden="true" />
        Opens original message
      </span>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        className="h-7 px-2 text-destructive/80 text-micro opacity-70 focus-visible:ring-destructive/25 hover:enabled:bg-destructive/8 hover:enabled:text-destructive md:opacity-0 md:group-hover/saved-message:opacity-100"
        contentClassName="gap-1"
        onClick={handleRemove}
      >
        <Trash2 className="size-3" aria-hidden="true" />
        Remove
      </Button>
    </div>
  );
}
