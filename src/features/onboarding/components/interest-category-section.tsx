import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { fadeUpItem } from "../constants/motion";
import type { InterestCategory } from "../data/interests-data";
import { InterestChip } from "./interest-chip";

interface InterestCategorySectionProps {
  category: InterestCategory;
  selected: Set<string>;
  atMax: boolean;
  onToggle: (id: string) => void;
  /** Pre-expand the section (e.g. for suggested section) */
  defaultExpanded?: boolean;
}

export function InterestCategorySection({
  category,
  selected,
  atMax,
  onToggle,
  defaultExpanded = true,
}: InterestCategorySectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const selectedCount = category.items.filter((i) => selected.has(i.id)).length;

  return (
    <motion.div variants={fadeUpItem} className="flex flex-col gap-0">
      {/* Category header — clickable to collapse/expand */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-2.5 w-full text-left py-1 group focus-visible:outline-none"
        aria-expanded={expanded}
      >
        {/* Color dot */}
        <div
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${category.color}`}
          aria-hidden="true"
        />

        {/* Label + description */}
        <div className="flex items-baseline gap-2 min-w-0 flex-1">
          <h3 className="font-sans text-sm font-semibold text-[#1C1C1A] leading-none">
            {category.label}
          </h3>
          <span className="font-sans text-xs text-slate-400 leading-none truncate hidden sm:block">
            {category.description}
          </span>
        </div>

        {/* Selected count badge */}
        <AnimatePresence>
          {selectedCount > 0 && (
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="shrink-0 inline-flex items-center justify-center rounded-full bg-forge-teal text-white font-sans text-[10px] font-bold px-1.5 py-0.5 leading-none min-w-[18px]"
            >
              {selectedCount}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Chevron */}
        <ChevronDown
          size={14}
          strokeWidth={2.5}
          className={cn(
            "shrink-0 text-slate-400 transition-transform duration-200 group-hover:text-slate-600",
            expanded ? "rotate-0" : "-rotate-90",
          )}
        />
      </button>

      {/* Chips — animated collapse */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="chips"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 pt-3 pb-1">
              {category.items.map((item) => (
                <InterestChip
                  key={item.id}
                  item={item}
                  selected={selected.has(item.id)}
                  disabled={atMax}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
