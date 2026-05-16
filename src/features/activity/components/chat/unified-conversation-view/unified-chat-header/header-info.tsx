import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { memo } from "react";
import { UnifiedTypingIndicator } from "@/features/activity/components/chat/unified-typing-indicator";
import type { ConversationDetailsNavigation } from "@/features/activity/hooks/use-conversation-data";
import type { OnlineStatus } from "@/features/activity/lib/activity-contract";
import { Avatar, AvatarStatus } from "@/shared/components/common/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

interface HeaderInfoProps {
  title: string;
  subtitle?: string;
  avatarUrl?: string | null;
  detailsNavigation?: ConversationDetailsNavigation;
  isGroup: boolean;
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
    detailsNavigation,
    isGroup,
    onlineStatus,
    isTyping,
    typingText,
    onToggle,
  }: HeaderInfoProps) => {
    const content = (
      <>
        {/* Avatar Section - Premium Rounded Squares for Groups, Circles for Users */}
        <div className="relative flex shrink-0 items-center justify-center">
          <Avatar
            src={avatarUrl}
            name={title}
            shape={isGroup ? "rounded" : "circle"}
            className={cn(
              "relative transition-all duration-300",
              isGroup ? "size-10 rounded-md" : "size-10",
            )}
            imageClassName="transition-transform duration-700 ease-out"
            fallbackClassName="bg-muted text-xs text-muted-foreground"
            loading="eager"
          >
            <div className="absolute inset-0 bg-ink/0" />
          </Avatar>

          {!isGroup && onlineStatus ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <AvatarStatus
                  status={onlineStatus}
                  borderClassName="border-canvas"
                  className={cn(
                    "shadow-none transition-opacity duration-300",
                    onlineStatus === "OFFLINE" && "opacity-50",
                  )}
                />
              </TooltipTrigger>
              <TooltipContent>
                {onlineStatus === "ONLINE"
                  ? "Online"
                  : onlineStatus === "AWAY"
                    ? "Away"
                    : "Offline"}
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>

        {/* Title & Subtitle Section */}
        <div className="flex h-10 min-w-0 flex-1 flex-col justify-center">
          <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
            <h2 className="truncate font-bold text-foreground text-sm leading-tight tracking-tight">
              {title}
            </h2>
            {isGroup && (
              <ChevronRight className="size-3.5 shrink-0 text-slate-muted/30" />
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
            ) : subtitle ? (
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
      </>
    );

    if (detailsNavigation) {
      return (
        <Link
          {...detailsNavigation}
          className={headerInfoClassName}
          aria-label={`Open ${title} ${isGroup ? "group" : "profile"}`}
        >
          {content}
        </Link>
      );
    }

    return (
      <button type="button" onClick={onToggle} className={headerInfoClassName}>
        {content}
      </button>
    );
  },
);

const headerInfoClassName = cn(
  "group/header-info -m-1 flex h-auto min-w-0 flex-1 cursor-pointer items-center justify-start gap-3 rounded-lg border-0 bg-transparent p-1 text-left shadow-none transition-none",
  "hover:bg-transparent hover:shadow-none active:bg-transparent active:shadow-none",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
);
