import { cn } from "@/shared/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const subcategoryChipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold font-sans transition-all duration-150 select-none leading-none border",
  {
    variants: {
      state: {
        collapsed:
          "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100",
        expanded: "bg-forge-teal/10 border-forge-teal/30 text-forge-teal",
      },
    },
    defaultVariants: {
      state: "collapsed",
    },
  },
);

const badgeVariants = cva(
  "shrink-0 flex items-center justify-center min-w-[1.125rem] h-4.5 px-1 text-[9px] font-bold rounded-full leading-none",
  {
    variants: {
      state: {
        collapsed: "bg-slate-200 text-slate-600",
        expanded: "bg-forge-teal text-white",
      },
    },
    defaultVariants: {
      state: "collapsed",
    },
  },
);

interface SubcategoryChipProps extends VariantProps<
  typeof subcategoryChipVariants
> {
  emoji: string;
  label: string;
  selectedCount: number;
  expanded: boolean;
  onToggle: () => void;
}

export function SubcategoryChip({
  emoji,
  label,
  selectedCount,
  expanded,
  onToggle,
}: SubcategoryChipProps) {
  const currentState = expanded ? "expanded" : "collapsed";

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileTap={{ scale: 0.94 }}
      className={cn(subcategoryChipVariants({ state: currentState }))}
    >
      <span className="text-sm leading-none">{emoji}</span>
      <span>{label}</span>
      {selectedCount > 0 && (
        <span className={cn(badgeVariants({ state: currentState }))}>
          {selectedCount}
        </span>
      )}
      <motion.span
        animate={{ rotate: expanded ? 90 : 0 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="opacity-60"
      >
        <ChevronRight size={11} strokeWidth={2.5} />
      </motion.span>
    </motion.button>
  );
}
