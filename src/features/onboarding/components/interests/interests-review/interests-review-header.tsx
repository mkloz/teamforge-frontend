import { CheckCircle2 } from "lucide-react";

interface InterestsReviewHeaderProps {
  totalSelected: number;
}

export function InterestsReviewHeader({
  totalSelected,
}: InterestsReviewHeaderProps) {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="pt-4">
        <p className="mb-1 font-bold font-sans text-forge-teal text-xs uppercase tracking-widest">
          Review
        </p>
        <h2 className="font-extrabold font-sans text-2xl text-ink">
          Your interests
        </h2>
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-forge-teal/10 px-3 py-1.5 text-forge-teal">
        <CheckCircle2 size={13} strokeWidth={2.5} />
        <span className="font-sans font-semibold text-xs">
          {totalSelected} selected
        </span>
      </div>
    </div>
  );
}
