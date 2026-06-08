import { memo } from "react";

import { AnvilAmbientEffects } from "./anvil-ambient-effects";
import { AnvilBase } from "./anvil-base";
import { AnvilHammer } from "./anvil-hammer";
import { AnvilSparks } from "./anvil-sparks";

interface ForgeAnvilStageProps {
  size: number;
}

const ANVIL_STAGE_VIEW_BOX = "32 32 156 142";
const ANVIL_STAGE_ASPECT_RATIO = 142 / 156;

export const ForgeAnvilStage = memo(function ForgeAnvilStage({
  size,
}: ForgeAnvilStageProps) {
  return (
    <div
      className="relative"
      style={{ width: size, height: size * ANVIL_STAGE_ASPECT_RATIO }}
    >
      <svg
        viewBox={ANVIL_STAGE_VIEW_BOX}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="size-full overflow-visible"
      >
        <AnvilAmbientEffects />
        <AnvilBase />
        <AnvilSparks />
        <AnvilHammer />
      </svg>
    </div>
  );
});
