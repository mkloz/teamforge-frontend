import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { InterestItem } from "../data/interests-data";

interface InterestChipProps {
  item: InterestItem;
  selected: boolean;
  disabled: boolean;
  onToggle: (id: string) => void;
}

export function InterestChip({
  item,
  selected,
  disabled,
  onToggle,
}: InterestChipProps) {
  const isDisabled = disabled && !selected;

  return (
    <motion.button
      type="button"
      layout
      onClick={() => !isDisabled && onToggle(item.id)}
      aria-pressed={selected}
      aria-label={`${selected ? "Remove" : "Add"} ${item.label}`}
      whileTap={isDisabled ? {} : { scale: 0.94 }}
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium font-sans transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/50 focus-visible:ring-offset-1",
        selected
          ? "bg-forge-teal text-white shadow-[0_2px_12px_rgba(13,148,136,0.28)] border border-forge-teal"
          : isDisabled
            ? "bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed"
            : "bg-white text-slate-600 border border-slate-200 hover:border-forge-teal/50 hover:text-forge-teal hover:bg-forge-teal/[0.03] hover:shadow-[0_2px_8px_rgba(13,148,136,0.1)] cursor-pointer",
      )}
    >
      {/* Emoji prefix — hidden when selected (replaced by check) */}
      <AnimatePresence mode="popLayout" initial={false}>
        {selected ? (
          <motion.span
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="leading-none"
          >
            <Check size={11} strokeWidth={3} />
          </motion.span>
        ) : (
          <motion.span
            key="emoji"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="leading-none text-[13px]"
            aria-hidden="true"
          >
            {item.emoji}
          </motion.span>
        )}
      </AnimatePresence>

      <span className="leading-none">{item.label}</span>
    </motion.button>
  );
}
