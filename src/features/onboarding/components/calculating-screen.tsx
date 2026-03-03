import { useEffect, useState } from "react";
import { TeamForgeLogo } from "../../../assets/logo";
import { OCEAN_LABELS } from "../data/type-descriptions";

const DIMS = ["O", "C", "E", "A", "N"] as const;

interface CalculatingScreenProps {
  onDone: () => void;
}

export function CalculatingScreen({ onDone }: CalculatingScreenProps) {
  const [filledCount, setFilledCount] = useState(0);

  useEffect(() => {
    // Fill bars one by one with 280ms stagger, then call onDone
    const timers: ReturnType<typeof setTimeout>[] = [];
    DIMS.forEach((_, i) => {
      timers.push(setTimeout(() => setFilledCount(i + 1), 300 + i * 280));
    });
    // Done after last bar + 500ms pause
    timers.push(setTimeout(onDone, 300 + DIMS.length * 280 + 500));
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-6"
      style={{ background: "#090909" }}
    >
      <TeamForgeLogo className="w-10 h-10 mb-10" showBackground={false} />

      <div className="flex flex-col gap-4 w-full max-w-xs">
        {DIMS.map((dim, i) => {
          const filled = i < filledCount;
          const labels = OCEAN_LABELS[dim];
          return (
            <div key={dim} className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="font-sans text-xs font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {labels.label}
                </span>
              </div>
              <div
                className="w-full rounded-full overflow-hidden"
                style={{ height: 5, background: "rgba(255,255,255,0.08)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: filled ? `${40 + Math.random() * 50}%` : "0%",
                    background: "#0D9488",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p
        className="font-sans text-xs mt-10 font-medium"
        style={{ color: "rgba(255,255,255,0.3)" }}
      >
        Mapping your personality space...
      </p>
    </div>
  );
}
