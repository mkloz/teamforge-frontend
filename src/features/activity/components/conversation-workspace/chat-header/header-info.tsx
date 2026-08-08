import { Link } from "@tanstack/react-router";
import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import type { ComponentType, ReactNode } from "react";
import {
  MyNotesAvatarVisual,
  SavedMessagesAvatarVisual,
} from "@/features/activity/assets/special-conversation-avatars";
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
  avatarKind?: HeaderAvatarKind;
  detailsNavigation?: ConversationDetailsNavigation;
  canToggleAction?: boolean;
  isGroup: boolean;
  onlineStatus?: OnlineStatus;
  isTyping?: boolean;
  isActionOpen?: boolean;
  typingText?: string;
  onToggle: () => void;
}

type HeaderAvatarKind = "default" | "notes" | "saved";
type SpecialHeaderAvatarKind = Exclude<HeaderAvatarKind, "default">;

interface SpecialHeaderAvatarConfig {
  Visual: ComponentType<{ className?: string }>;
  visualClassName: string;
}

export function HeaderInfo(props: HeaderInfoProps) {
  const {
    title,
    subtitle,
    avatarUrl,
    avatarKind = "default",
    detailsNavigation,
    canToggleAction = true,
    isGroup,
    onlineStatus,
    isTyping,
    isActionOpen = false,
    typingText,
    onToggle,
  } = props;

  return (
    <HeaderInfoFrame
      canToggleAction={canToggleAction}
      detailsNavigation={detailsNavigation}
      isActionOpen={isActionOpen}
      isGroup={isGroup}
      onToggle={onToggle}
      title={title}
    >
      <HeaderInfoContent
        avatarKind={avatarKind}
        avatarUrl={avatarUrl}
        isGroup={isGroup}
        isTyping={isTyping}
        onlineStatus={onlineStatus}
        subtitle={subtitle}
        title={title}
        typingText={typingText}
      />
    </HeaderInfoFrame>
  );
}

function HeaderInfoFrame({
  canToggleAction,
  children,
  detailsNavigation,
  isActionOpen,
  isGroup,
  onToggle,
  title,
}: {
  canToggleAction: boolean;
  children: ReactNode;
  detailsNavigation?: ConversationDetailsNavigation;
  isActionOpen: boolean;
  isGroup: boolean;
  onToggle: () => void;
  title: string;
}) {
  if (detailsNavigation) {
    return (
      <Link
        {...detailsNavigation}
        className={headerInfoClassName}
        aria-label={getDetailsNavigationLabel(title, isGroup)}
      >
        {children}
      </Link>
    );
  }

  if (!canToggleAction) {
    return (
      <div className={cn(headerInfoClassName, "cursor-default")}>
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-expanded={isActionOpen}
      aria-label={getToggleActionLabel(title, isGroup, isActionOpen)}
      onClick={onToggle}
      className={headerInfoClassName}
    >
      {children}
    </button>
  );
}

function HeaderInfoContent({
  avatarKind,
  avatarUrl,
  isGroup,
  isTyping,
  onlineStatus,
  subtitle,
  title,
  typingText,
}: Pick<
  HeaderInfoProps,
  | "avatarKind"
  | "avatarUrl"
  | "isGroup"
  | "isTyping"
  | "onlineStatus"
  | "subtitle"
  | "title"
  | "typingText"
>) {
  const resolvedAvatarKind = avatarKind ?? "default";

  return (
    <>
      {/* Rounded squares for groups; circles for people. */}
      <div className="relative flex shrink-0 items-center justify-center">
        <HeaderAvatar
          avatarKind={resolvedAvatarKind}
          avatarUrl={avatarUrl}
          isGroup={isGroup}
          title={title}
        />
        <HeaderOnlineStatus
          avatarKind={resolvedAvatarKind}
          isGroup={isGroup}
          onlineStatus={onlineStatus}
        />
      </div>

      {/* Title & Subtitle Section */}
      <div className="flex h-10 min-w-0 flex-1 flex-col justify-center">
        <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
          <h2 className="min-w-0 flex-1 truncate font-bold text-foreground text-sm leading-tight tracking-tight">
            {title}
          </h2>
        </div>

        <HeaderSubtitle
          isTyping={isTyping}
          subtitle={subtitle}
          typingText={typingText}
        />
      </div>
    </>
  );
}

function HeaderOnlineStatus({
  avatarKind,
  isGroup,
  onlineStatus,
}: {
  avatarKind: HeaderAvatarKind;
  isGroup: boolean;
  onlineStatus?: OnlineStatus;
}) {
  if (avatarKind !== "default" || isGroup || !onlineStatus) {
    return null;
  }

  return (
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
      <TooltipContent>{ONLINE_STATUS_LABELS[onlineStatus]}</TooltipContent>
    </Tooltip>
  );
}

function HeaderSubtitle({
  isTyping,
  subtitle,
  typingText,
}: Pick<HeaderInfoProps, "isTyping" | "subtitle" | "typingText">) {
  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait">
        {isTyping && typingText ? (
          <m.div
            key="typing"
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.2 }}
            className="mt-0.5 flex min-w-0 items-center gap-1.5"
          >
            <p className="min-w-0 truncate font-bold text-foreground text-xs leading-tight">
              {typingText}
            </p>
            <UnifiedTypingIndicator
              variant="minimal"
              className="h-2.5 shrink-0 opacity-80"
            />
          </m.div>
        ) : subtitle ? (
          <m.p
            key="subtitle"
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.2 }}
            className="mt-0.5 truncate font-medium text-slate-muted/80 text-xs leading-tight"
          >
            {subtitle}
          </m.p>
        ) : null}
      </AnimatePresence>
    </LazyMotion>
  );
}

