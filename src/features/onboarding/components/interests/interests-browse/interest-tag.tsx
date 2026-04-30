import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { Interest } from "@/shared/schemas";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface InterestTagProps {
  tag: Interest;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function InterestTag({
  tag,
  selected,
  onToggle,
  disabled = false,
  size = "md",
}: InterestTagProps) {
  return (
    <Button
      variant={selected ? "primary" : "outline"}
      size={size === "sm" ? "xs" : "sm"}
      asChild
      disabled={disabled && !selected}
      className={cn(
        "rounded-full h-auto py-1.5 px-3",
        !selected &&
          "bg-slate-100 dark:bg-white/8 text-slate-muted dark:text-slate-300 border-none hover:bg-slate-200 dark:hover:bg-white/12",
      )}
    >
      <motion.button
        layout
        transition={
          selected
            ? { type: "spring", stiffness: 700, damping: 35 }
            : { duration: 0 }
        }
        onClick={onToggle}
        whileTap={!disabled || selected ? { scale: 0.93 } : {}}
        className="active:scale-100"
      >
        <div className="flex items-center justify-center">
          {/* Left Indicator (Checkmark) - Prevents text jumping */}
          <div
            className={cn(
              "relative flex items-center justify-start overflow-hidden h-4 duration-200 ease-out",
              selected ? "w-4" : "w-0",
            )}
          >
            <Check
              size={13}
              strokeWidth={3}
              className={cn(
                "shrink-0 transition duration-200 ease-out",
                selected
                  ? "opacity-100 scale-100 translate-x-0"
                  : "opacity-0 scale-50 -translate-x-2",
              )}
            />
          </div>

          <span className="shrink-0">{tag.name}</span>
        </div>
      </motion.button>
    </Button>
  );
}
