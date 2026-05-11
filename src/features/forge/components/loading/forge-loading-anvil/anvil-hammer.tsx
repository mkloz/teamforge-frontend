import {
  ANVIL_ANIMATION_DURATION,
  ANVIL_ANIMATION_TIMING,
} from "./forge-loading-anvil.constants";

export function AnvilHammer() {
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
      <g transform="translate(4 -9.5)">
        <rect
          x="112"
          y="91"
          width="52"
          height="7"
          rx="3.5"
          fill="var(--color-forge-deep-surface)"
          stroke="currentColor"
          strokeWidth="3.5"
        />
        <path
          d="M101 78h12c2.761 0 5 2.239 5 5v24c0 2.761-2.239 5-5 5h-12c-2.761 0-5-2.239-5-5V83c0-2.761 2.239-5 5-5Z"
          fill="var(--color-forge-teal)"
          stroke="currentColor"
          strokeWidth="3.5"
        />
        <path
          d="M103 83v24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="3"
        />
      </g>
    </g>
  );
}
