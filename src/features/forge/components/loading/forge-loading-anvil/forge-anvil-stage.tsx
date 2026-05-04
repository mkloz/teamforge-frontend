import { memo, useId } from "react";

import { AnvilAmbientEffects } from "./anvil-ambient-effects";
import { AnvilBase } from "./anvil-base";
import { AnvilDefs } from "./anvil-defs";
import { AnvilHammer } from "./anvil-hammer";
import { AnvilSparks } from "./anvil-sparks";

interface ForgeAnvilStageProps {
  size: number;
}

export const ForgeAnvilStage = memo(function ForgeAnvilStage({
  size,
}: ForgeAnvilStageProps) {
  const gradientId = useId().replace(/:/g, "");
  const anvilGradientId = `${gradientId}-anvil`;
  const hammerGradientId = `${gradientId}-hammer`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 220 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="h-full w-full overflow-visible"
      >
        <AnvilDefs
          anvilGradientId={anvilGradientId}
          hammerGradientId={hammerGradientId}
        />
        <AnvilAmbientEffects />
        <AnvilBase anvilGradientId={anvilGradientId} />
        <AnvilSparks />
        <AnvilHammer hammerGradientId={hammerGradientId} />
      </svg>
    </div>
  );
});
