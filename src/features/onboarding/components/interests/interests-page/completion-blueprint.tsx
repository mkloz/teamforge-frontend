import { Button } from "@/shared/components/ui/button";
import { VoronoiCatalyst } from "@/shared/components/visuals/voronoi-catalyst";
import { PERSONALITY_INFO_BY_TYPE } from "@/features/onboarding/data/personality-metadata";
import { motion } from "framer-motion";
import { ArrowRight, Database, Fingerprint } from "lucide-react";
import type { PersonalityType } from "@/shared/schemas/enums";

interface CompletionBlueprintProps {
  personalityType: PersonalityType | null;
  interestCount: number;
  onEnter: () => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export function CompletionBlueprint({
  personalityType,
  interestCount,
  onEnter,
}: CompletionBlueprintProps) {
  const nickname = personalityType
    ? PERSONALITY_INFO_BY_TYPE[personalityType]?.name
    : "The Forge Explorer";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden bg-ink"
    >
      {/* Immersive Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <VoronoiCatalyst progress={1} />
        </div>
        {/* Subtle Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_2px,3px_100%] pointer-events-none" />
      </div>

      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="relative z-10 w-full max-w-md px-6 flex flex-col items-center"
      >
        {/* Meta Header */}
        <motion.div variants={fadeUp} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-canvas/10 border border-canvas/30 text-canvas text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
            <Database size={12} aria-hidden="true" />
            Profile Created
          </div>
          <h1 className="font-sans text-4xl font-extrabold text-canvas tracking-tight leading-tight">
            Welcome to <span className="text-spark-amber">TeamForge</span>
          </h1>
        </motion.div>

        {/* The "Blueprint Ticket" Card */}
        <motion.div
          variants={fadeUp}
          className="relative w-full perspective-1000"
        >
          <div className="w-full bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col">
            {/* Ticket Notches */}
            <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-ink border border-white/10 -translate-y-1/2" />
            <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-ink border border-white/10 -translate-y-1/2" />

            {/* Top Section: Personality Branding */}
            <div className="p-8 pb-4 flex flex-col gap-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-canvas/80">
                  Social Identity
                </span>
                <Fingerprint
                  size={16}
                  className="text-spark-amber"
                  aria-hidden="true"
                />
              </div>
              <h2 className="font-sans text-5xl font-black text-canvas tracking-tight">
                {personalityType || "????"}
              </h2>
              <p className="font-sans text-lg font-medium text-spark-amber">
                {nickname}
              </p>
            </div>

            {/* Dashed Separator */}
            <div className="px-4">
              <div className="w-full h-px border-t border-dashed border-white/10 my-4" />
            </div>

            {/* Middle Section: Metrics */}
            <div className="flex-1 p-8 pt-4 flex flex-col gap-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="font-sans text-[9px] font-bold uppercase tracking-widest text-canvas/80">
                    Interests Map
                  </p>
                  <p className="font-sans text-2xl font-bold text-canvas">
                    {interestCount}{" "}
                    <span className="text-xs font-normal text-canvas/80">
                      nodes
                    </span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-sans text-[9px] font-bold uppercase tracking-widest text-canvas/80">
                    Trust Rating
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-spark-amber shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                    <p className="font-sans text-xs font-bold text-canvas">
                      Pending Validation
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 bg-noise pointer-events-none opacity-[0.03]" />
          </div>
        </motion.div>

        {/* Action Section */}
        <motion.div
          variants={fadeUp}
          className="w-full mt-12 flex flex-col items-center"
        >
          <Button
            variant="primary"
            size="hero"
            className="w-full"
            onClick={onEnter}
          >
            Enter
            <ArrowRight
              size={20}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Button>

          <p className="mt-6 font-sans text-[10px] text-canvas/80 font-medium uppercase tracking-widest text-center max-w-50 leading-relaxed">
            Finding your people, intelligently.
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
