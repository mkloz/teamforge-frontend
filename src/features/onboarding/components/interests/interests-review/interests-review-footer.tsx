import { Button } from "@/shared/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface InterestsReviewFooterProps {
  onConfirm: () => void;
  canConfirm: boolean;
  onBack: () => void;
  isSaving?: boolean;
  confirmLabel?: string;
}

export function InterestsReviewFooter({
  onConfirm,
  canConfirm,
  onBack,
  isSaving = false,
  confirmLabel = "Confirm & Finish",
}: InterestsReviewFooterProps) {
  return (
    <div className="w-full flex items-center gap-3 pt-4 pb-6 sm:pb-5">
      <Button variant="outline" size="lg" onClick={onBack} disabled={isSaving}>
        Back
      </Button>
      <Button
        variant="primary"
        size="lg"
        onClick={onConfirm}
        disabled={!canConfirm || isSaving}
        className="flex-1"
      >
        {isSaving ? "Saving…" : confirmLabel}
        <CheckCircle2 size={18} />
      </Button>
    </div>
  );
}
