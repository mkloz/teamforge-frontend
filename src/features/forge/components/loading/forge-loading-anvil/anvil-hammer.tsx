import {
  ANVIL_ANIMATION_DURATION,
  ANVIL_ANIMATION_TIMING,
} from "./forge-loading-anvil.constants";

interface AnvilHammerProps {
  hammerGradientId: string;
}

export function AnvilHammer({ hammerGradientId }: AnvilHammerProps) {
  return (
    <g>
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 151 94.5; 55 151 94.5; 60 151 94.5; -3 151 94.5; 3 151 94.5; 0 151 94.5"
        keyTimes={ANVIL_ANIMATION_TIMING.join("; ")}
        dur={`${ANVIL_ANIMATION_DURATION}s`}
        repeatCount="indefinite"
      />
      <rect x="112" y="91" width="52" height="7" rx="3.5" fill="#8A5A16" />
      <rect
        x="96"
        y="78"
        width="22"
        height="34"
        rx="5"
        fill={`url(#${hammerGradientId})`}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1.5"
      />
      <path
        d="M102 80v30"
        stroke="rgba(255,255,255,0.22)"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </g>
  );
}
