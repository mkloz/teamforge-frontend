import { domAnimation, LazyMotion, m } from "framer-motion";
import { usePrefersReducedMotion as useReducedMotion } from "@/shared/hooks/use-prefers-reduced-motion";
import { CompletionBlueprintAction } from "./completion-blueprint-action";
import { CompletionBlueprintBackground } from "./completion-blueprint-background";
import { CompletionBlueprintCard } from "./completion-blueprint-card";
import { CompletionBlueprintHeader } from "./completion-blueprint-header";
import { completionStagger } from "./completion-blueprint-motion";

interface CompletionBlueprintProps {
  interestCount: number;
  onEnter: () => void;
  onBack: () => void;
}

export function CompletionBlueprint({
  interestCount,
  onEnter,
  onBack,
}: CompletionBlueprintProps) {
  const reduceMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
      <m.section
        aria-labelledby="starter-ready-title"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        className="dark relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-hero-bg px-4 py-10 pb-safe-bottom text-foreground sm:px-6"
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
            nickname="Starter profile"
            interestCount={interestCount}
          />
          <CompletionBlueprintAction onEnter={onEnter} onBack={onBack} />
        </m.div>
      </m.section>
    </LazyMotion>
  );
}
