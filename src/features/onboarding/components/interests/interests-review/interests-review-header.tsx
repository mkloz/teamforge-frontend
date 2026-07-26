import { CheckCircle2 } from "lucide-react";
import { StatusPill } from "@/shared/components/ui/status-pill";

interface InterestsReviewHeaderProps {
  totalSelected: number;
}

export function InterestsReviewHeader({
  totalSelected,
}: InterestsReviewHeaderProps) {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="pt-4">
        <h2 className="font-extrabold font-sans text-2xl text-ink">
          Your interests
        </h2>
      </div>
      <StatusPill
        icon={CheckCircle2}
        tone="teal"
        size="md"
        className="border-transparent"
      >
        {totalSelected} selected
      </StatusPill>
    </div>
  );
}
