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
    <div className="flex-1 flex items-center gap-3 px-4 h-11">
      <div className="flex items-center gap-2 text-red-500">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-sm font-black tabular-nums tracking-wide">
          {timeLabel}
        </span>
      </div>
      <div className="flex-1 h-5 flex items-center gap-0.5 overflow-hidden">
        {bars.map((height, i) => (
          <div
            key={i}
            className="w-0.75 bg-red-400/30 rounded-full duration-200"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <span className="text-micro uppercase tracking-wider text-slate-muted font-bold animate-in fade-in slide-in-from-right-2">
        Recording...
      </span>
    </div>
  );
});
