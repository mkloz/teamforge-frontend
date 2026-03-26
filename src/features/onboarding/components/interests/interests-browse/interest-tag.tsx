import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { LeafTag } from "../../../data/interests-types";

interface InterestTagProps {
  tag: LeafTag;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function InterestTag({
  tag,
  selected,
  onToggle,
  disabled = false,
  size = "md",
}: InterestTagProps) {
  return (
    <motion.button
      type="button"
      layout="position"
      onClick={disabled && !selected ? undefined : onToggle}
      whileTap={!disabled || selected ? { scale: 0.93 } : {}}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-sans font-medium transition-all duration-150 cursor-pointer select-none",
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
        selected
          ? "bg-forge-teal text-white shadow-[0_2px_8px_rgba(13,148,136,0.30)]"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200",
        disabled &&
          !selected &&
          "opacity-35 cursor-not-allowed pointer-events-none",
      )}
    >
      {selected && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <Check size={10} strokeWidth={3} />
        </motion.span>
      )}
      {tag.label}
    </motion.button>
  );
}
