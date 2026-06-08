import { NotFoundEmptyTableVisual } from "@/assets/empty-state/not-found-empty-table";
import { cn } from "@/shared/lib/utils";

interface SoloActivitySceneProps {
  className?: string;
  inline?: boolean;
}

export function SoloActivityScene({
  className,
  inline = false,
}: SoloActivitySceneProps) {
  if (inline) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none relative flex min-h-0 items-end justify-center overflow-visible",
          className,
        )}
      >
        <div className="solo-activity-breathe w-full max-w-xs">
          <NotFoundEmptyTableVisual className="w-full text-ink drop-shadow-xl" />
        </div>
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none relative min-h-0 overflow-hidden",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-20 mx-auto w-full max-w-sm px-8 lg:inset-y-0 lg:top-0 lg:right-0 lg:left-auto lg:flex lg:max-w-full lg:items-stretch lg:justify-end lg:px-0">
        <div className="solo-activity-breathe relative lg:flex lg:h-full lg:max-h-full lg:items-center">
          <NotFoundEmptyTableVisual className="w-full text-ink drop-shadow-xl lg:h-full lg:w-auto lg:max-w-full" />
        </div>
      </div>
    </div>
  );
}
