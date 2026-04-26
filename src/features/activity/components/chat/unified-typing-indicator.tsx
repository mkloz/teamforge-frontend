import { memo } from "react";
import { cn } from "@/shared/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { formatTypingText } from "../../lib/chat-utils";

interface TypingUser {
  fullName: string;
  avatar: string;
}

interface UnifiedTypingIndicatorProps {
  users?: TypingUser[];
  variant?: "inline" | "floating" | "minimal";
  className?: string;
  isGroup?: boolean;
}

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
  if (variant !== "minimal" && users.length === 0) return null;

  const text = formatTypingText(users, isGroup) || "";

  if (variant === "minimal") {
    return <TypingDots dotSize="w-1 h-1" className={className} />;
  }

  if (variant === "floating") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none"
      >
        <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-canvas/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-border/40">
          <div className="flex -space-x-2">
            <AnimatePresence mode="popLayout">
              {users.slice(0, 3).map((user) => (
                <motion.img
                  key={user.fullName}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-5.5 h-5.5 rounded-full object-cover ring-2 ring-canvas shadow-sm"
                />
              ))}
            </AnimatePresence>
          </div>

          <TypingDots />

          <span className="text-micro text-slate-muted font-semibold tracking-tight pr-1">
            {text.toUpperCase()}
          </span>
        </div>
      </motion.div>
    );
  }

  // Inline variant (composites into the vertical message flow)
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-end gap-2.5 px-3 mb-4 group/typing"
    >
      <motion.img
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        src={users[0]?.avatar}
        alt={users[0]?.fullName}
        className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-border/20 shadow-sm"
      />
      <div
        className={cn(
          "bg-card border border-border/60 px-4 py-3 rounded-xl rounded-bl-none shadow-xs relative",
          "after:content-[''] after:absolute after:-left-1.5 after:bottom-0 after:w-1.75 after:h-2 after:bg-card after:[clip-path:polygon(100%_0,0_100%,100%_100%)]",
          "before:content-[''] before:absolute before:-left-2 before:-bottom-px before:w-2.5 before:h-3 before:bg-border before:[clip-path:polygon(100%_0,0_100%,100%_100%)] before:-z-10",
        )}
      >
        <TypingDots dotSize="w-1.5 h-1.5" />
      </div>
    </motion.div>
  );
});

function TypingDots({
  className,
  dotSize = "w-1 h-1",
}: {
  className?: string;
  dotSize?: string;
}) {
  return (
    <div className={cn("flex gap-1 items-end justify-start", className)}>
      {[0, 1, 2].map((i) => (
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
          className={cn("rounded-full bg-forge-teal mb-0.5", dotSize)}
        />
      ))}
    </div>
  );
}
