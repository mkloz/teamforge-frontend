import { TopProgressBar } from "@/shared/components/common/top-progress-bar";

interface InterestsProgressDecorationProps {
  progress: number;
}

export function InterestsProgressDecoration({
  progress,
}: InterestsProgressDecorationProps) {
  return (
    <TopProgressBar
      progress={progress}
      className="sticky top-0 z-50 -mx-4 -mt-1 w-full sm:-mx-5"
    />
  );
}
