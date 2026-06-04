import {
  ANVIL_ANIMATION_DURATION,
  ANVIL_ANIMATION_TIMING,
} from "./forge-loading-anvil.constants";

export function AnvilHammer() {
  return (
    <g>
      <path
        d="M 152 40 A 55 55 0 0 0 102 67"
        fill="none"
        stroke="var(--color-forge-teal)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="65"
        strokeDashoffset="65"
        opacity="0"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="65; 65; 0; -65; -65"
          keyTimes="0; 0.5; 0.53; 0.75; 1"
          dur={`${ANVIL_ANIMATION_DURATION}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0; 0; 0.6; 0; 0"
          keyTimes="0; 0.5; 0.53; 0.75; 1"
          dur={`${ANVIL_ANIMATION_DURATION}s`}
          repeatCount="indefinite"
        />
      </path>

      <path
        d="M 156 50 A 45 45 0 0 0 110 78"
        fill="none"
        stroke="var(--color-forge-teal)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="60"
        strokeDashoffset="60"
        opacity="0"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="60; 60; 0; -60; -60"
          keyTimes="0; 0.5; 0.53; 0.75; 1"
          dur={`${ANVIL_ANIMATION_DURATION}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0; 0; 0.4; 0; 0"
          keyTimes="0; 0.5; 0.53; 0.75; 1"
          dur={`${ANVIL_ANIMATION_DURATION}s`}
          repeatCount="indefinite"
        />
      </path>

      <path
        d="M 160 60 A 35 35 0 0 0 118 90"
        fill="none"
        stroke="var(--color-forge-teal)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="50"
        strokeDashoffset="50"
        opacity="0"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="50; 50; 0; -50; -50"
          keyTimes="0; 0.5; 0.53; 0.75; 1"
          dur={`${ANVIL_ANIMATION_DURATION}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0; 0; 0.25; 0; 0"
          keyTimes="0; 0.5; 0.53; 0.75; 1"
          dur={`${ANVIL_ANIMATION_DURATION}s`}
          repeatCount="indefinite"
        />
      </path>

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
            fill="transparent"
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
    </g>
  );
}
