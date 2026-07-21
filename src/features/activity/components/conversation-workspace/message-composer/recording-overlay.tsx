interface RecordingOverlayProps {
  timeLabel: string;
}

const RECORDING_BARS = Array.from({ length: 24 }, (_, index) => {
  const noise = 0.5 + Math.abs(Math.sin(index * 12.9898 + 78.233)) * 0.5;

  return {
    height: 20 + noise * 60,
    id: `recording-bar-${index}`,
  };
});

export function RecordingOverlay({ timeLabel }: RecordingOverlayProps) {
  return (
    <div className="flex h-11 flex-1 items-center gap-3 px-4">
      <div className="flex items-center gap-2 text-destructive">
        <div className="size-2.5 animate-pulse rounded-full bg-destructive" />
        <span className="font-black text-sm tabular-nums tracking-wide">
          {timeLabel}
        </span>
      </div>
      <div className="flex h-5 flex-1 items-center gap-0.5 overflow-hidden">
        {RECORDING_BARS.map((bar) => (
          <div
            key={bar.id}
            className="w-px rounded-full bg-destructive/30 duration-200"
            style={{ height: `${bar.height}%` }}
          />
        ))}
      </div>
      <span className="fade-in slide-in-from-right-2 animate-in font-bold text-slate-muted text-xs">
        Recording...
      </span>
    </div>
  );
}
