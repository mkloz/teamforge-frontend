import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

import {
  getTagPillCheckStateClass,
  getTagPillViewState,
  type TagPillSlots,
  type TagPillViewState,
} from "./tag-pill-model";

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
  const viewState = getTagPillViewState({
    aliases,
    animated,
    disabled,
    selected,
    hasRejectAction: Boolean(onReject),
  });

  const content = (
    <TagPillContent
      animated={animated}
      label={label}
      selected={selected}
      viewState={viewState}
      onReject={onReject}
      onToggle={onToggle}
    />
  );

  if (!viewState.hasAliases) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="top">{viewState.tooltipLabel}</TooltipContent>
    </Tooltip>
  );
}

interface TagPillContentProps {
  animated: boolean;
  label: string;
  selected: boolean;
  viewState: TagPillViewState;
  onReject?: () => void;
  onToggle: () => void;
}

function TagPillContent({
  animated,
  label,
  selected,
  viewState,
  onReject,
  onToggle,
}: TagPillContentProps) {
  const TagWrapper = getTagPillWrapper(animated);

  return (
    <Button
      variant={viewState.variant}
      size="xs"
      asChild
      disabled={viewState.isToggleDisabled}
      className={cn(
        "h-auto max-w-full rounded-full px-1.5 py-0.75 text-micro sm:px-2 sm:py-1",
        viewState.surfaceClass,
      )}
    >
      <TagWrapper
        onClick={onToggle}
        {...viewState.motionProps}
        aria-pressed={selected}
        className="min-w-0 active:scale-100"
      >
        <TagPillBody
          label={label}
          onReject={onReject}
          selected={selected}
          slots={viewState.slots}
        />
      </TagWrapper>
    </Button>
  );
}

interface TagPillBodyProps {
  label: string;
  onReject?: () => void;
  selected: boolean;
  slots: TagPillSlots;
}

function TagPillBody({ label, onReject, selected, slots }: TagPillBodyProps) {
  return (
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
            getTagPillCheckStateClass(selected),
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
        {onReject && !selected && <RejectTagButton onReject={onReject} />}
      </div>
    </div>
  );
}

function RejectTagButton({ onReject }: { onReject: () => void }) {
  return (
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
  );
}

function getTagPillWrapper(animated: boolean) {
  return animated ? motion.button : "button";
}
