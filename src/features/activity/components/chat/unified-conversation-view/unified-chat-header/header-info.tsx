import type { OnlineStatus } from "@/features/activity/lib/activity-contract";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { memo } from "react";
import { UnifiedTypingIndicator } from "@/features/activity/components/chat/unified-typing-indicator";

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
        "bg-transparent hover:bg-muted/30 active:scale-[0.985]",
      )}
    >
      {/* Avatar Section - Premium Rounded Squares for Groups, Circles for Users */}
      <div className="relative shrink-0 flex items-center justify-center">
        <Avatar
          src={avatarUrl}
          name={title}
          shape={isGroup ? "rounded" : "circle"}
          className={cn(
            "relative transition-all duration-300 group-hover/header-info:shadow-sm",
            isGroup ? "w-10 h-10 rounded-md" : "w-10 h-10",
          )}
          imageClassName="transition-transform duration-700 ease-out group-hover/header-info:scale-110"
          fallbackClassName="bg-muted text-[10px] text-muted-foreground"
          loading="eager"
        >
          <div className="absolute inset-0 bg-ink/0 group-hover/header-info:bg-ink/5 transition-colors" />
        </Avatar>

        {/* Secondary indicator (Group member or Online Status) */}
        {isGroup && secondaryAvatar ? (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-lg overflow-hidden z-10 transition-transform duration-300 group-hover/header-info:translate-x-0.5 group-hover/header-info:translate-y-0.5 shadow-sm">
            <Avatar
              src={secondaryAvatar}
              alt=""
              fallback=""
              shape="rounded"
              className="h-full w-full rounded-lg"
            />
          </div>
        ) : !isGroup && onlineStatus ? (
          <span
            className={cn(
              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-canvas shadow-none transition-all duration-300",
              onlineStatus === "ONLINE"
                ? "bg-forge-teal scale-100"
                : onlineStatus === "AWAY"
                  ? "bg-spark-amber scale-100"
                  : "bg-slate-muted/40 scale-90 opacity-50",
            )}
            title={onlineStatus === "ONLINE" ? "Online" : "Away"}
          />
        ) : null}
      </div>

      {/* Title & Subtitle Section */}
      <div className="min-w-0 flex-1 flex flex-col justify-center h-10">
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          <h2 className="text-[14px] font-bold text-foreground tracking-tight truncate leading-tight group-hover/header-info:text-primary transition-colors duration-300">
            {title}
          </h2>
          {isGroup && (
            <ChevronRight
              size={14}
              className="text-slate-muted/30 group-hover/header-info:text-primary/60 group-hover/header-info:translate-x-0.5 transition-all duration-300 shrink-0"
            />
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
              className="flex items-center gap-1.5 mt-0.5"
            >
              <p className="text-[11px] font-bold text-forge-teal leading-tight truncate">
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
              className="text-[12px] font-medium text-slate-muted/80 leading-tight mt-0.5 truncate"
            >
              {subtitle}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </Button>
  ),
);
