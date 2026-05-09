import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const subcategoryChipVariants = cva(
  "inline-flex select-none items-center gap-1.5 rounded-full border px-3 py-1.5 font-bold font-sans text-xs leading-none transition duration-150",
  {
    variants: {
      state: {
        collapsed:
          "border-slate-muted/15 bg-card text-slate-muted hover:border-slate-muted/30 hover:bg-canvas dark:border-white/10 dark:text-slate-300 hover:dark:border-white/18 hover:dark:bg-white/5",
        expanded: "border-forge-teal/30 bg-forge-teal/10 text-forge-teal",
      },
    },
    defaultVariants: {
      state: "collapsed",
    },
  },
);

const badgeVariants = cva(
  "flex h-4.5 min-w-4.5 shrink-0 items-center justify-center rounded-full px-1 font-bold text-xs leading-none",
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

interface SubcategoryChipProps
  extends VariantProps<typeof subcategoryChipVariants> {
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
      <Icon className="size-3.5" strokeWidth={2.5} />
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
