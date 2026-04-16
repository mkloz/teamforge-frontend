import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import { ChevronDown, Fingerprint, Zap } from "lucide-react";
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
      className="mb-5 rounded-2xl border border-slate-muted/10 bg-canvas overflow-hidden p-0.5"
    >
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 group text-left rounded-[14px]"
      >
        <Zap className="text-spark-amber fill-spark-amber size-3" />
        <span className="font-sans text-xs font-bold text-slate-muted uppercase tracking-wider group-hover:text-spark-amber transition-colors">
          Suggested for you
        </span>
        <div className="flex items-center gap-1.5 ml-1">
          <span className="w-1 h-1 rounded-full bg-slate-muted/30" />
          <span className="font-sans text-xs font-bold text-slate-muted/70">
            {suggestedTags.length}
          </span>
        </div>

        {/* Right-side badges + chevron */}
        <div className="ml-auto flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-spark-amber/10 border border-spark-amber/20 text-spark-amber shadow-none">
            <Fingerprint size={10} className="opacity-70" />
            <span className="font-sans text-[10px] font-extrabold uppercase tracking-wider leading-none">
              {mbtiType}
            </span>
          </div>
          <motion.span
            animate={{ rotate: open ? 0 : -90 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="text-slate-muted/50 group-hover:text-slate-muted transition-colors"
          >
            <ChevronDown size={14} strokeWidth={2} />
          </motion.span>
        </div>
      </button>

      {/* Collapsible body */}
      <div
        inert={!open}
        className={cn(
          "grid transition-[grid-template-rows,opacity,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0 invisible",
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1">
            <p className="font-sans text-xs font-medium text-slate-muted/70 mb-3 leading-snug">
              Based on your personality – pick what resonates.
            </p>
            <div className="flex flex-wrap gap-1.5 p-1.5">
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
        </div>
      </div>
    </motion.div>
  );
}