function HeaderAvatar({
  avatarKind,
  avatarUrl,
  isGroup,
  title,
}: {
  avatarKind: HeaderAvatarKind;
  avatarUrl?: string | null;
  isGroup: boolean;
  title: string;
}) {
  if (avatarKind !== "default") {
    return <SpecialHeaderAvatar config={SPECIAL_HEADER_AVATARS[avatarKind]} />;
  }

  return (
    <Avatar
      src={avatarUrl}
      name={title}
      shape={isGroup ? "rounded" : "circle"}
      className={cn(
        "relative transition-all duration-300",
        isGroup
          ? "size-10 rounded-md bg-primary/10 ring-1 ring-border/50"
          : "size-10",
      )}
      imageClassName="transition-transform duration-700 ease-out"
      fallbackClassName={isGroup ? "bg-primary/10 text-foreground" : undefined}
      loading="eager"
    >
      <div className="absolute inset-0 bg-ink/0" />
    </Avatar>
  );
}

function SpecialHeaderAvatar({
  config,
}: {
  config: SpecialHeaderAvatarConfig;
}) {
  const { Visual, visualClassName } = config;

  return (
    <span
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-transparent text-foreground"
      aria-hidden="true"
    >
      <Visual className={visualClassName} />
    </span>
  );
}

function getDetailsNavigationLabel(title: string, isGroup: boolean) {
  return `Open ${title} ${isGroup ? "group" : "profile"}`;
}

function getToggleActionLabel(
  title: string,
  isGroup: boolean,
  isActionOpen: boolean,
) {
  return `${isActionOpen ? "Close" : "Open"} ${title} ${
    isGroup ? "group details" : "profile"
  }`;
}

const headerInfoClassName = cn(
  "group/header-info -m-1 flex h-auto min-w-0 flex-1 cursor-pointer items-center justify-start gap-3 rounded-lg border-0 bg-transparent p-1 text-left shadow-none transition-none",
  "hover:bg-transparent hover:shadow-none active:bg-transparent active:shadow-none",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
);

const SPECIAL_HEADER_AVATARS = {
  notes: {
    Visual: MyNotesAvatarVisual,
    visualClassName: "size-full scale-110 overflow-visible",
  },
  saved: {
    Visual: SavedMessagesAvatarVisual,
    visualClassName: "size-full",
  },
} satisfies Record<SpecialHeaderAvatarKind, SpecialHeaderAvatarConfig>;

const ONLINE_STATUS_LABELS: Record<OnlineStatus, string> = {
  AWAY: "Away",
  OFFLINE: "Offline",
  ONLINE: "Online",
};
