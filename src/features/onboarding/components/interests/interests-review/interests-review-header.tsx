import { CheckCircle2 } from "lucide-react";

interface InterestsReviewHeaderProps {
  totalSelected: number;
}

export function InterestsReviewHeader({
  totalSelected,
}: InterestsReviewHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="pt-4">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-forge-teal mb-1">
          Review
        </p>
        <h2 className="font-sans text-2xl font-extrabold text-[#1C1C1A]">
          Your interests
        </h2>
      </div>
      <div className="flex items-center gap-1.5 bg-forge-teal/10 text-forge-teal px-3 py-1.5 rounded-full">
        <CheckCircle2 size={13} strokeWidth={2.5} />
        <span className="font-sans text-xs font-semibold">
          {totalSelected} selected
        </span>
      </div>
    </div>
  );
}
