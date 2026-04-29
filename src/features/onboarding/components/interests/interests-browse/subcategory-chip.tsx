import { cn } from "@/shared/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { type LucideIcon, ChevronRight } from "lucide-react";

const subcategoryChipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold font-sans transition duration-150 select-none leading-none border",
  {
    variants: {
      state: {
        collapsed:
          "bg-card border-slate-muted/15 dark:border-white/10 text-slate-muted dark:text-slate-300 hover:border-slate-muted/30 dark:hover:border-white/18 hover:bg-canvas dark:hover:bg-white/5",
        expanded: "bg-forge-teal/10 border-forge-teal/30 text-forge-teal",
      },
    },
    defaultVariants: {
      state: "collapsed",
    },
  },
);

const badgeVariants = cva(
  "shrink-0 flex items-center justify-center min-w-[1.125rem] h-4.5 px-1 text-[10px] font-bold rounded-full leading-none",
  {
    variants: {
      state: {
        collapsed: "bg-slate-muted/15 text-slate-muted",
        expanded: "bg-forge-teal text-white shadow-sm",
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
  icon: LucideIcon;
  label: string;
  selectedCount: number;
  expanded: boolean;
  onToggle: () => void;
}

export function SubcategoryChip({
  icon: Icon,
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
      <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
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
        <ChevronRight size={14} strokeWidth={2.5} />
      </motion.span>
    </motion.button>
  );
}
