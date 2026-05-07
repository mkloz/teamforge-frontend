import { Button } from "@/shared/components/ui/button";
import { CheckCircle2 } from "lucide-react";

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
    <div className="flex w-full flex-col-reverse items-stretch gap-3 pt-4 pb-6 min-[430px]:flex-row min-[430px]:items-center sm:pb-5">
      <Button
        variant="outline"
        size="md"
        onClick={onBack}
        disabled={isSaving}
        className="w-full min-w-0 min-[430px]:w-auto min-[430px]:shrink-0"
      >
        <span className="truncate">{backLabel}</span>
      </Button>
      <Button
        variant="primary"
        size="md"
        onClick={onConfirm}
        disabled={!canConfirm || isSaving}
        className="w-full min-w-0 min-[430px]:flex-1"
      >
        <span className="truncate">{isSaving ? "Saving…" : confirmLabel}</span>
        <CheckCircle2 size={18} />
      </Button>
    </div>
  );
}
