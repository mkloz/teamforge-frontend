import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";

export function TrustCard() {
  const circumference = 2 * Math.PI * 16;
  const score = 4.2;

  return (
    <motion.div
      initial={{ y: 0, rotate: 2 }}
      animate={{ y: [-10, 0], rotate: [1, 2] }}
      transition={{
        duration: 5,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      }}
      className={cn(
        "w-37.5 rounded-xl px-4 py-3.5",
        "border border-forge-teal/20 bg-[#0a1212]/80 backdrop-blur-xl",
        "shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]",
      )}
      aria-hidden="true"
    >
      <p className="mb-2.5 font-sans text-nano font-semibold tracking-[0.15em] text-forge-teal uppercase opacity-90">
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
          <p className="font-sans text-nano leading-snug text-text-dark-muted">
            Verified
          </p>
          <p className="font-sans text-nano leading-snug font-semibold text-forge-teal-light">
            Reliable
          </p>
        </div>
      </div>
    </motion.div>
  );
}
