import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { TEST_LENGTH_CONFIG, type TestLength } from "../data/ipip-questions";

interface LengthSelectorProps {
  onBack: () => void;
  onBegin: (length: TestLength) => void;
}

const OPTIONS: TestLength[] = [30, 50, 150];

export function LengthSelector({ onBack, onBegin }: LengthSelectorProps) {
  const [selected, setSelected] = useState<TestLength>(50);

  return (
    <div className="flex flex-col max-w-md mx-auto w-full gap-0">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 font-sans text-xs font-medium mb-8 w-fit transition-colors"
        style={{ color: "#6B7280" }}
      >
        <ArrowLeft size={14} strokeWidth={2.5} />
        Back
      </button>

      {/* Overline */}
      <p
        className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] mb-3"
        style={{ color: "#0D9488" }}
      >
        Test Length
      </p>

      <h2
        className="font-sans text-2xl font-bold leading-snug text-balance mb-2"
        style={{ color: "#1C1C1A" }}
      >
        How much time do you have?
      </h2>

      <p
        className="font-sans text-sm leading-relaxed mb-7"
        style={{ color: "#6B7280" }}
      >
        More questions produce a more accurate match. Each page shows 3 questions — only the
        total number of pages changes.
      </p>

      {/* Option cards */}
      <div className="flex flex-col gap-3 mb-8">
        {OPTIONS.map((length) => {
          const config = TEST_LENGTH_CONFIG[length];
          const isSelected = selected === length;
          return (
            <button
              key={length}
              type="button"
              onClick={() => setSelected(length)}
              className="relative w-full text-left rounded-2xl p-4 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                background: "#FFFFFF",
                border: isSelected
                  ? "2px solid #0D9488"
                  : "1.5px solid rgba(107,114,128,0.18)",
                boxShadow: isSelected
                  ? "0 2px 12px rgba(13,148,136,0.1)"
                  : "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              {/* Recommended pill */}
              {config.recommended && (
                <span
                  className="absolute top-4 right-4 font-sans text-[10px] font-semibold rounded-full px-2.5 py-0.5"
                  style={{
                    background: "#F59E0B",
                    color: "#FFFFFF",
                  }}
                >
                  Recommended
                </span>
              )}

              <div className="flex items-center gap-3">
                {/* Radio dot */}
                <div
                  className="flex-shrink-0 rounded-full transition-all duration-150"
                  style={{
                    width: 18,
                    height: 18,
                    border: isSelected
                      ? "5px solid #0D9488"
                      : "2px solid rgba(107,114,128,0.4)",
                    background: "white",
                  }}
                />

                <div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="font-sans text-sm font-semibold"
                      style={{ color: "#1C1C1A" }}
                    >
                      {config.label}
                    </span>
                    <span
                      className="font-sans text-xs"
                      style={{ color: "#6B7280" }}
                    >
                      {length} questions &middot; {config.duration}
                    </span>
                  </div>
                  <p
                    className="font-sans text-xs mt-0.5"
                    style={{ color: "rgba(107,114,128,0.8)" }}
                  >
                    {config.sublabel} per trait
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Begin CTA */}
      <button
        onClick={() => onBegin(selected)}
        className="w-full flex items-center justify-center gap-2 font-sans text-sm font-semibold rounded-xl transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
        style={{ height: 52, background: "#0D9488", color: "#FFFFFF" }}
      >
        Begin assessment
        <ArrowRight size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
