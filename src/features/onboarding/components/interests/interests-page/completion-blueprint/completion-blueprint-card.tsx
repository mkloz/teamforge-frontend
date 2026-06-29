import { m } from "framer-motion";
import { Fingerprint } from "lucide-react";
import { StatusPill } from "@/shared/components/ui/status-pill";

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
    <m.div
      variants={completionFadeUp}
      className="perspective-1000 relative w-full"
    >
      <div className="relative flex w-full flex-col overflow-hidden rounded-xl border border-border/85 bg-card/70 shadow-2xl backdrop-blur-lg">
        <div className="absolute top-1/2 right-4 left-4 h-px border-border/90 border-t border-dashed" />
        <div className="absolute top-1/2 -left-3 size-6 -translate-y-1/2 rounded-full border border-border/85 bg-hero-bg/30" />
        <div className="absolute top-1/2 -right-3 size-6 -translate-y-1/2 rounded-full border border-border/85 bg-hero-bg/30" />

        <div className="flex flex-col gap-1 p-8 pb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-bold font-sans text-muted-foreground text-xs">
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
              <p className="font-bold font-sans text-muted-foreground text-nano">
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
              <p className="font-bold font-sans text-muted-foreground text-nano">
                Status
              </p>
              <StatusPill
                size="sm"
                tone="teal"
                className="mt-1 w-fit border-0 bg-transparent px-0 py-0 text-foreground"
              >
                <span
                  className="size-1.5 rounded-full bg-forge-teal shadow-teal-glow"
                  aria-hidden="true"
                />
                Ready to enter
              </StatusPill>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,color-mix(in_srgb,var(--color-ink)_22%,transparent)_1px,transparent_0)] bg-size-[14px_14px] opacity-5" />
      </div>
    </m.div>
  );
}
