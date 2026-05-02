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
      className="-mx-4 sm:-mx-5 -mt-1 w-[calc(100%+32px)] sm:w-[calc(100%+40px)] sticky top-0 z-50"
    />
  );
}
