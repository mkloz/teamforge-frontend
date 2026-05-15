import { CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface InterestsReviewFooterProps {
  backLabel?: string;
  onConfirm: () => void;
  canConfirm: boolean;
  onBack: () => void;
  isSaving?: boolean;
  confirmLabel?: string;
}

export function InterestsReviewFooter({
  backLabel = "Back",
  onConfirm,
  canConfirm,
  onBack,
  isSaving = false,
  confirmLabel = "Confirm & Finish",
}: InterestsReviewFooterProps) {
  return (
    <div className="flex w-full xs:flex-row flex-col-reverse xs:items-center items-stretch gap-3 pt-4 pb-6 sm:pb-5">
      <Button
        variant="outline"
        size="md"
        onClick={onBack}
        disabled={isSaving}
        className="w-full xs:w-auto min-w-0 xs:shrink-0"
      >
        <span className="truncate">{backLabel}</span>
      </Button>
      <Button
        variant="primary"
        size="md"
        onClick={onConfirm}
        disabled={!canConfirm || isSaving}
        className="w-full min-w-0 xs:flex-1"
      >
        <span className="truncate">{isSaving ? "Saving…" : confirmLabel}</span>
        <CheckCircle2 size={18} />
      </Button>
    </div>
  );
}
