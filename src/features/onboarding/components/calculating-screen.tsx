import { useEffect, useRef, useState } from "react";
import { TeamForgeLogo } from "../../../assets/logo";
import { OCEAN_LABELS } from "../data/type-descriptions";
import { toDisplayPercent, type OceanVectorWithMeta } from "../utils/score-calculator";

const DIMS = ["O", "C", "E", "A", "N"] as const;

interface CalculatingScreenProps {
  vector: OceanVectorWithMeta;
  onDone: () => void;
}

export function CalculatingScreen({ vector, onDone }: CalculatingScreenProps) {
  const [filledCount, setFilledCount] = useState(0);
  // Compute bar widths once from real vector scores, not random
  const barWidths = useRef(
    DIMS.map((dim) => toDisplayPercent(vector, dim))
  );

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    DIMS.forEach((_, i) => {
      timers.push(setTimeout(() => setFilledCount(i + 1), 320 + i * 300));
    });
    timers.push(setTimeout(onDone, 320 + DIMS.length * 300 + 520));
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-6"
      style={{ background: "#090909" }}
    >
      <TeamForgeLogo className="w-10 h-10 mb-10" showBackground={false} />

      <p
        className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] mb-8"
        style={{ color: "rgba(13,148,136,0.7)" }}
      >
        Mapping your personality space
      </p>

      <div className="flex flex-col gap-5 w-full max-w-xs">
        {DIMS.map((dim, i) => {
          const filled = i < filledCount;
          const labels = OCEAN_LABELS[dim];
          const width = barWidths.current[i];

          return (
            <div key={dim} className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <span
                  className="font-sans text-xs font-medium"
                  style={{ color: filled ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.25)", transition: "color 0.4s" }}
                >
                  {labels.label}
                </span>
                <span
                  className="font-sans text-[10px]"
                  style={{ color: filled ? "rgba(13,148,136,0.8)" : "transparent", transition: "color 0.4s" }}
                >
                  {labels.lowLabel} → {labels.highLabel}
                </span>
              </div>
              <div
                className="w-full rounded-full overflow-hidden"
                style={{ height: 4, background: "rgba(255,255,255,0.07)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: filled ? `${width}%` : "0%",
                    background: "linear-gradient(90deg, #0D9488, #14B8A6)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p
        className="font-sans text-xs mt-10 font-medium"
        style={{ color: "rgba(255,255,255,0.2)" }}
      >
        Calculating your type...
      </p>
    </div>
  );
}
