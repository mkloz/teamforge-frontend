import { domMax, LazyMotion, m } from "framer-motion";
import { Check, X } from "lucide-react";
import type { MouseEventHandler, ReactNode, Ref } from "react";
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

  return content;
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
  const showRejectAction = Boolean(onReject && !selected);
  const toggleAction = (
    <Button
      variant={viewState.variant}
      size="xs"
      asChild
      disabled={viewState.isToggleDisabled}
      className={cn(
        "h-auto max-w-full rounded-full px-1.5 py-0.75 text-xs sm:px-2 sm:py-1 [@media(pointer:coarse)]:min-h-11",
        showRejectAction && "[@media(pointer:coarse)]:pr-11",
        viewState.surfaceClass,
      )}
    >
      <TagPillInteractiveTarget
        animated={animated}
        motionProps={viewState.motionProps}
        onClick={onToggle}
        aria-pressed={selected}
        className="min-w-0 active:scale-100"
      >
        <TagPillBody
          selected={selected}
          slots={viewState.slots}
          label={label}
        />
      </TagPillInteractiveTarget>
    </Button>
  );

  return (
    <div
      className={cn(
        "relative inline-flex max-w-full items-center",
        showRejectAction && "[@media(pointer:coarse)]:min-h-11",
      )}
    >
      {viewState.hasAliases ? (
        <Tooltip>
          <TooltipTrigger asChild>{toggleAction}</TooltipTrigger>
          <TooltipContent side="top">{viewState.tooltipLabel}</TooltipContent>
        </Tooltip>
      ) : (
        toggleAction
      )}
      {showRejectAction && onReject ? (
        <RejectTagButton label={label} onReject={onReject} />
      ) : null}
    </div>
  );
}

interface TagPillInteractiveTargetProps {
  "aria-busy"?: boolean;
  "aria-disabled"?: boolean;
  "aria-pressed"?: boolean;
  "data-loading"?: boolean;
  animated: boolean;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  motionProps: TagPillViewState["motionProps"];
  onClick?: MouseEventHandler<HTMLButtonElement>;
  ref?: Ref<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
}

function TagPillInteractiveTarget({
  "aria-busy": ariaBusy,
  "aria-disabled": ariaDisabled,
  "aria-pressed": ariaPressed,
  "data-loading": dataLoading,
  animated,
  children,
  className,
  disabled,
  motionProps,
  onClick,
  ref,
  type = "button",
}: TagPillInteractiveTargetProps) {
  const commonProps = {
    "aria-busy": ariaBusy,
    "aria-disabled": ariaDisabled,
    "aria-pressed": ariaPressed,
    "data-loading": dataLoading,
    className,
    disabled,
    onClick,
  };

  if (animated) {
    return (
      <LazyMotion features={domMax}>
        <m.button ref={ref} type={type} {...commonProps} {...motionProps}>
          {children}
        </m.button>
      </LazyMotion>
    );
  }

  return (
    <button ref={ref} type={type} {...commonProps}>
      {children}
    </button>
  );
}

interface TagPillBodyProps {
  label: string;
  selected: boolean;
  slots: TagPillSlots;
}

function TagPillBody({ label, selected, slots }: TagPillBodyProps) {
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
      />
    </div>
  );
}

function RejectTagButton({
  label,
  onReject,
}: {
  label: string;
  onReject: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={`Dismiss ${label}`}
      onClick={onReject}
      className="group/dismiss absolute top-1/2 right-0 z-10 size-3.5 -translate-y-1/2 rounded-full p-0 hover:bg-slate-muted/10 sm:size-4 [@media(pointer:coarse)]:size-11"
    >
      <X
        className="text-slate-muted/60 transition-colors group-hover/dismiss:text-slate-muted"
        strokeWidth={3}
      />
    </Button>
  );
}
