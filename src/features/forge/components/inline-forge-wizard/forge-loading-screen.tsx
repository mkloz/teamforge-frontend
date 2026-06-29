import { domAnimation, LazyMotion, m } from "framer-motion";

import { ForgeLoadingAnvil } from "@/features/forge/components/loading/forge-loading-anvil";

interface ForgeLoadingScreenProps {
  progress: number;
  strikeCount: number;
}

export function ForgeLoadingScreen({
  progress,
  strikeCount,
}: ForgeLoadingScreenProps) {
  const boundedProgress = Math.min(100, Math.max(8, progress));

  return (
    <div className="relative flex size-full min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 text-foreground">
      <LazyMotion features={domAnimation}>
        <m.div
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="flex flex-col items-center gap-7"
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <ForgeLoadingAnvil size={190} strikeCount={strikeCount} />

          <progress
            aria-label="Forge progress"
            className="sr-only"
            max={100}
            value={Math.round(boundedProgress)}
          />
          <div
            aria-hidden="true"
            className="h-1.5 w-52 overflow-hidden rounded-full border border-border/60 bg-input"
          >
            <m.div
              animate={{ scaleX: boundedProgress / 100 }}
              className="h-full origin-left rounded-full bg-forge-teal-readable"
              initial={{ scaleX: 0.08 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </m.div>
      </LazyMotion>
    </div>
  );
}
