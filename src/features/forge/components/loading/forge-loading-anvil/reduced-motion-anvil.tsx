import { cn } from "@/shared/lib/utils";

interface ReducedMotionAnvilProps {
  className?: string;
  displayLabel: string;
  size: number;
}

export function ReducedMotionAnvil({
  className,
  displayLabel,
  size,
}: ReducedMotionAnvilProps) {
  return (
    <div
      className={cn(
        "flex select-none flex-col items-center justify-center gap-4",
        className,
      )}
      style={{ width: size, height: size }}
      role="status"
      aria-label={displayLabel}
    >
      <div className="relative h-14 w-24">
        <div className="absolute inset-x-1 bottom-3 h-8">
          <svg
            viewBox="0 0 96 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="h-full w-full"
          >
            <path
              d="M16 14h45c3 0 5 3 3 6l-5 6c-1 2-3 3-6 3H27c-2 0-4-1-6-3l-7-9c-1-2 0-3 2-3Z"
              className="fill-card stroke-border"
              strokeWidth="1.5"
            />
            <path
              d="M8 11h22l6 3H17c-5 0-8-1-10-3h1ZM64 11h14c3 0 4 2 2 4L68 24l-5-5 8-4h-9l2-4Z"
              className="fill-muted stroke-border"
              strokeWidth="1.5"
            />
            <path d="M28 29h27l-4 8H32l-4-8Z" className="fill-muted" />
            <path
              d="M24 14h34"
              stroke="var(--color-forge-teal)"
              strokeLinecap="round"
              strokeOpacity="0.7"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="absolute inset-x-7 bottom-0 h-1.5 rounded-sm bg-muted" />
      </div>
      <div className="space-y-1 text-center">
        <p className="font-black text-foreground text-sm">{displayLabel}</p>
        <p className="font-bold text-micro text-muted-foreground uppercase">
          Matching signals
        </p>
      </div>
    </div>
  );
}
