/**
 * InterestCategorySection — 3-level drill-down browser
 *
 * L1 Category header (collapsible)
 *   └─ L2 Subcategory tabs (horizontal pill row)
 *        └─ L3 Leaf tag chips (selection targets, fed to vector)
 */

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@/shared/lib/utils";
import type { Category } from "../data/interests-data";
import { InterestChip } from "./interest-chip";

interface Props {
  category: Category;
  selected: Set<string>;
  atMax: boolean;
  onToggle: (id: string) => void;
  defaultExpanded?: boolean;
}

export function InterestCategorySection({
  category,
  selected,
  atMax,
  onToggle,
  defaultExpanded = false,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [activeSubId, setActiveSubId] = useState<string>(
    category.subcategories[0]?.id ?? "",
  );

  const selectedCount = category.subcategories
    .flatMap((s) => s.tags)
    .filter((t) => selected.has(t.id)).length;

  const activeSub = category.subcategories.find((s) => s.id === activeSubId);

  return (
    <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white overflow-hidden">
      {/* L1 — Category header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[rgba(0,0,0,0.015)] transition-colors duration-150 focus-visible:outline-none"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", category.color)} aria-hidden="true" />
          <span className="font-sans font-semibold text-[15px] text-[#111110] leading-none">
            {category.label}
          </span>
          <span className="font-sans text-xs text-[#9CA3AF] leading-none truncate hidden sm:block">
            {category.description}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-3">
          <AnimatePresence>
            {selectedCount > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center justify-center rounded-full bg-[#0D9488] text-white font-sans text-[10px] font-bold px-1.5 py-0.5 leading-none min-w-[18px]"
              >
                {selectedCount}
              </motion.span>
            )}
          </AnimatePresence>
          <ChevronDown
            size={15}
            strokeWidth={2.2}
            className={cn(
              "text-[#9CA3AF] transition-transform duration-200",
              expanded ? "rotate-180" : "rotate-0",
            )}
          />
        </div>
      </button>

      {/* Expandable body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-[rgba(0,0,0,0.05)] px-5 pt-4 pb-5">
              {/* L2 — Subcategory tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {category.subcategories.map((sub) => {
                  const subCount = sub.tags.filter((t) => selected.has(t.id)).length;
                  const isActive = sub.id === activeSubId;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setActiveSubId(sub.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-sans text-[13px] font-medium transition-all duration-150 focus-visible:outline-none",
                        isActive
                          ? "bg-[#0D9488] border-[#0D9488] text-white shadow-sm"
                          : "bg-white border-[rgba(0,0,0,0.1)] text-[#374151] hover:border-[#0D9488]/50 hover:text-[#0D9488]",
                      )}
                    >
                      <span aria-hidden="true">{sub.emoji}</span>
                      <span>{sub.label}</span>
                      {subCount > 0 && (
                        <span
                          className={cn(
                            "text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none shrink-0",
                            isActive ? "bg-white/25 text-white" : "bg-[#0D9488]/12 text-[#0D9488]",
                          )}
                        >
                          {subCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* L3 — Leaf tag chips */}
              <AnimatePresence mode="wait">
                {activeSub && (
                  <motion.div
                    key={activeSub.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.14, ease: "easeOut" }}
                    className="flex flex-wrap gap-2"
                  >
                    {activeSub.tags.map((tag) => (
                      <InterestChip
                        key={tag.id}
                        id={tag.id}
                        label={tag.label}
                        selected={selected.has(tag.id)}
                        disabled={atMax && !selected.has(tag.id)}
                        onToggle={onToggle}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
