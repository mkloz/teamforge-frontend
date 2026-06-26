/* biome-ignore-all lint/a11y/noNoninteractiveTabindex: Message rows are focusable context-menu triggers. */
// oxlint-disable jsx-a11y/no-noninteractive-tabindex -- Message rows are focusable context-menu triggers.
import { Forward } from "lucide-react";
import type { KeyboardEventHandler, MouseEventHandler, ReactNode } from "react";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { cn } from "@/shared/lib/utils";

interface MessageItemArticleFrameProps {
  canToggleSelection: boolean;
  children: ReactNode;
  messageAriaLabel: string;
  onClickCapture: MouseEventHandler<HTMLElement>;
  onKeyDown: KeyboardEventHandler<HTMLElement>;
  shouldShowOuterFocus: boolean;
}

export function MessageItemArticleFrame({
  canToggleSelection,
  children,
  messageAriaLabel,
  onClickCapture,
  onKeyDown,
  shouldShowOuterFocus,
}: MessageItemArticleFrameProps) {
  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Message rows keep article semantics while supporting selection and context-menu keyboard workflows.
    <article
      tabIndex={0}
      aria-roledescription="message"
      aria-label={messageAriaLabel}
      className={cn(
        "group relative w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        canToggleSelection && "cursor-pointer",
        shouldShowOuterFocus ? "overflow-visible" : "overflow-hidden",
      )}
      onClickCapture={onClickCapture}
      onKeyDown={onKeyDown}
    >
      {children}
    </article>
  );
}

interface MessageItemLayoutProps {
  children: ReactNode;
  isOwn: boolean;
  kind: "dm" | "group";
  senderName: string | null | undefined;
  showSender: boolean;
}

export function MessageItemLayout({
  children,
  isOwn,
  kind,
  senderName,
  showSender,
}: MessageItemLayoutProps) {
  return (
    <div
      className={cn(
        "relative z-10 flex w-full min-w-0 items-end",
        isOwn ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "flex w-full min-w-0 max-w-xs flex-col sm:max-w-lg md:max-w-xl",
          isOwn ? "ml-auto items-end" : "mr-auto items-start",
        )}
      >
        <MessageSenderLabel
          isOwn={isOwn}
          kind={kind}
          senderName={senderName}
          showSender={showSender}
        />

        <div
          className={cn(
            "flex w-full min-w-0 max-w-full flex-col gap-1",
            isOwn ? "items-end" : "items-start",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function MessageSenderLabel({
  isOwn,
  kind,
  senderName,
  showSender,
}: {
  isOwn: boolean;
  kind: "dm" | "group";
  senderName: string | null | undefined;
  showSender: boolean;
}) {
  const label = getMessageSenderLabel({
    isOwn,
    kind,
    senderName,
    showSender,
  });

  if (!label) {
    return null;
  }

  return (
    <p className="mb-0.5 ml-1.5 font-bold text-micro text-primary opacity-90">
      {label}
    </p>
  );
}

function getMessageSenderLabel({
  isOwn,
  kind,
  senderName,
  showSender,
}: {
  isOwn: boolean;
  kind: "dm" | "group";
  senderName: string | null | undefined;
  showSender: boolean;
}) {
  if (!shouldShowMessageSenderLabel({ isOwn, kind, showSender })) {
    return null;
  }

  return getMessageSenderFallbackName(senderName);
}

function shouldShowMessageSenderLabel({
  isOwn,
  kind,
  showSender,
}: {
  isOwn: boolean;
  kind: "dm" | "group";
  showSender: boolean;
}) {
  if (isOwn) {
    return false;
  }

  if (kind !== "group") {
    return false;
  }

  return showSender;
}

function getMessageSenderFallbackName(senderName: string | null | undefined) {
  return senderName || "Unknown";
}

interface MessageBubbleShellProps {
  children: ReactNode;
  content: string;
  isHighlighted: boolean;
  isInteractionFocused: boolean;
  isOwn: boolean;
  isSelected: boolean;
  usesInlineFooter: boolean;
}

export function MessageBubbleShell({
  children,
  content,
  isHighlighted,
  isInteractionFocused,
  isOwn,
  isSelected,
  usesInlineFooter,
}: MessageBubbleShellProps) {
  return (
    <div
      className={getMessageBubbleShellClassName({
        content,
        isHighlighted,
        isInteractionFocused,
        isOwn,
        isSelected,
        usesInlineFooter,
      })}
    >
      {children}
    </div>
  );
}

function getMessageBubbleShellClassName({
  content,
  isHighlighted,
  isInteractionFocused,
  isOwn,
  isSelected,
  usesInlineFooter,
}: Pick<
  MessageBubbleShellProps,
  | "content"
  | "isHighlighted"
  | "isInteractionFocused"
  | "isOwn"
  | "isSelected"
  | "usesInlineFooter"
>) {
  return cn(
    "relative flex w-fit min-w-0 max-w-full flex-col rounded-xl px-1 py-1 shadow-xs transition duration-300",
    getMessageBubbleToneClassName(isOwn),
    getMessageBubbleFocusClassName({ isHighlighted, isInteractionFocused }),
    isSelected && "border-primary/65 bg-primary/12 ring-1 ring-primary/35",
    getMessageBubbleSizeClassName({ content, usesInlineFooter }),
  );
}

function getMessageBubbleToneClassName(isOwn: boolean) {
  return isOwn
    ? "rounded-br-none border border-primary/15 bg-primary/8 text-ink shadow-sm backdrop-blur-md"
    : "rounded-bl-none border border-border/60 bg-card/75 text-ink shadow-sm backdrop-blur-md";
}

function getMessageBubbleFocusClassName({
  isHighlighted,
  isInteractionFocused,
}: Pick<MessageBubbleShellProps, "isHighlighted" | "isInteractionFocused">) {
  if (isHighlighted) {
    return "message-search-focus";
  }

  return isInteractionFocused && "message-action-focus";
}

function getMessageBubbleSizeClassName({
  content,
  usesInlineFooter,
}: Pick<MessageBubbleShellProps, "content" | "usesInlineFooter">) {
  return cn(!content && "min-w-30", usesInlineFooter && "min-w-40");
}

export function ForwardedIndicator({
  message,
  isOwn,
}: {
  message: UnifiedMessage;
  isOwn: boolean;
}) {
  if (!message.forwardedFromMessageId) {
    return null;
  }

  const sourceName = message.forwardedFromSenderName?.trim();

  return (
    <div
      className={cn(
        "mx-1.5 mt-1 mb-0.5 flex min-w-0 items-center gap-1.5 rounded-lg px-1.5 py-0.5 font-bold text-micro",
        isOwn ? "bg-primary/8 text-primary" : "bg-muted/55 text-slate-muted",
      )}
    >
      <Forward className="size-3 shrink-0" aria-hidden="true" />
      <span className="min-w-0 truncate">
        Forwarded{sourceName ? ` from ${sourceName}` : ""}
      </span>
    </div>
  );
}
