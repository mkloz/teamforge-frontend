import { LoadingAmbientEffects } from "./loading-ambient-effects";
import { LoadingBaseShape } from "./loading-base-shape";
import { LoadingMovingShape } from "./loading-moving-shape";
import { LoadingParticles } from "./loading-particles";

interface PlanLoadingStageProps {
  size: number;
}

const LOADING_MARK_STAGE_VIEW_BOX = "32 32 156 142";
const LOADING_MARK_STAGE_ASPECT_RATIO = 142 / 156;

export function PlanLoadingStage({ size }: PlanLoadingStageProps) {
  return (
    <div
      className="relative"
      style={{ width: size, height: size * LOADING_MARK_STAGE_ASPECT_RATIO }}
    >
      <svg
        viewBox={LOADING_MARK_STAGE_VIEW_BOX}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="size-full overflow-visible"
      >
        <LoadingAmbientEffects />
        <LoadingBaseShape />
        <LoadingParticles />
        <LoadingMovingShape />
      </svg>
    </div>
  );
}
