import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { memo } from "react";
import type { OnlineStatus } from "@/features/activity/types/direct-chats.types";
import { UnifiedTypingIndicator } from "../unified-typing-indicator";

interface HeaderInfoProps {
  title: string;
  subtitle?: string;
  avatarUrl: string;
  isGroup: boolean;
  secondaryAvatar?: string;
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
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center gap-3 flex-1 min-w-0 rounded-lg p-1 -m-1 transition-all duration-300 text-left group/header-info outline-none",
        "bg-transparent hover:bg-muted/30 active:scale-[0.985]",
      )}
    >
      {/* Avatar Section - Premium Rounded Squares for Groups, Circles for Users */}
      <div className="relative shrink-0 flex items-center justify-center">
        <div
          className={cn(
            "relative overflow-hidden transition-all duration-300 group-hover/header-info:shadow-sm",
            isGroup ? "w-10 h-10 rounded-lg" : "w-10 h-10 rounded-full",
          )}
        >
          <img
            src={avatarUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/header-info:scale-110"
          />
          <div className="absolute inset-0 bg-ink/0 group-hover/header-info:bg-ink/5 transition-colors" />
        </div>

        {/* Secondary indicator (Group member or Online Status) */}
        {isGroup && secondaryAvatar ? (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg overflow-hidden z-10 transition-transform duration-300 group-hover/header-info:translate-x-0.5 group-hover/header-info:translate-y-0.5 shadow-sm">
            <img
              src={secondaryAvatar}
              alt=""
              className="w-full h-full object-cover"
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
          ) : (
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
          )}
        </AnimatePresence>
      </div>
    </button>
  ),
);
