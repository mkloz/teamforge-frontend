import { AnimatePresence, motion } from "framer-motion";
import { memo, type ReactNode } from "react";
import { formatTypingText } from "@/features/activity/lib/chat-utils";
import { Avatar } from "@/shared/components/common/avatar";
import { cn } from "@/shared/lib/utils";

interface TypingUser {
  name: string;
  avatar: string | null;
}

interface UnifiedTypingIndicatorProps {
  users?: TypingUser[];
  variant?: "inline" | "floating" | "minimal";
  className?: string;
  isGroup?: boolean;
}

type TypingIndicatorVariant = NonNullable<
  UnifiedTypingIndicatorProps["variant"]
>;

interface TypingIndicatorRenderProps {
  className?: string;
  text: string;
  users: TypingUser[];
}

const TYPING_DOT_INDICES = [0, 1, 2] as const;
const TYPING_INDICATOR_RENDERERS = {
  floating: renderFloatingTypingIndicator,
  inline: renderInlineTypingIndicator,
  minimal: renderMinimalTypingIndicator,
} as const satisfies Record<
  TypingIndicatorVariant,
  (props: TypingIndicatorRenderProps) => ReactNode
>;

/**
 * UnifiedTypingIndicator - Renders an organic typing animation with user avatar(s).
 * Supports inline, floating, and minimal (dots only) variants.
 */
export const UnifiedTypingIndicator = memo(function UnifiedTypingIndicator({
  users = [],
  variant = "inline",
  className,
  isGroup = true, // Default to true if not specified
}: UnifiedTypingIndicatorProps) {
  if (!shouldRenderTypingIndicator(variant, users)) return null;

  const text = formatTypingText(users, isGroup) || "";

  return TYPING_INDICATOR_RENDERERS[variant]({ className, text, users });
});

function shouldRenderTypingIndicator(
  variant: NonNullable<UnifiedTypingIndicatorProps["variant"]>,
  users: TypingUser[],
) {
  return variant === "minimal" || users.length > 0;
}

function renderMinimalTypingIndicator({
  className,
}: TypingIndicatorRenderProps) {
  return <TypingDots dotSize="size-1" className={className} />;
}

function renderFloatingTypingIndicator({
  text,
  users,
}: TypingIndicatorRenderProps) {
  return <FloatingTypingIndicator text={text} users={users} />;
}

function renderInlineTypingIndicator({ users }: TypingIndicatorRenderProps) {
  // Inline variant composites into the vertical message flow.
  return <InlineTypingIndicator users={users} />;
}

function FloatingTypingIndicator({
  text,
  users,
}: {
  text: string;
  users: TypingUser[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 350 }}
      className="pointer-events-none absolute right-4 bottom-4 left-4 z-20"
    >
      <div className="inline-flex items-center gap-3 rounded-full border border-border/40 bg-canvas/80 px-4 py-2.5 shadow-lg backdrop-blur-xl">
        <TypingAvatarStack users={users} />

        <TypingDots />

        <span className="pr-1 font-semibold text-micro text-slate-muted tracking-tight">
          {text.toUpperCase()}
        </span>
      </div>
    </motion.div>
  );
}

function TypingAvatarStack({ users }: { users: TypingUser[] }) {
  return (
    <div className="flex">
      <AnimatePresence mode="popLayout">
        {users.slice(0, 3).map((user, index) => (
          <motion.div
            key={user.name}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className={index > 0 ? "-ml-2" : undefined}
          >
            <Avatar
              src={user.avatar}
              name={user.name}
              className="size-5.5 shadow-sm ring-2 ring-canvas"
              fallbackClassName="text-nano"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function InlineTypingIndicator({ users }: { users: TypingUser[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="group/typing mb-4 flex items-end gap-2.5 px-3"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="shrink-0"
      >
        <Avatar
          src={users[0]?.avatar}
          name={users[0]?.name}
          className="size-8 shadow-sm ring-1 ring-border/20"
        />
      </motion.div>
      <div
        className={cn(
          "relative rounded-xl rounded-bl-none border border-border/60 bg-card px-4 py-3 shadow-xs",
        )}
      >
        <span
          aria-hidden="true"
          className="absolute -bottom-px -left-2 size-3 rounded-bl-xl border-border border-b border-l bg-inherit"
        />
        <TypingDots dotSize="size-1.5" />
      </div>
    </motion.div>
  );
}

function TypingDots({
  className,
  dotSize = "size-1",
}: {
  className?: string;
  dotSize?: string;
}) {
  return (
    <div className={cn("flex items-end justify-start gap-1", className)}>
      {TYPING_DOT_INDICES.map((i) => (
        <motion.span
          key={i}
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
          className={cn("mb-0.5 rounded-full bg-primary", dotSize)}
        />
      ))}
    </div>
  );
}
