import { ForgeOrbEyebrow, ForgeOrbPanel } from "./forge-orb-panel";

export function TrustCard() {
  const circumference = 2 * Math.PI * 16;
  const score = 4.2;

  return (
    <ForgeOrbPanel
      initial={{ y: 0, rotate: 2 }}
      animate={{ y: [-10, 0], rotate: [1, 2] }}
      transition={{
        duration: 5,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      }}
      className="w-37.5"
    >
      <ForgeOrbEyebrow className="mb-2.5">Trust Score</ForgeOrbEyebrow>
      <div className="flex items-center gap-2.5">
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="3"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="var(--color-forge-teal)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - score / 5)}
            transform="rotate(-90 20 20)"
          />
          <text
            x="20"
            y="20"
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize="9"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
          >
            {score}
          </text>
        </svg>
        <div>
          <p className="font-sans text-nano text-text-dark-muted leading-snug">
            Verified
          </p>
          <p className="font-sans font-semibold text-forge-teal text-nano leading-snug">
            Reliable
          </p>
        </div>
      </div>
    </ForgeOrbPanel>
  );
}
