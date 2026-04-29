import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { X } from "lucide-react";

// Design system foundations
interface TagPillProps {
  label: string;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
  onReject?: () => void;
  aliases?: string[];
  animated?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

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

  const content = (
    <Button
      variant={selected ? "primary" : "outline"}
      size="xs"
      asChild
      disabled={disabled && !selected}
      className={cn(
        "rounded-full h-auto py-1.5 px-3",
        !selected &&
          "bg-card text-slate-muted dark:border-white/10 dark:bg-card dark:text-slate-300",
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
        className="active:scale-100" // Disable Button's built-in scale to let Framer handle it
      >
        <div className="flex items-center justify-center">
          {/* Left Indicator (Checkmark) */}
          <div
            className={cn(
              "relative flex items-center justify-start overflow-hidden h-4 duration-200 ease-out",
              selected ? "w-4" : "w-2",
            )}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 8 8"
              fill="none"
              className={cn(
                "text-white shrink-0 transition duration-200 ease-out",
                selected
                  ? "opacity-100 scale-100 translate-x-0"
                  : "opacity-0 scale-50 -translate-x-2",
              )}
            >
              <path
                d="M1.5 4l2 2L6.5 1.5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <span className="shrink-0">{label}</span>

          {/* Right Action (Reject) */}
          <div
            className={cn(
              "flex items-center justify-center overflow-visible h-6 duration-200 ease-out p-1 -m-1",
              selected ? "w-0" : onReject ? "w-7" : "w-1",
            )}
          >
            {onReject && !selected && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onReject();
                }}
                className="ml-1 p-0.5 rounded-full hover:bg-slate-muted/10 transition-colors group/dismiss"
              >
                <X
                  size={14}
                  className="text-slate-muted/60 group-hover/dismiss:text-slate-muted transition-colors"
                  strokeWidth={3}
                />
              </button>
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
      <TooltipContent side="top" className="font-sans text-xs">
        {aliases.join(" · ")}
      </TooltipContent>
    </Tooltip>
  );
}
