import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { useState } from "react";
import type { LeafTag, MbtiType } from "../../../data/interests-types";
import { TagPill } from "./tag-pill";

export function SuggestionsSection({
  mbtiType,
  suggestedTags,
  selectedIds,
  isAtMax,
  onToggle,
  onReject,
}: {
  mbtiType: MbtiType;
  suggestedTags: LeafTag[];
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
      className="mb-5 rounded-2xl border border-slate-200 bg-slate-50/60 overflow-hidden"
    >
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 group text-left"
      >
        <div className="w-5 h-5 rounded-md bg-amber-100 flex items-center justify-center shrink-0">
          <Sparkles size={11} className="text-amber-500" strokeWidth={2} />
        </div>
        <span className="font-sans text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
          Suggested for you
        </span>
        <div className="flex items-center gap-1.5 ml-1">
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="font-sans text-[10px] font-bold text-slate-400">
            {suggestedTags.length}
          </span>
        </div>

        {/* Right-side badges + chevron */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-white bg-amber-400 px-2.5 py-0.5 rounded-full leading-none">
            {mbtiType}
          </span>
          <motion.span
            animate={{ rotate: open ? 0 : -90 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="text-slate-400 group-hover:text-slate-600 transition-colors"
          >
            <ChevronDown size={14} strokeWidth={2} />
          </motion.span>
        </div>
      </button>

      {/* Collapsible body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <p className="font-sans text-[11px] text-slate-400 mb-3 leading-snug">
                Based on your personality – pick what resonates.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedTags.map((tag) => (
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
