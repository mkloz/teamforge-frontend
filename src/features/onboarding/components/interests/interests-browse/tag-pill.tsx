import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const tagPillVariants = cva(
  "relative inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-medium font-sans transition-colors duration-200 select-none leading-none border",
  {
    variants: {
      variant: {
        default:
          "bg-white border-slate-200 text-slate-600 hover:border-forge-teal/50 hover:text-forge-teal",
        selected:
          "bg-forge-teal border-forge-teal text-white shadow-[0_2px_6px_rgba(13,148,136,0.25)]",
        disabled:
          "opacity-30 cursor-not-allowed pointer-events-none bg-white border-slate-200 text-slate-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface TagPillProps extends VariantProps<typeof tagPillVariants> {
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

  const currentVariant = selected
    ? "selected"
    : disabled
      ? "disabled"
      : "default";

  const content = (
    <TagWrapper
      type="button"
      onClick={disabled && !selected ? undefined : onToggle}
      {...(animated
        ? {
            layout: true,
            whileTap: !disabled || selected ? { scale: 0.94 } : {},
          }
        : {})}
      aria-pressed={selected}
      className={cn(tagPillVariants({ variant: currentVariant }))}
    >
      <div className="flex items-center justify-center">
        {/* Left Indicator (Checkmark) */}
        <div
          className={cn(
            "relative flex items-center justify-start overflow-hidden h-4 transition-all duration-200 ease-out",
            selected ? "w-4" : "w-2",
          )}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 8 8"
            fill="none"
            className={cn(
              "text-white shrink-0 transition-all duration-200 ease-out",
              selected
                ? "opacity-100 scale-100 translate-x-0"
                : "opacity-0 scale-50 -translate-x-2",
            )}
          >
            <path
              d="M1.5 4l2 2L6.5 1.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <span className="shrink-0">{label}</span>

        {/* Right Action (Reject) */}
        <div
          className={cn(
            "flex items-center overflow-hidden h-4 transition-all duration-200 ease-out",
            selected ? "w-0" : onReject ? "w-5" : "w-2",
          )}
        >
          {onReject && !selected && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReject();
              }}
              className="ml-1 p-0.5 rounded-full hover:bg-slate-200 transition-colors group/dismiss"
            >
              <X
                size={10}
                className="text-slate-400 group-hover/dismiss:text-slate-600 transition-colors"
                strokeWidth={3}
              />
            </button>
          )}
        </div>
      </div>
    </TagWrapper>
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
