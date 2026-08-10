interface PlanLoadingMovingShapeProps {
  className?: string;
}

export function PlanLoadingMovingShape({
  className,
}: PlanLoadingMovingShapeProps) {
  return (
    <g className={className}>
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
          fill="var(--color-brand-teal)"
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
