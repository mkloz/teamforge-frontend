import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { ChevronDown, Compass } from "lucide-react";
import { useState } from "react";
import type { Interest } from "@/shared/schemas";
import { Button } from "@/shared/components/ui/button";
import { TagPill } from "./tag-pill";

export function YouMightAlsoLikeSection({
  tags,
  selectedIds,
  isAtMax,
  onToggle,
  onReject,
}: {
  tags: Interest[];
  selectedIds: Set<string>;
  isAtMax: boolean;
  onToggle: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const hasSelected = tags.some((tag) => selectedIds.has(tag.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="mb-4 rounded-2xl border border-forge-teal/15 overflow-hidden p-0.5 group/section transition-colors duration-300 hover:border-forge-teal/30"
    >
      <Button
        type="button"
        variant="ghost"
        onClick={() => setOpen((v) => !v)}
        className="group h-auto w-full justify-start gap-2 rounded-[14px] px-4 py-3 text-left hover:bg-forge-teal/5"
      >
        <Compass className="size-3 text-forge-teal transition-transform duration-500 group-hover:rotate-45" />
        <span
          className={cn(
            "font-sans text-xs font-bold transition-colors uppercase tracking-wider",
            hasSelected ? "text-spark-amber" : "text-forge-teal",
          )}
        >
          You might also like
        </span>
        <div className="flex items-center gap-1.5 ml-1">
          <span className="w-1 h-1 rounded-full bg-forge-teal/30 group-hover:scale-150 transition-transform duration-300" />
          <span className="font-sans text-xs font-bold text-forge-teal/70 group-hover:text-forge-teal transition-colors">
            {tags.length}
          </span>
        </div>
        <motion.span
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.18 }}
          className="ml-auto text-forge-teal/30 group-hover:text-forge-teal/60 transition-colors"
        >
          <ChevronDown size={14} strokeWidth={2} />
        </motion.span>
      </Button>
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
          <div className="flex flex-wrap gap-1.5 px-4 pb-4 pt-2 p-1.5">
            {tags.map((tag) => (
              <TagPill
                key={tag.id}
                label={tag.name}
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
    </motion.div>
  );
}
