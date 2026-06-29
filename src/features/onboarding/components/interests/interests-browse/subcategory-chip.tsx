import { cva, type VariantProps } from "class-variance-authority";
import { m } from "framer-motion";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { CountBadge } from "@/shared/components/ui/count-badge";
import { cn } from "@/shared/lib/utils";

const subcategoryChipVariants = cva(
  "inline-flex select-none items-center gap-1.5 rounded-full border px-3 py-1.5 font-bold font-sans text-xs leading-none transition duration-150",
  {
    variants: {
      state: {
        collapsed:
          "border-slate-muted/15 bg-card text-slate-muted hover:border-slate-muted/30 hover:bg-canvas dark:border-white/10 hover:dark:border-white/18 hover:dark:bg-white/5",
        expanded: "border-forge-teal/30 bg-forge-teal/10 text-forge-teal",
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
    <m.button
      type="button"
      onClick={onToggle}
      whileTap={{ scale: 0.94 }}
      className={cn(subcategoryChipVariants({ state: currentState }))}
    >
      <Icon className="size-3.5" strokeWidth={2.5} />
      <span>{label}</span>
      {selectedCount > 0 && (
        <CountBadge
          count={selectedCount}
          size="sm"
          tone={expanded ? "teal" : "muted"}
        />
      )}
      <m.span
        animate={{ rotate: expanded ? 90 : 0 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="opacity-60"
      >
        <ChevronRight size={14} strokeWidth={2.5} />
      </m.span>
    </m.button>
  );
}
