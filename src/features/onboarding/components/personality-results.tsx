import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Info, RefreshCcw } from "lucide-react";
import { popDownItem, resultsContainer } from "../constants/motion";
import { OCEAN_LABELS } from "../data/type-descriptions";
import type { OceanVectorWithMeta } from "../utils/score-calculator";
import { toDisplayPercent } from "../utils/score-calculator";
import type { PersonalityResult } from "../utils/type-translation";

const DIMS = ["O", "C", "E", "A", "N"] as const;

interface PersonalityResultsProps {
  result: PersonalityResult;
  vector: OceanVectorWithMeta;
  onContinue: () => void;
  onRetake: () => void;
}

function getLevelLabel(pct: number): string {
  if (pct >= 80) return "Very High";
  if (pct >= 60) return "High";
  if (pct >= 40) return "Moderate";
  if (pct >= 20) return "Low";
  return "Very Low";
}

function SpectrumBar({
  dim,
  vector,
  delay,
}: {
  dim: (typeof DIMS)[number];
  vector: OceanVectorWithMeta;
  delay: number;
}) {
  const pct = toDisplayPercent(vector, dim);
  const labels = OCEAN_LABELS[dim];
  const levelLabel = getLevelLabel(pct);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-sans text-xs font-semibold text-[#1C1C1A]">
            {labels.label}
          </span>
          <span className="font-sans text-[10px] text-slate-500/70">
            {labels.lowLabel} → {labels.highLabel}
          </span>
        </div>
        <span className="font-sans text-[10px] font-semibold text-forge-teal">
          {levelLabel}
        </span>
      </div>
      <div className="relative w-full rounded-full overflow-hidden h-1.5 bg-slate-500/10">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay }}
          className="absolute top-0 left-0 bottom-0 h-full rounded-full bg-linear-to-r from-forge-teal to-teal-500"
        />
      </div>
    </div>
  );
}

export function PersonalityResults({
  result,
  vector,
  onContinue,
  onRetake,
}: PersonalityResultsProps) {
  const letters = result.type.split("");

  return (
    <div className="flex flex-col max-w-lg mx-auto w-full gap-0">
      {/* Overline */}
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] mb-5 text-center text-forge-teal">
        Your Personality Type
      </p>

      {/* Type letter tiles */}
      <motion.div
        className="flex justify-center gap-2 mb-5"
        variants={resultsContainer}
        initial="hidden"
        animate="visible"
      >
        {letters.map((letter, i) => {
          const axisLabel = ["Energy", "Mind", "Nature", "Tactics"][i];
          return (
            <motion.div
              key={i}
              variants={popDownItem}
              className="flex flex-col items-center justify-center rounded-2xl w-17 h-20 bg-white border-[1.5px] border-forge-teal/20 shadow-[0_2px_14px_rgba(13,148,136,0.09)] gap-0"
            >
              {/* Letter */}
              <span className="font-sans font-extrabold leading-none text-[34px] text-forge-teal">
                {letter}
              </span>
              {/* Teal underline accent */}
              <div className="w-5 h-0.5 bg-forge-teal rounded-full opacity-40 mt-0.75 mb-1" />
              {/* Axis label */}
              <span className="font-sans font-medium leading-none text-[8px] text-slate-500/70 tracking-[0.04em]">
                {axisLabel}
              </span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Type name */}
      <div className="text-center mb-1">
        <h2 className="font-sans text-xl font-bold text-[#1C1C1A]">
          {result.info.name}
          <span className="font-normal text-slate-500">
            {" "}
            · {result.variant === "A" ? "Assertive" : "Turbulent"}
          </span>
        </h2>
      </div>
      <p className="font-sans text-sm text-center mb-6 text-pretty text-slate-500">
        {result.info.tagline}
      </p>

      {/* Description card */}
      <Card className="rounded-2xl p-5 mb-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] border-[1.5px] border-slate-500/10 bg-white">
        <p className="font-sans text-sm leading-relaxed mb-3 text-pretty text-[#1C1C1A]">
          {result.info.about}
        </p>
        <p className="font-sans text-sm leading-relaxed text-pretty text-slate-500">
          {result.info.inGroups}
        </p>
      </Card>

      {/* OCEAN bars */}
      <Card className="rounded-2xl p-5 mb-5 flex flex-col gap-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] border-[1.5px] border-slate-500/10 bg-white">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Your Five Traits
        </p>
        {DIMS.map((dim, i) => (
          <SpectrumBar
            key={dim}
            dim={dim}
            vector={vector}
            delay={0.6 + i * 0.15}
          />
        ))}
      </Card>

      {/* Compatibility note */}
      <div className="flex items-start gap-2.5 rounded-xl p-3.5 mb-7 bg-slate-500/5">
        <Info
          size={14}
          strokeWidth={2}
          className="text-slate-500 shrink-0 mt-px"
        />
        <p className="font-sans text-xs leading-relaxed text-slate-500">
          Your type is used to find people who complement your energy — not
          mirrors of yourself. The five trait scores power the matching
          algorithm, not the letter label.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3">
        <Button
          size="lg"
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 font-sans text-sm font-semibold rounded-xl bg-forge-teal text-primary-foreground hover:bg-forge-teal-light transition duration-200 active:scale-[0.99] h-12"
        >
          Continue to interests
          <ArrowRight size={16} strokeWidth={2.5} />
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={onRetake}
          className="w-full flex items-center justify-center gap-2 font-sans text-sm font-semibold rounded-xl transition-colors duration-200 border-[#0D9488]/30 text-[#0D9488] hover:bg-[#0D9488]/5 bg-transparent h-12"
        >
          <RefreshCcw size={15} strokeWidth={2.5} />
          Retake test
        </Button>
        <Button
          variant="ghost"
          size="lg"
          asChild
          className="w-full flex items-center justify-center gap-2 font-sans text-sm font-semibold rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-500/10 transition-colors duration-200 h-12"
        >
          <a
            href={`https://www.16personalities.com/${result.type.toLowerCase()}-personality`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={15} strokeWidth={2.5} className="mr-1" />
            Learn more about {result.type}
          </a>
        </Button>
      </div>

      <p className="font-sans text-[10px] text-center mt-3 text-slate-500/55">
        Retaking replaces your current results. Your first match may change as a
        result.
      </p>
    </div>
  );
}
