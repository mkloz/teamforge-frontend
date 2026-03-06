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
    <div className="w-full backdrop-blur-sm bg-white/30 border-t border-white/20 pt-4 pb-4 px-5 relative z-30 shrink-0">
      <div className="max-w-xl mx-auto flex gap-3 w-full">
        <Button
          size="lg"
          variant={"outline"}
          onClick={onBack}
          disabled={!canConfirm}
          className=""
        >
          Back to browse
        </Button>
        <Button
          size="lg"
          onClick={onConfirm}
          disabled={!canConfirm}
          className="w-full flex items-center justify-center gap-2 font-sans text-sm font-semibold rounded-xl bg-forge-teal text-primary-foreground hover:bg-forge-teal-light shadow-[0_4px_16px_rgba(13,148,136,0.25)] hover:shadow-[0_8px_24px_rgba(13,148,136,0.4)] transition duration-200 active:scale-[0.98] h-12"
        >
          Confirm &amp; finish
          <CheckCircle2 size={15} strokeWidth={2.5} />
        </Button>
      </div>
    </div>
  );
}
