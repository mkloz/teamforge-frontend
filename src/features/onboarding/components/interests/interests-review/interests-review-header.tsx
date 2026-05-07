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
        <p className="mb-1 font-sans text-xs font-bold tracking-[0.18em] text-forge-teal uppercase">
          Review
        </p>
        <h2 className="font-sans text-2xl font-extrabold text-ink">
          Your interests
        </h2>
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-forge-teal/10 px-3 py-1.5 text-forge-teal">
        <CheckCircle2 size={13} strokeWidth={2.5} />
        <span className="font-sans text-xs font-semibold">
          {totalSelected} selected
        </span>
      </div>
    </div>
  );
}
