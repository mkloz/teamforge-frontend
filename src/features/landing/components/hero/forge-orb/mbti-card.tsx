import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";

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
        "rounded-2xl px-4 py-3.5 w-45",
        "bg-[#0a1212]/80 backdrop-blur-xl border border-forge-teal/20",
        "shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]",
      )}
      aria-hidden="true"
    >
      <p className="text-forge-teal text-nano font-semibold font-sans mb-1.5 uppercase tracking-[0.15em] opacity-90">
        Personality
      </p>
      <p className="text-white text-2xl font-extrabold font-sans tracking-tight mb-2.5">
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
            <span className="text-forge-teal-light text-nano font-bold font-sans w-2.5">
              {label}
            </span>
            <div className="flex-1 h-0.75 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-forge-teal to-forge-teal-light"
                style={{ width: `${fill}%` }}
              />
            </div>
            <span className="text-text-dark-muted text-nano font-sans w-2.5 text-right">
              {peer}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
