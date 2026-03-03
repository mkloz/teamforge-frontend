interface LikertScaleProps {
  value: 1 | 2 | 3 | 4 | 5 | undefined;
  onChange: (val: 1 | 2 | 3 | 4 | 5) => void;
  questionId: number;
}

const POINTS = [1, 2, 3, 4, 5] as const;

export function LikertScale({ value, onChange, questionId }: LikertScaleProps) {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {/* Track + dots */}
      <div className="relative flex items-center justify-between w-full max-w-xs">
        {/* Connecting line */}
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 rounded-full"
          style={{ background: "rgba(107,114,128,0.18)" }}
          aria-hidden="true"
        />

        {POINTS.map((point) => {
          const selected = value === point;
          const isCenter = point === 3;
          return (
            <button
              key={point}
              type="button"
              aria-label={`Option ${point} of 5`}
              aria-pressed={selected}
              onClick={() => onChange(point)}
              className="relative z-10 flex items-center justify-center rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                width: selected ? 22 : isCenter ? 14 : 18,
                height: selected ? 22 : isCenter ? 14 : 18,
                background: selected
                  ? "#0D9488"
                  : "white",
                border: selected
                  ? "2.5px solid #0D9488"
                  : `2px solid ${isCenter ? "rgba(107,114,128,0.35)" : "rgba(107,114,128,0.4)"}`,
                boxShadow: selected
                  ? "0 0 0 5px rgba(13,148,136,0.14)"
                  : undefined,
                flexShrink: 0,
              }}
            />
          );
        })}
      </div>

      {/* End labels */}
      <div className="flex justify-between w-full max-w-xs">
        <span className="font-sans text-[10px] font-medium text-slate-muted select-none">
          Disagree
        </span>
        <span className="font-sans text-[10px] font-medium text-slate-muted select-none">
          Agree
        </span>
      </div>
    </div>
  );
}
