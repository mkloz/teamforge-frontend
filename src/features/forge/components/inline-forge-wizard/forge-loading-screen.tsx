import { domAnimation, LazyMotion, m } from "framer-motion";

import { ForgeLoadingAnvil } from "@/features/forge/components/loading/forge-loading-anvil";
import { Progress } from "@/shared/components/ui/progress";

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

          <Progress
            aria-label="Forge progress"
            className="h-1.5 w-52 border border-border/60 bg-input"
            indicatorClassName="bg-forge-teal-readable"
            value={boundedProgress}
          />
        </m.div>
      </LazyMotion>
    </div>
  );
}
