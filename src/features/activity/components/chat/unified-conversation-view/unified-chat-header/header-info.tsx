import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { memo } from "react";
import { UnifiedTypingIndicator } from "@/features/activity/components/chat/unified-typing-indicator";
import type { OnlineStatus } from "@/features/activity/lib/activity-contract";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface HeaderInfoProps {
  title: string;
  subtitle?: string;
  avatarUrl?: string | null;
  isGroup: boolean;
  secondaryAvatar?: string | null;
  onlineStatus?: OnlineStatus;
  isTyping?: boolean;
  typingText?: string;
  onToggle: () => void;
}

export const HeaderInfo = memo(
  ({
    title,
    subtitle,
    avatarUrl,
    isGroup,
    secondaryAvatar,
    onlineStatus,
    isTyping,
    typingText,
    onToggle,
  }: HeaderInfoProps) => (
    <Button
      type="button"
      variant="ghost"
      onClick={onToggle}
      className={cn(
        "group/header-info -m-1 h-auto min-w-0 flex-1 justify-start gap-3 rounded-lg p-1 text-left transition-all duration-300",
        "bg-transparent hover:bg-muted/30 active:scale-985",
      )}
    >
      {/* Avatar Section - Premium Rounded Squares for Groups, Circles for Users */}
      <div className="relative flex shrink-0 items-center justify-center">
        <Avatar
          src={avatarUrl}
          name={title}
          shape={isGroup ? "rounded" : "circle"}
          className={cn(
            "relative transition-all duration-300 group-hover/header-info:shadow-sm",
            isGroup ? "size-10 rounded-md" : "size-10",
          )}
          imageClassName="transition-transform duration-700 ease-out group-hover/header-info:scale-110"
          fallbackClassName="bg-muted text-xs text-muted-foreground"
          loading="eager"
        >
          <div className="absolute inset-0 bg-ink/0 transition-colors group-hover/header-info:bg-ink/5" />
        </Avatar>

        {/* Secondary indicator (Group member or Online Status) */}
        {isGroup && secondaryAvatar ? (
          <div className="absolute -right-0.5 -bottom-0.5 z-10 size-3 overflow-hidden rounded-lg shadow-sm transition-transform duration-300 group-hover/header-info:translate-x-0.5 group-hover/header-info:translate-y-0.5">
            <Avatar
              src={secondaryAvatar}
              alt=""
              fallback=""
              shape="rounded"
              className="size-full rounded-lg"
            />
          </div>
        ) : !isGroup && onlineStatus ? (
          <span
            className={cn(
              "absolute right-0 bottom-0 size-3 rounded-full border-2 border-canvas shadow-none transition-all duration-300",
              onlineStatus === "ONLINE"
                ? "scale-100 bg-forge-teal"
                : onlineStatus === "AWAY"
                  ? "scale-100 bg-spark-amber"
                  : "scale-90 bg-slate-muted/40 opacity-50",
            )}
            title={onlineStatus === "ONLINE" ? "Online" : "Away"}
          />
        ) : null}
      </div>

      {/* Title & Subtitle Section */}
      <div className="flex h-10 min-w-0 flex-1 flex-col justify-center">
        <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
          <h2 className="truncate font-bold text-foreground text-sm leading-tight tracking-tight transition-colors duration-300 group-hover/header-info:text-primary">
            {title}
          </h2>
          {isGroup && (
            <ChevronRight className="size-3.5 shrink-0 text-slate-muted/30 transition-all duration-300 group-hover/header-info:translate-x-0.5 group-hover/header-info:text-primary/60" />
          )}
        </div>

        <AnimatePresence mode="wait">
          {isTyping && typingText ? (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.2 }}
              className="mt-0.5 flex items-center gap-1.5"
            >
              <p className="truncate font-bold text-forge-teal text-xs leading-tight">
                {typingText}
              </p>
              <UnifiedTypingIndicator
                variant="minimal"
                className="h-2.5 opacity-80"
              />
            </motion.div>
          ) : !isGroup && subtitle ? (
            <motion.p
              key="subtitle"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.2 }}
              className="mt-0.5 truncate font-medium text-slate-muted/80 text-xs leading-tight"
            >
              {subtitle}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </Button>
  ),
);
