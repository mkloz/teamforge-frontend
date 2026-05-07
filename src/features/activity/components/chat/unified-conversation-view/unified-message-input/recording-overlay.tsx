import { memo, useMemo } from "react";

interface RecordingOverlayProps {
  timeLabel: string;
}

export const RecordingOverlay = memo(({ timeLabel }: RecordingOverlayProps) => {
  const bars = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        // Deterministic pseudo-random heights based on index
        const noise = 0.5 + Math.abs(Math.sin(i * 12.9898 + 78.233)) * 0.5;
        return 20 + noise * 60;
      }),
    [],
  );

  return (
    <div className="flex h-11 flex-1 items-center gap-3 px-4">
      <div className="flex items-center gap-2 text-destructive">
        <div className="size-2.5 animate-pulse rounded-full bg-destructive" />
        <span className="text-sm font-black tracking-wide tabular-nums">
          {timeLabel}
        </span>
      </div>
      <div className="flex h-5 flex-1 items-center gap-0.5 overflow-hidden">
        {bars.map((height, i) => (
          <div
            key={i}
            className="w-px rounded-full bg-destructive/30 duration-200"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <span className="animate-in text-micro font-bold tracking-wider text-slate-muted uppercase fade-in slide-in-from-right-2">
        Recording...
      </span>
    </div>
  );
});
