import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m,
  useReducedMotion,
} from "framer-motion";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";

export interface ReactionGroup {
  emoji: string;
  count: number;
  isActive?: boolean;
}

type CountDirection = -1 | 1;

interface ReactionCountMotionState {
  direction: CountDirection;
  reducedMotion: boolean;
}

const REACTION_COUNT_VARIANTS = {
  enter: ({ direction, reducedMotion }: ReactionCountMotionState) => ({
    opacity: 0,
    scale: reducedMotion ? 1 : 0.96,
    y: reducedMotion ? 0 : direction > 0 ? "65%" : "-65%",
  }),
  center: {
    opacity: 1,
    scale: 1,
    y: "0%",
  },
  exit: ({ direction, reducedMotion }: ReactionCountMotionState) => ({
    opacity: 0,
    scale: reducedMotion ? 1 : 0.96,
    y: reducedMotion ? 0 : direction > 0 ? "-65%" : "65%",
  }),
};

interface MessageReactionsProps {
  reactions?: ReactionGroup[];
  isOwn?: boolean;
  className?: string;
  onToggleReaction?: (emoji: string) => void;
}

export function MessageReactions({
  reactions,
  isOwn,
  className,
  onToggleReaction,
}: MessageReactionsProps) {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div
      className={cn(
        "zoom-in-95 fade-in flex animate-in flex-wrap items-center gap-0.5 duration-500",
        isOwn ? "justify-end" : "justify-start",
        className,
      )}
    >
      {reactions.map((reaction) => {
        const hasVisibleCount = reaction.count > 1;

        return (
          <button
            type="button"
            key={reaction.emoji}
            aria-label={getReactionAriaLabel(reaction)}
            aria-pressed={Boolean(reaction.isActive)}
            className={cn(
              "flex h-11 min-w-11 items-center justify-center rounded-full bg-transparent p-0 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 active:scale-95 [@media(pointer:fine)]:h-5",
              hasVisibleCount
                ? "[@media(pointer:fine)]:w-auto [@media(pointer:fine)]:min-w-7"
                : "[@media(pointer:fine)]:size-5 [@media(pointer:fine)]:min-w-5",
            )}
            onClick={() => onToggleReaction?.(reaction.emoji)}
          >
            <span
              aria-hidden="true"
              className={cn(
                "inline-flex h-5 items-center justify-center rounded-full border font-bold text-xs leading-none transition-all",
                hasVisibleCount ? "min-w-7 gap-0.5 px-1" : "size-5",
                getReactionButtonTone({
                  isOwn,
                  isActive: reaction.isActive,
                }),
              )}
            >
              <span
                className={cn(
                  "grid place-items-center self-center text-xs leading-none",
                  hasVisibleCount ? "size-3.5" : "size-4",
                )}
              >
                {reaction.emoji}
              </span>
              <AnimatedReactionCount count={reaction.count} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

function getReactionAriaLabel(reaction: ReactionGroup) {
  const action = reaction.isActive ? "Remove" : "Add";
  const total = `${reaction.count} ${reaction.count === 1 ? "reaction" : "reactions"} total`;

  return `${action} ${reaction.emoji} reaction. ${total}.`;
}

function getReactionButtonTone({
  isActive,
  isOwn,
}: {
  isActive?: boolean;
  isOwn?: boolean;
}) {
  if (isOwn) {
    return isActive
      ? "border-accent/35 bg-accent/18 text-accent shadow-sm hover:enabled:bg-accent/22"
      : "border-white/10 bg-hero-bg/45 text-white shadow-sm hover:enabled:bg-hero-bg/55";
  }

  return isActive
    ? "border-primary/20 bg-primary/10 text-primary shadow-sm"
    : "border-transparent";
}

function AnimatedReactionCount({ count }: { count: number }) {
  const [lastAnimatedCount, setLastAnimatedCount] = useState<number | null>(
    null,
  );
  const previousCount = lastAnimatedCount ?? count;
  const prefersReducedMotion = useReducedMotion();
  const direction: CountDirection = count >= previousCount ? 1 : -1;
  const isCounterMounted = count > 1 || previousCount > 1;
  const motionState: ReactionCountMotionState = {
    direction,
    reducedMotion: Boolean(prefersReducedMotion),
  };

  function rememberAnimatedCount() {
    setLastAnimatedCount((current) => (current === count ? current : count));
  }

  return (
    <span
      className={cn(
        "relative inline-grid h-3.5 min-w-1.5 place-items-center self-center overflow-hidden tabular-nums leading-none transition-all duration-150",
        !isCounterMounted && "w-0 min-w-0",
      )}
    >
      <LazyMotion features={domAnimation}>
        <AnimatePresence
          custom={motionState}
          initial={false}
          mode="popLayout"
          onExitComplete={rememberAnimatedCount}
        >
          {count > 1 && (
            <m.span
              key={count}
              animate="center"
              className="col-start-1 row-start-1 flex h-full items-center justify-center leading-none opacity-95"
              custom={motionState}
              exit="exit"
              initial="enter"
              onAnimationComplete={rememberAnimatedCount}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              variants={REACTION_COUNT_VARIANTS}
            >
              {count}
            </m.span>
          )}
        </AnimatePresence>
      </LazyMotion>
    </span>
  );
}
