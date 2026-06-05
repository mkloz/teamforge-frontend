import type { CSSProperties } from "react";
import { cn } from "@/shared/lib/utils";

interface ForgeLoadingMarkProps {
  className?: string;
  label?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASS = {
  sm: "w-20",
  md: "w-28",
  lg: "w-36",
} as const;

const LOADING_ANIMATION_DURATION_MS = 1_450;
const BOOT_ANIMATION_SYNC_WINDOW_MS = LOADING_ANIMATION_DURATION_MS * 2;

const SPARKS = [
  { id: 1, x: -22, y: -5, size: 4 },
  { id: 2, x: 18, y: -8, size: 3.5 },
  { id: 3, x: -12, y: 6, size: 4.5 },
  { id: 4, x: 26, y: 2, size: 3 },
  { id: 5, x: -32, y: 0, size: 3 },
  { id: 6, x: 12, y: 10, size: 4 },
  { id: 7, x: 22, y: 12, size: 3 },
  { id: 8, x: 32, y: -6, size: 4 },
] as const;

type SparkStyle = CSSProperties &
  Record<"--spark-x" | "--spark-y" | "--spark-delay", string>;

type ForgeLoadingMarkStyle = CSSProperties &
  Record<"--forge-loading-animation-offset", string>;

type BootWindow = Window & {
  __TEAMFORGE_BOOT_STARTED_AT?: number;
};

function getSyncedAnimationOffset() {
  if (typeof window === "undefined") {
    return "0ms";
  }

  const bootStartedAt = (window as BootWindow).__TEAMFORGE_BOOT_STARTED_AT;

  if (typeof bootStartedAt !== "number") {
    return "0ms";
  }

  const elapsedMs = Math.max(0, performance.now() - bootStartedAt);

  if (elapsedMs > BOOT_ANIMATION_SYNC_WINDOW_MS) {
    return "0ms";
  }

  const phaseMs = elapsedMs % LOADING_ANIMATION_DURATION_MS;

  return `${-phaseMs}ms`;
}

export function ForgeLoadingMark({
  className,
  label = "Preparing TeamForge",
  showLabel = false,
  size = "md",
}: ForgeLoadingMarkProps) {
  const animationStyle = {
    "--forge-loading-animation-offset": getSyncedAnimationOffset(),
  } satisfies ForgeLoadingMarkStyle;

  return (
    <div
      className={cn(
        "forge-loading-mark flex select-none flex-col items-center justify-center gap-3 text-foreground",
        className,
      )}
      style={animationStyle}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <svg
        viewBox="32 32 156 142"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={cn("overflow-visible", SIZE_CLASS[size])}
      >
        <path
          className="forge-loading-mark__line"
          d="M58 160C75.5 151 143.5 151 162 160"
          stroke="var(--color-forge-teal)"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <ellipse
          className="forge-loading-mark__glow"
          cx="110"
          cy="156"
          rx="48"
          ry="8"
          fill="var(--color-forge-teal)"
        />
        <g className="forge-loading-mark__anvil">
          <path
            d="M63 111h101l-14 5 9 10-10 7c-2 3-6 5-10 5H82c-4 0-8-2-10-5l-13-16c-2-3 0-6 4-6Z"
            fill="var(--color-forge-teal)"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="3.5"
          />
          <path
            d="M47 104h39l9 7H62c-9 0-16-2-21-6-2-1-1-1 6-1ZM154 104h22c6 0 8 3 3 7l-20 15-9-10 14-5h-16l6-7Z"
            fill="transparent"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="3.5"
          />
          <path
            d="M80 138h60l-7 18H87l-7-18Z"
            fill="transparent"
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
        </g>
        <path
          className="forge-loading-mark__spark-core"
          d="M99 107.75h22"
          stroke="var(--color-spark-amber)"
          strokeLinecap="round"
          strokeWidth="3"
        />
        {SPARKS.map((spark) => (
          <circle
            key={spark.id}
            className="forge-loading-mark__spark"
            cx="110"
            cy="108"
            r={spark.size}
            fill="var(--color-spark-amber)"
            style={
              {
                "--spark-delay": "0ms",
                "--spark-x": `${spark.x}px`,
                "--spark-y": `${spark.y}px`,
              } satisfies SparkStyle
            }
          />
        ))}
        <g className="forge-loading-mark__swoosh-group">
          <path
            className="forge-loading-mark__swoosh-top"
            d="M 152 40 A 55 55 0 0 0 102 67"
            fill="none"
            stroke="var(--color-forge-teal)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            className="forge-loading-mark__swoosh-mid"
            d="M 156 50 A 45 45 0 0 0 110 78"
            fill="none"
            stroke="var(--color-forge-teal)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            className="forge-loading-mark__swoosh-bot"
            d="M 160 60 A 35 35 0 0 0 118 90"
            fill="none"
            stroke="var(--color-forge-teal)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
        <g className="forge-loading-mark__hammer">
          <g transform="translate(4 -9.5)">
            <rect
              x="112"
              y="91"
              width="52"
              height="7"
              rx="3.5"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="3.5"
            />
            <path
              d="M101 78h12c2.761 0 5 2.239 5 5v24c0 2.761-2.239 5-5 5h-12c-2.761 0-5-2.239-5-5V83c0-2.761 2.239-5 5-5Z"
              fill="var(--color-forge-teal)"
              stroke="currentColor"
              strokeWidth="3.5"
            />
            <path
              d="M103 83v24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="3"
            />
          </g>
        </g>
      </svg>
      {showLabel ? (
        <p className="font-black text-sm">{label}</p>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
}
