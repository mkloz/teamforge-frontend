import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { memo } from "react";
import type { OnlineStatus } from "../../types/direct-chats.types";
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
        "flex items-center gap-3 flex-1 min-w-0 rounded-xl p-1.5 -m-1.5 transition text-left group",
        "hover:bg-muted/40 active:scale-[0.98]",
      )}
    >
      <div className="relative shrink-0">
        <img
          src={avatarUrl}
          alt={title}
          className={cn(
            "w-10 h-10 object-cover bg-muted ring-1 ring-border/20 shadow-sm transition-transform duration-500 group-hover:scale-105",
            isGroup ? "rounded-xl" : "rounded-full",
          )}
        />
        {isGroup && secondaryAvatar ? (
          <img
            src={secondaryAvatar}
            alt=""
            className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-md object-cover ring-2 ring-canvas shadow-sm border border-border/20"
          />
        ) : !isGroup && onlineStatus ? (
          <span
            className={cn(
              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background shadow-xs",
              onlineStatus === "ONLINE"
                ? "bg-forge-teal"
                : onlineStatus === "AWAY"
                  ? "bg-spark-amber"
                  : "bg-slate-muted/40",
            )}
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1 h-10 flex flex-col justify-center">
        <h2 className="text-sm font-bold text-ink truncate leading-tight flex items-center gap-1.5">
          {title}
          {isGroup && (
            <ChevronRight
              size={14}
              className="text-slate-muted/40 group-hover:text-forge-teal transition-colors"
            />
          )}
        </h2>
        <AnimatePresence mode="wait">
          {isTyping && typingText ? (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-baseline gap-1 mt-0.5"
            >
              <p className="text-micro font-bold text-forge-teal leading-tight truncate">
                {typingText}
              </p>
              <UnifiedTypingIndicator variant="minimal" className="h-2.5" />
            </motion.div>
          ) : (
            <motion.p
              key="subtitle"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-micro font-medium text-slate-muted leading-tight mt-0.5"
            >
              {subtitle}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </button>
  ),
);
