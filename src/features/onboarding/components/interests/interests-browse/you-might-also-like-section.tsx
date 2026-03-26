import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { LeafTag } from "../../../data/interests-types";
import { TagPill } from "./tag-pill";

export function YouMightAlsoLikeSection({
  tags,
  selectedIds,
  isAtMax,
  onToggle,
  onReject,
}: {
  tags: LeafTag[];
  selectedIds: Set<string>;
  isAtMax: boolean;
  onToggle: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="mb-4 rounded-2xl border border-forge-teal/20  overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 group text-left"
      >
        <div className="w-5 h-5 rounded-md bg-forge-teal/15 flex items-center justify-center shrink-0">
          <span className="text-[11px] leading-none">✨</span>
        </div>
        <span className="font-sans text-[11px] font-semibold text-forge-teal uppercase tracking-wider">
          You might also like
        </span>
        <div className="flex items-center gap-1.5 ml-1">
          <span className="w-1 h-1 rounded-full bg-forge-teal/40" />
          <span className="font-sans text-[10px] font-bold text-forge-teal/60">
            {tags.length}
          </span>
        </div>
        <motion.span
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.18 }}
          className="ml-auto text-forge-teal/40"
        >
          <ChevronDown size={13} strokeWidth={2} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5 px-4 pb-4">
              {tags.map((tag) => (
                <TagPill
                  key={tag.id}
                  label={tag.label}
                  selected={selectedIds.has(tag.id)}
                  disabled={isAtMax}
                  onToggle={() => onToggle(tag.id)}
                  onReject={() => onReject(tag.id)}
                  aliases={tag.aliases}
                  animated
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
