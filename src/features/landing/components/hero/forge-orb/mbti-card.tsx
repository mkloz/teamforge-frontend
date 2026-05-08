import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";

export function MbtiCard() {
  return (
    <motion.div
      initial={{ y: 0, rotate: -2 }}
      animate={{ y: [-12, 0], rotate: [-1, -2] }}
      transition={{
        duration: 4,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      }}
      className={cn(
        "w-45 rounded-xl px-4 py-3.5",
        "border border-forge-teal/20 bg-[#0a1212]/80 backdrop-blur-xl",
        "shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]",
      )}
      aria-hidden="true"
    >
      <p className="mb-1.5 font-sans text-nano font-semibold tracking-[0.15em] text-forge-teal uppercase opacity-90">
        Personality
      </p>
      <p className="mb-2.5 font-sans text-2xl font-extrabold tracking-tight text-white">
        ENTJ
      </p>
      <div className="space-y-1.5">
        {[
          { label: "E", fill: 80, peer: "I" },
          { label: "N", fill: 55, peer: "S" },
          { label: "T", fill: 70, peer: "F" },
          { label: "J", fill: 65, peer: "P" },
        ].map(({ label, fill, peer }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2.5 font-sans text-nano font-bold text-forge-teal-light">
              {label}
            </span>
            <div className="h-0.75 flex-1 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-linear-to-r from-forge-teal to-forge-teal-light"
                style={{ width: `${fill}%` }}
              />
            </div>
            <span className="w-2.5 text-right font-sans text-nano text-text-dark-muted">
              {peer}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
