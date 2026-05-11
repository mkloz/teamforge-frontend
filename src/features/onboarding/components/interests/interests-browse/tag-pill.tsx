import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

import { getTagPillSlotClasses } from "./tag-pill-model";

interface TagPillProps {
  label: string;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
  onReject?: () => void;
  aliases?: string[];
  animated?: boolean;
}

export function TagPill({
  label,
  selected,
  disabled,
  onToggle,
  onReject,
  aliases,
  animated = false,
}: TagPillProps) {
  const TagWrapper = animated ? motion.button : "button";
  const slots = getTagPillSlotClasses({
    selected,
    hasRejectAction: Boolean(onReject),
  });

  const content = (
    <Button
      variant={selected ? "primary" : "outline"}
      size="xs"
      asChild
      disabled={disabled && !selected}
      className={cn(
        "h-auto max-w-full rounded-full px-1.5 py-0.75 text-micro sm:px-2 sm:py-1",
        !selected &&
          "border-border/40 bg-card text-slate-muted dark:border-white/10 dark:text-slate-300",
      )}
    >
      <TagWrapper
        onClick={onToggle}
        {...(animated
          ? {
              layout: true,
              transition: selected
                ? {
                    type: "spring",
                    stiffness: 700,
                    damping: 35,
                  }
                : { duration: 0 },
              whileTap: !disabled || selected ? { scale: 0.94 } : {},
            }
          : {})}
        aria-pressed={selected}
        className="min-w-0 active:scale-100"
      >
        <div className="flex min-w-0 items-center justify-center gap-0 sm:gap-0.5">
          <div
            className={cn(
              "relative flex h-3.5 items-center justify-center overflow-hidden transition-all duration-200 ease-out sm:h-4",
              slots.left,
            )}
          >
            <Check
              strokeWidth={3}
              aria-hidden="true"
              className={cn(
                "size-2.5 shrink-0 text-white transition duration-200 ease-out sm:size-3",
                selected
                  ? "translate-x-0 scale-100 opacity-100"
                  : "-translate-x-2 scale-50 opacity-0",
              )}
            />
          </div>

          <span className="flex min-h-3.5 min-w-0 max-w-33 items-center justify-center truncate text-center leading-tight sm:min-h-4 sm:max-w-none">
            {label}
          </span>

          <div
            className={cn(
              "flex h-3.5 items-center justify-center overflow-visible transition-all duration-200 ease-out sm:h-4",
              slots.right,
            )}
          >
            {onReject && !selected && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onReject();
                }}
                className="group/dismiss size-3.5 rounded-full p-0 hover:bg-slate-muted/10 sm:size-4"
              >
                <X
                  className="text-slate-muted/60 transition-colors group-hover/dismiss:text-slate-muted"
                  strokeWidth={3}
                />
              </Button>
            )}
          </div>
        </div>
      </TagWrapper>
    </Button>
  );

  if (!aliases?.length) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="top">{aliases.join(" · ")}</TooltipContent>
    </Tooltip>
  );
}
