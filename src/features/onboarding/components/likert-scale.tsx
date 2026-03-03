interface LikertScaleProps {
  value: 1 | 2 | 3 | 4 | 5 | undefined;
  onChange: (val: 1 | 2 | 3 | 4 | 5) => void;
  questionId: number;
}

const POINTS = [1, 2, 3, 4, 5] as const;

const LABELS: Record<number, string> = {
  1: "Strongly disagree",
  2: "Disagree",
  3: "Neutral",
  4: "Agree",
  5: "Strongly agree",
};

export function LikertScale({ value, onChange, questionId }: LikertScaleProps) {
  return (
    <div className="flex flex-col gap-3 w-full" role="radiogroup" aria-label="Rate your agreement">
      {/* Track + dots row */}
      <div className="relative flex items-center justify-between w-full">
        {/* Connecting line */}
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px"
          style={{ background: "rgba(107,114,128,0.18)" }}
          aria-hidden="true"
        />

        {POINTS.map((point) => {
          const selected = value === point;
          return (
            <button
              key={point}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={LABELS[point]}
              onClick={() => onChange(point)}
              className="relative z-10 flex items-center justify-center rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                width: 20,
                height: 20,
                background: selected ? "#0D9488" : "white",
                border: selected
                  ? "2.5px solid #0D9488"
                  : "1.5px solid rgba(107,114,128,0.35)",
                boxShadow: selected
                  ? "0 0 0 4px rgba(13,148,136,0.14)"
                  : undefined,
                transform: selected ? "scale(1.2)" : "scale(1)",
                flexShrink: 0,
              }}
            />
          );
        })}
      </div>

      {/* Per-dot labels */}
      <div className="flex justify-between w-full">
        {POINTS.map((point) => {
          const selected = value === point;
          return (
            <div
              key={point}
              className="flex flex-col items-center"
              style={{ width: "20%", textAlign: "center" }}
            >
              <span
                className="font-sans leading-tight select-none"
                style={{
                  fontSize: 9,
                  color: selected ? "#0D9488" : "rgba(107,114,128,0.6)",
                  fontWeight: selected ? 600 : 400,
                  transition: "color 0.15s",
                  display: "block",
                  maxWidth: 52,
                  wordBreak: "break-word",
                  hyphens: "auto",
                }}
              >
                {LABELS[point]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
