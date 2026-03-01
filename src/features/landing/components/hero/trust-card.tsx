import { cn } from "@/shared/lib/utils";

export function TrustCard() {
  const circumference = 2 * Math.PI * 16;
  const score = 4.2;

  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-3.5 w-37.5",
        "bg-[#0a1212]/80 backdrop-blur-xl border border-forge-teal/20",
        "shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]",
        "animate-float-card-c",
        "delay-[1300ms] [animation-delay:1300ms,1900ms]",
      )}
      aria-hidden="true"
    >
      <p className="text-forge-teal/60 text-[9px] font-semibold font-sans mb-2.5 uppercase tracking-[0.15em]">
        Trust Score
      </p>
      <div className="flex items-center gap-2.5">
        <svg width="40" height="40" viewBox="0 0 40 40">
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
            stroke="url(#heroTrustGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - score / 5)}
            transform="rotate(-90 20 20)"
          />
          <defs>
            <linearGradient
              id="heroTrustGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#0D9488" />
              <stop offset="100%" stopColor="#14B8A6" />
            </linearGradient>
          </defs>
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
          <p className="text-white/40 text-[9px] font-sans leading-snug">
            Verified
          </p>
          <p className="text-forge-teal-light text-[9px] font-semibold font-sans leading-snug">
            Reliable
          </p>
        </div>
      </div>
    </div>
  );
}
