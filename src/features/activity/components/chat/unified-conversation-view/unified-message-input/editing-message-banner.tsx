import { PencilLine, X } from "lucide-react";
import { memo } from "react";
import { Button } from "@/shared/components/ui/button";

interface EditingMessageBannerProps {
  onCancel: () => void;
}

export const EditingMessageBanner = memo(function EditingMessageBanner({
  onCancel,
}: EditingMessageBannerProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-border/60 border-b px-3 py-2 text-xs">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-lg bg-forge-teal/10 text-forge-teal">
          <PencilLine className="size-3.5" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-ink">Editing message</p>
          <p className="truncate text-slate-muted">
            Save your updated text to replace the original.
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 rounded-full px-3 text-slate-muted hover:text-ink"
        onClick={onCancel}
      >
        <X className="size-3.5" aria-hidden="true" />
        Cancel
      </Button>
    </div>
  );
});
