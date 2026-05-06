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
      className="relative w-full perspective-1000"
    >
      <div className="relative flex w-full flex-col overflow-hidden rounded-3xl border border-border/85 bg-card/70 shadow-[0_28px_90px_rgba(0,0,0,0.42)] backdrop-blur-lg">
        <div className="absolute left-4 right-4 top-[55%] h-px border-t border-dashed border-border/90" />
        <div className="absolute top-[55%] -left-3 h-6 w-6 -translate-y-1/2 rounded-full border border-border/85 bg-hero-bg/30" />
        <div className="absolute top-[55%] -right-3 h-6 w-6 -translate-y-1/2 rounded-full border border-border/85 bg-hero-bg/30" />

        <div className="p-8 pb-4 flex flex-col gap-1">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Your profile
            </span>
            <Fingerprint
              size={16}
              className="text-spark-amber"
              aria-hidden="true"
            />
          </div>
          <h2 className="font-sans text-5xl font-black text-foreground tracking-tight">
            {personalityType || "????"}
          </h2>
          <p className="font-sans text-lg font-medium text-spark-amber">
            {nickname}
          </p>
        </div>

        <div className="flex-1 p-8 pt-10 flex flex-col gap-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <p className="font-sans text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                Interests
              </p>
              <p className="font-sans text-2xl font-bold text-foreground">
                {interestCount}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  picks
                </span>
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-sans text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                Status
              </p>
              <div className="flex items-center gap-1.5 pt-1">
                <div className="h-1.5 w-1.5 rounded-full bg-forge-teal shadow-[0_0_8px_rgba(13,148,136,0.45)]" />
                <p className="font-sans text-xs font-bold text-foreground">
                  Ready to enter
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-noise pointer-events-none opacity-[0.03]" />
      </div>
    </motion.div>
  );
}
