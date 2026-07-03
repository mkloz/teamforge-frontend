import { X } from "lucide-react";
import { SelectionToolbarActions } from "@/features/activity/components/conversation-workspace/message-selection-toolbar/selection-toolbar-actions";
import type { getSelectionActionButtonStates } from "@/features/activity/components/conversation-workspace/message-selection-toolbar-state";
import { Button } from "@/shared/components/ui/button";

interface SelectionToolbarShellProps {
  actionButtonStates: ReturnType<typeof getSelectionActionButtonStates>;
  onClearSelection: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onForward: () => void;
  onSave: () => void;
  selectedCount: number;
}

export function SelectionToolbarShell({
  actionButtonStates,
  onClearSelection,
  onCopy,
  onDelete,
  onForward,
  onSave,
  selectedCount,
}: SelectionToolbarShellProps) {
  return (
    <div className="isolate z-30 min-h-17 shrink-0 overflow-visible border-border/60 border-t bg-canvas/90 px-2.5 pt-2 pb-safe-bottom backdrop-blur-xl sm:px-3">
      <div className="mx-auto flex h-12 w-full max-w-4xl items-center gap-2 sm:gap-2.5">
        <Button
          type="button"
          variant="accentGhost"
          size="icon-sm"
          aria-label="Cancel message selection"
          className="shrink-0 rounded-full"
          onClick={onClearSelection}
        >
          <X className="size-4" aria-hidden="true" />
        </Button>

        <span className="min-w-0 flex-1 truncate font-bold text-ink text-sm">
          {selectedCount} selected
        </span>

        <SelectionToolbarActions
          buttonStates={actionButtonStates}
          onCopy={onCopy}
          onDelete={onDelete}
          onForward={onForward}
          onSave={onSave}
        />
      </div>
    </div>
  );
}
