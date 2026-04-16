import { Button } from "@/shared/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface InterestsReviewFooterProps {
  onConfirm: () => void;
  canConfirm: boolean;
  onBack: () => void;
}

export function InterestsReviewFooter({
  onConfirm,
  canConfirm,
  onBack,
}: InterestsReviewFooterProps) {
  return (
    <div className="w-full flex items-center gap-3 pt-4 pb-6 sm:pb-5">
      <Button variant="outline" size="lg" onClick={onBack}>
        Back
      </Button>
      <Button
        variant="primary"
        size="lg"
        onClick={onConfirm}
        disabled={!canConfirm}
        className="flex-1"
      >
        Confirm & Finish
        <CheckCircle2 size={18} />
      </Button>
    </div>
  );
}
