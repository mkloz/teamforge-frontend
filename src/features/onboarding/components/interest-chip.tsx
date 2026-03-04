/**
 * InterestChip — renders a single L3 leaf tag as a toggleable pill.
 *
 * Emoji lives on the L2 subcategory tab, not here. Selected state
 * shows a checkmark icon to reinforce the selection clearly.
 */
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface InterestChipProps {
  id: string;
  label: string;
  selected: boolean;
  disabled: boolean;
  onToggle: (id: string) => void;
}

export function InterestChip({
  id,
  label,
  selected,
  disabled,
  onToggle,
}: InterestChipProps) {
  const isDisabled = disabled && !selected;

  return (
    <motion.button
      type="button"
      layout
      onClick={() => !isDisabled && onToggle(id)}
      aria-pressed={selected}
      aria-label={`${selected ? "Remove" : "Add"} ${label}`}
      whileTap={isDisabled ? {} : { scale: 0.94 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium font-sans transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]/50 focus-visible:ring-offset-1",
        selected
          ? "bg-[#0D9488] text-white shadow-[0_2px_10px_rgba(13,148,136,0.25)] border border-[#0D9488]"
          : isDisabled
            ? "bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed"
            : "bg-white text-slate-600 border border-slate-200 hover:border-[#0D9488]/50 hover:text-[#0D9488] hover:bg-[#0D9488]/[0.03] cursor-pointer",
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {selected && (
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
        )}
      </AnimatePresence>
      <span className="leading-none">{label}</span>
    </motion.button>
  );
}
