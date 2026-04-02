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
    <div className="w-full backdrop-blur-sm bg-white/80 border-t border-slate-200/60 pt-4 pb-6 sm:pb-5 px-4 sm:px-5 relative z-30 shrink-0">
      <div className="max-w-xl mx-auto flex items-center gap-3 w-full">
        <Button
          size="lg"
          variant="outline"
          onClick={onBack}
          className="h-12 px-4 sm:px-6 rounded-xl border-slate-200 text-slate-600 font-bold transition-all hover:bg-slate-50 active:scale-95"
        >
          Back
        </Button>
        <Button
          size="lg"
          onClick={onConfirm}
          disabled={!canConfirm}
          className="flex-1 h-12 flex items-center justify-center gap-2 font-sans text-sm font-bold rounded-xl bg-forge-teal text-white hover:bg-forge-teal/90 shadow-lg shadow-forge-teal/20 transition-all duration-200 active:scale-[0.98]"
        >
          Confirm & Finish
          <CheckCircle2 size={16} strokeWidth={2.5} />
        </Button>
      </div>
    </div>
  );
}
