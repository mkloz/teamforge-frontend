import { motion } from "framer-motion";
import { fadeUpItem } from "../constants/motion";
import type { InterestCategory } from "../data/interests-data";
import { InterestChip } from "./interest-chip";

interface InterestCategorySectionProps {
  category: InterestCategory;
  selected: Set<string>;
  atMax: boolean;
  onToggle: (id: string) => void;
}

export function InterestCategorySection({
  category,
  selected,
  atMax,
  onToggle,
}: InterestCategorySectionProps) {
  const selectedCount = category.items.filter((i) => selected.has(i.id)).length;

  return (
    <motion.div variants={fadeUpItem} className="flex flex-col gap-3">
      {/* Category header */}
      <div className="flex items-center gap-2.5">
        <div
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${category.color}`}
          aria-hidden="true"
        />
        <div className="flex items-baseline gap-2 min-w-0">
          <h3 className="font-sans text-sm font-semibold text-[#1C1C1A] leading-none">
            {category.label}
          </h3>
          <span className="font-sans text-xs text-slate-400 leading-none truncate hidden sm:block">
            {category.description}
          </span>
        </div>
        {selectedCount > 0 && (
          <motion.span
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="ml-auto shrink-0 inline-flex items-center justify-center rounded-full bg-forge-teal/10 text-forge-teal font-sans text-[10px] font-semibold px-2 py-0.5 leading-none"
          >
            {selectedCount}
          </motion.span>
        )}
      </div>

      {/* Chips */}
      <div className="flex flex-wrap gap-2">
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
  );
}
