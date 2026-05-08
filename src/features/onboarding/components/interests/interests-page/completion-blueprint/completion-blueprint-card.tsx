import { motion } from "framer-motion";
import { Fingerprint } from "lucide-react";

import type { PersonalityType } from "@/shared/schemas/enums";

import { completionFadeUp } from "./completion-blueprint-motion";

interface CompletionBlueprintCardProps {
  personalityType: PersonalityType | null;
  nickname: string;
  interestCount: number;
}

export function CompletionBlueprintCard({
  personalityType,
  nickname,
  interestCount,
}: CompletionBlueprintCardProps) {
  return (
    <motion.div
      variants={completionFadeUp}
      className="perspective-1000 relative w-full"
    >
      <div className="relative flex w-full flex-col overflow-hidden rounded-xl border border-border/85 bg-card/70 shadow-[0_28px_90px_rgba(0,0,0,0.42)] backdrop-blur-lg">
        <div className="absolute top-[55%] right-4 left-4 h-px border-border/90 border-t border-dashed" />
        <div className="absolute top-[55%] -left-3 h-6 w-6 -translate-y-1/2 rounded-full border border-border/85 bg-hero-bg/30" />
        <div className="absolute top-[55%] -right-3 h-6 w-6 -translate-y-1/2 rounded-full border border-border/85 bg-hero-bg/30" />

        <div className="flex flex-col gap-1 p-8 pb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-bold font-sans text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
              Your profile
            </span>
            <Fingerprint
              size={16}
              className="text-spark-amber"
              aria-hidden="true"
            />
          </div>
          <h2 className="font-black font-sans text-5xl text-foreground tracking-tight">
            {personalityType || "????"}
          </h2>
          <p className="font-medium font-sans text-lg text-spark-amber">
            {nickname}
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-8 p-8 pt-10">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <p className="font-bold font-sans text-[9px] text-muted-foreground uppercase tracking-widest">
                Interests
              </p>
              <p className="font-bold font-sans text-2xl text-foreground">
                {interestCount}{" "}
                <span className="font-normal text-muted-foreground text-xs">
                  picks
                </span>
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-bold font-sans text-[9px] text-muted-foreground uppercase tracking-widest">
                Status
              </p>
              <div className="flex items-center gap-1.5 pt-1">
                <div className="h-1.5 w-1.5 rounded-full bg-forge-teal shadow-[0_0_8px_rgba(13,148,136,0.45)]" />
                <p className="font-bold font-sans text-foreground text-xs">
                  Ready to enter
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.03]" />
      </div>
    </motion.div>
  );
}
