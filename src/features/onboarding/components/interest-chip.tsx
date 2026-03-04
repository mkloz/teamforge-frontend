import { motion } from "framer-motion";
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
      whileTap={isDisabled ? {} : { scale: 0.95 }}
      className={cn(
        "relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium font-sans transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/50 focus-visible:ring-offset-1",
        selected
          ? "bg-forge-teal text-white shadow-[0_2px_12px_rgba(13,148,136,0.3)] border border-forge-teal"
          : isDisabled
            ? "bg-white text-slate-300 border border-slate-200 cursor-not-allowed"
            : "bg-white text-slate-600 border border-slate-200 hover:border-forge-teal/40 hover:text-forge-teal hover:shadow-[0_2px_8px_rgba(13,148,136,0.1)] cursor-pointer",
      )}
    >
      {selected && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <Check size={12} strokeWidth={3} />
        </motion.span>
      )}
      <span className="leading-none">{item.label}</span>
    </motion.button>
  );
}
