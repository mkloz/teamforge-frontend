import { cn } from "@/shared/lib/utils";

const ANVIL_STAGE_VIEW_BOX = "32 32 156 142";
const ANVIL_STAGE_ASPECT_RATIO = 142 / 156;

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
      role="status"
      aria-label={displayLabel}
    >
      <div
        className="relative"
        style={{ width: size, height: size * ANVIL_STAGE_ASPECT_RATIO }}
      >
        <div className="absolute inset-0">
          <svg
            viewBox={ANVIL_STAGE_VIEW_BOX}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="size-full"
          >
            <path
              d="M58 160C75.5 151 143.5 151 162 160"
              stroke="var(--color-forge-teal)"
              strokeLinecap="round"
              strokeWidth="3"
            />
            <path
              d="M63 111h91c5 0 8 5 5 9l-10 13c-2 3-6 5-10 5H82c-4 0-8-2-10-5l-13-16c-2-3 0-6 4-6Z"
              fill="var(--color-forge-teal)"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth="3.5"
            />
            <path
              d="M47 104h39l9 7H62c-9 0-16-2-21-6-2-1-1-1 6-1ZM154 104h22c6 0 8 3 3 7l-20 15-9-10 14-5h-16l6-7ZM80 138h60l-7 18H87l-7-18Z"
              fill="var(--color-background)"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth="3.5"
            />
            <path
              d="M72 111h72M88 156h44"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="3.5"
            />
            <path
              d="M99 107.75h22"
              stroke="var(--color-spark-amber)"
              strokeLinecap="round"
              strokeWidth="3"
            />
            <path
              d="M112 91h52"
              fill="var(--color-background)"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="3.5"
              transform="translate(4 -9.5)"
            />
            <path
              d="M101 78h12c2.761 0 5 2.239 5 5v24c0 2.761-2.239 5-5 5h-12c-2.761 0-5-2.239-5-5V83c0-2.761 2.239-5 5-5Z"
              fill="var(--color-forge-teal)"
              stroke="currentColor"
              strokeWidth="3.5"
              transform="translate(4 -9.5)"
            />
            <path
              d="M103 83v24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="3"
              transform="translate(4 -9.5)"
            />
          </svg>
        </div>
      </div>
      <div className="flex flex-col gap-1 text-center">
        <p className="font-black text-foreground text-sm">{displayLabel}</p>
        <p className="font-bold text-micro text-muted-foreground uppercase">
          Group forge
        </p>
      </div>
    </div>
  );
}
