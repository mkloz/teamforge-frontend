import { domAnimation, LazyMotion, m } from "framer-motion";
import { useRef } from "react";
import { PERSONALITY_INFO_BY_TYPE } from "@/features/onboarding/data/personality-metadata";

import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import type { PersonalityType } from "@/shared/schemas/enums";

import { CompletionBlueprintAction } from "./completion-blueprint-action";
import { CompletionBlueprintBackground } from "./completion-blueprint-background";
import { CompletionBlueprintCard } from "./completion-blueprint-card";
import { CompletionBlueprintHeader } from "./completion-blueprint-header";
import { completionStagger } from "./completion-blueprint-motion";

interface CompletionBlueprintProps {
  personalityType: PersonalityType | null;
  interestCount: number;
  onEnter: () => void;
}

export function CompletionBlueprint({
  personalityType,
  interestCount,
  onEnter,
}: CompletionBlueprintProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const nickname = personalityType
    ? PERSONALITY_INFO_BY_TYPE[personalityType]?.name
    : "The Forge Explorer";

  return (
    <LazyMotion features={domAnimation}>
      <Dialog open>
        <DialogContent
          ref={dialogRef}
          aria-describedby={undefined}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            dialogRef.current?.focus();
          }}
          overlayClassName="bg-hero-bg"
          tabIndex={-1}
          className="dark top-0 left-0 z-100 flex h-dvh max-h-none w-screen max-w-none translate-x-0 translate-y-0 items-center justify-center overflow-y-auto rounded-none border-0 bg-hero-bg p-0 text-foreground shadow-none [&>button]:hidden"
        >
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex min-h-full w-full flex-col items-center justify-center overflow-hidden px-6 py-8"
          >
            <CompletionBlueprintBackground />

            <m.div
              variants={completionStagger}
              initial="initial"
              animate="animate"
              className="relative z-10 flex w-full max-w-md flex-col items-center"
            >
              <CompletionBlueprintHeader />
              <CompletionBlueprintCard
                personalityType={personalityType}
                nickname={nickname}
                interestCount={interestCount}
              />
              <CompletionBlueprintAction onEnter={onEnter} />
            </m.div>
          </m.div>
        </DialogContent>
      </Dialog>
    </LazyMotion>
  );
}
