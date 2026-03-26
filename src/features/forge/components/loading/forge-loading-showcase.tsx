"use client";

/**
 * ForgeLoadingShowcase — preview for the Anvil Strike loading animation.
 */

import { ForgeLoadingAnvil } from "./forge-loading-anvil";

interface ForgeLoadingShowcaseProps {
  className?: string;
}

export function ForgeLoadingShowcase({ className }: ForgeLoadingShowcaseProps) {
  return (
    <div className={className}>
      <div className="space-y-1 mb-6">
        <h2 className="text-xl font-black text-foreground tracking-tight">
          Loading Animation
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Anvil Strike — displayed during the Phase 1 to Phase 2 transition.
          The animation runs indefinitely until the algorithm resolves.
        </p>
      </div>

      <div className="bg-card border border-border/40 rounded-2xl p-10 flex items-center justify-center">
        <ForgeLoadingAnvil />
      </div>
    </div>
  );
}
