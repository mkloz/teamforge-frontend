import { useEffect, useState } from "react";
import { ArrowRight, RefreshCcw, Info } from "lucide-react";
import type { OceanVectorWithMeta } from "../utils/score-calculator";
import { toDisplayPercent } from "../utils/score-calculator";
import type { PersonalityResult } from "../utils/type-translation";
import { OCEAN_LABELS } from "../data/type-descriptions";

const DIMS = ["O", "C", "E", "A", "N"] as const;

interface PersonalityResultsProps {
  result: PersonalityResult;
  vector: OceanVectorWithMeta;
  onContinue: () => void;
  onRetake: () => void;
}

function SpectrumBar({ dim, vector, revealed }: {
  dim: typeof DIMS[number];
  vector: OceanVectorWithMeta;
  revealed: boolean;
}) {
  const pct = toDisplayPercent(vector, dim);
  const labels = OCEAN_LABELS[dim];

  const levelLabel =
    pct >= 80 ? "Very High" :
    pct >= 60 ? "High" :
    pct >= 40 ? "Moderate" :
    pct >= 20 ? "Low" : "Very Low";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-sans text-xs font-semibold" style={{ color: "#1C1C1A" }}>
            {labels.label}
          </span>
          <span className="font-sans text-[10px]" style={{ color: "rgba(107,114,128,0.7)" }}>
            {labels.lowLabel} → {labels.highLabel}
          </span>
        </div>
        <span className="font-sans text-[10px] font-semibold" style={{ color: "#0D9488" }}>
          {levelLabel}
        </span>
      </div>
      <div className="relative w-full rounded-full overflow-hidden" style={{ height: 6, background: "rgba(107,114,128,0.1)" }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: revealed ? `${pct}%` : "0%",
            background: "linear-gradient(90deg, #0D9488, #14B8A6)",
          }}
        />
      </div>
    </div>
  );
}

export function PersonalityResults({ result, vector, onContinue, onRetake }: PersonalityResultsProps) {
  const [lettersVisible, setLettersVisible] = useState(false);
  const [barsRevealed, setBarsRevealed] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLettersVisible(true), 150);
    const t2 = setTimeout(() => setBarsRevealed(true), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const letters = result.type.split("");

  return (
    <div className="flex flex-col max-w-lg mx-auto w-full gap-0">
      {/* Overline */}
      <p
        className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] mb-5 text-center"
        style={{ color: "#0D9488" }}
      >
        Your Personality Type
      </p>

      {/* Type letter tiles */}
      <div className="flex justify-center gap-2 mb-5">
        {letters.map((letter, i) => (
          <div
            key={i}
            className="flex items-center justify-center rounded-2xl font-sans font-extrabold transition-all duration-500"
            style={{
              width: 64,
              height: 72,
              fontSize: 36,
              background: "#FFFFFF",
              border: "1.5px solid rgba(13,148,136,0.2)",
              color: "#0D9488",
              opacity: lettersVisible ? 1 : 0,
              transform: lettersVisible ? "translateY(0)" : "translateY(-12px)",
              transitionDelay: `${i * 80}ms`,
              boxShadow: "0 2px 12px rgba(13,148,136,0.1)",
            }}
          >
            {letter}
          </div>
        ))}
      </div>

      {/* Type name */}
      <div className="text-center mb-1">
        <h2
          className="font-sans text-xl font-bold"
          style={{ color: "#1C1C1A" }}
        >
          {result.info.name}
          <span className="font-normal" style={{ color: "#6B7280" }}>
            {" "}· {result.variant === "A" ? "Assertive" : "Turbulent"}
          </span>
        </h2>
      </div>
      <p
        className="font-sans text-sm text-center mb-6 text-pretty"
        style={{ color: "#6B7280" }}
      >
        {result.info.tagline}
      </p>

      {/* Description card */}
      <div
        className="rounded-2xl p-5 mb-5"
        style={{ background: "#FFFFFF", border: "1.5px solid rgba(107,114,128,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      >
        <p
          className="font-sans text-sm leading-relaxed mb-3 text-pretty"
          style={{ color: "#1C1C1A" }}
        >
          {result.info.about}
        </p>
        <p
          className="font-sans text-sm leading-relaxed text-pretty"
          style={{ color: "#6B7280" }}
        >
          {result.info.inGroups}
        </p>
      </div>

      {/* OCEAN bars */}
      <div
        className="rounded-2xl p-5 mb-5 flex flex-col gap-4"
        style={{ background: "#FFFFFF", border: "1.5px solid rgba(107,114,128,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      >
        <p className="font-sans text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#6B7280" }}>
          Your Five Traits
        </p>
        {DIMS.map((dim) => (
          <SpectrumBar key={dim} dim={dim} vector={vector} revealed={barsRevealed} />
        ))}
      </div>

      {/* Compatibility note */}
      <div
        className="flex items-start gap-2.5 rounded-xl p-3.5 mb-7"
        style={{ background: "rgba(107,114,128,0.06)" }}
      >
        <Info size={14} strokeWidth={2} style={{ color: "#6B7280", flexShrink: 0, marginTop: 1 }} />
        <p className="font-sans text-xs leading-relaxed" style={{ color: "#6B7280" }}>
          Your type is used to find people who complement your energy — not mirrors of yourself.
          The five trait scores power the matching algorithm, not the letter label.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3">
        <button
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 font-sans text-sm font-semibold rounded-xl transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
          style={{ height: 52, background: "#0D9488", color: "#FFFFFF" }}
        >
          Continue to interests
          <ArrowRight size={16} strokeWidth={2.5} />
        </button>
        <button
          onClick={onRetake}
          className="w-full flex items-center justify-center gap-2 font-sans text-sm font-semibold rounded-xl transition-all duration-150 hover:opacity-80"
          style={{ height: 52, background: "transparent", color: "#0D9488", border: "1.5px solid #0D9488" }}
        >
          <RefreshCcw size={15} strokeWidth={2.5} />
          Retake test
        </button>
      </div>

      <p
        className="font-sans text-[10px] text-center mt-3"
        style={{ color: "rgba(107,114,128,0.55)" }}
      >
        Retaking replaces your current results. Your first match may change as a result.
      </p>
    </div>
  );
}
