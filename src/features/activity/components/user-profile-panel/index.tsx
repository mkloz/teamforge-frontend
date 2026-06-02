import { useCallback, useEffect, useRef, useState } from "react";
import { buildActivityDmNavigation } from "@/features/activity/lib/activity-route";
import {
  buildProfileNavigation,
  type ProfileNavigation,
} from "@/features/profile/lib/profile-route";
import { useResetScrollOnChange } from "@/shared/hooks/use-reset-scroll-on-change";
import { scrollElementToTop } from "@/shared/lib/scroll-to-top";
import { cn } from "@/shared/lib/utils";
import { type MutualGroup, MutualGroupsSection } from "./mutual-groups-section";
import { ProfilePanelInfo } from "./profile-panel-info";
import { ProfilePanelSettings } from "./profile-panel-settings";
import type {
  UserProfilePanelChat,
  UserProfilePanelParticipant,
} from "./types";
import { useHydratedProfilePanelParticipant } from "./use-hydrated-profile-panel-participant";

interface UserProfilePanelProps {
  participant?: UserProfilePanelParticipant;
  chat?: UserProfilePanelChat;
  profileNavigation?: ProfileNavigation;
  mutualGroups?: MutualGroup[];
  isMuted?: boolean;
  isBlocked?: boolean;
  blockActionDisabled?: boolean;
  isBlockActionPending?: boolean;
  isMuteActionPending?: boolean;
  isMobile?: boolean;
  isDirectChat?: boolean;
  onBack?: () => void;
  onToggleMute?: () => void;
  onToggleBlock?: () => void;
}

const PANEL_COLLAPSE_SCROLL_TRIGGER = 32;
const PANEL_EXPAND_SCROLL_TRIGGER = 8;
const PANEL_COMPACT_HEADER_HEIGHT = 72;
const PANEL_COMPACT_HEADER_SNAP_TARGET = 192;
const PROFILE_PANEL_ORIGINAL_CARD_SELECTOR =
  "[data-profile-panel-original-card]";

export function UserProfilePanel({
  participant: propParticipant,
  chat,
  profileNavigation,
  mutualGroups: propMutualGroups,
  isMuted: propIsMuted,
  isBlocked: propIsBlocked,
  blockActionDisabled = false,
  isBlockActionPending = false,
  isMuteActionPending = false,
  isMobile = false,
  isDirectChat = true,
  onBack,
  onToggleMute,
  onToggleBlock,
}: UserProfilePanelProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const isPanelHeaderCollapsedRef = useRef(false);
  const isCompactHeaderVisibleRef = useRef(false);
  const compactRestingScrollTopRef = useRef(0);
  const [isPanelHeaderCollapsed, setIsPanelHeaderCollapsed] = useState(false);
  const [isCompactHeaderVisible, setIsCompactHeaderVisible] = useState(false);
  const selectedParticipant =
    propParticipant ||
    chat?.participants?.find(
      (member) =>
        member.user?.id !== "current-user" &&
        member.user?.id !== "user-current",
    )?.user ||
    chat?.participants?.[0]?.user;
  const { isHydratingProfile, participant } =
    useHydratedProfilePanelParticipant(selectedParticipant);
  const profileScrollResetKey =
    participant?.id ?? chat?.id ?? "missing-profile";
  const lastProfileScrollResetKeyRef = useRef(profileScrollResetKey);

  const mutualGroups = propMutualGroups || chat?.mutualGroups || [];
  const isMuted = propIsMuted ?? chat?.isMuted ?? false;
  const isBlocked = propIsBlocked ?? chat?.isBlocked ?? false;

  useResetScrollOnChange({
    enabled: Boolean(participant?.id || chat?.id),
    ref: scrollRef,
    resetKey: profileScrollResetKey,
  });

  const applyPanelHeaderState = useCallback(() => {
    const element = scrollRef.current;
    const scrollTop = element?.scrollTop ?? 0;
    const snapTarget = element
      ? getProfilePanelCompactSnapTarget(element)
      : PANEL_COMPACT_HEADER_SNAP_TARGET;
    const shouldExpand =
      isCompactHeaderVisibleRef.current &&
      scrollTop <
        Math.max(
          PANEL_EXPAND_SCROLL_TRIGGER,
          compactRestingScrollTopRef.current - 8,
        );
    const shouldSnapCompact =
      !isCompactHeaderVisibleRef.current &&
      scrollTop >= PANEL_COLLAPSE_SCROLL_TRIGGER;
    const shouldCollapse =
      isPanelHeaderCollapsedRef.current || shouldSnapCompact;
    const shouldShowCompactHeader =
      isCompactHeaderVisibleRef.current || shouldSnapCompact;

    if (shouldSnapCompact && element) {
      element.scrollTo({
        top: snapTarget,
        behavior: "instant",
      });
      compactRestingScrollTopRef.current = snapTarget;
    }

    if (shouldExpand && element) {
      element.scrollTo({ top: 0, behavior: "instant" });
      compactRestingScrollTopRef.current = 0;
    }

    if (isPanelHeaderCollapsedRef.current !== shouldCollapse || shouldExpand) {
      isPanelHeaderCollapsedRef.current = shouldExpand ? false : shouldCollapse;
      setIsPanelHeaderCollapsed(shouldExpand ? false : shouldCollapse);
    }

    if (
      isCompactHeaderVisibleRef.current !== shouldShowCompactHeader ||
      shouldExpand
    ) {
      isCompactHeaderVisibleRef.current = shouldExpand
        ? false
        : shouldShowCompactHeader;
      if (shouldExpand) {
        compactRestingScrollTopRef.current = 0;
      }
      setIsCompactHeaderVisible(shouldExpand ? false : shouldShowCompactHeader);
    }
  }, []);

  const handlePanelScroll = useCallback(() => {
    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      applyPanelHeaderState();
    });
  }, [applyPanelHeaderState]);

  const scrollPanelToTop = useCallback(() => {
    scrollElementToTop(scrollRef.current);
  }, []);

  useEffect(() => {
    if (lastProfileScrollResetKeyRef.current === profileScrollResetKey) {
      return;
    }

    lastProfileScrollResetKeyRef.current = profileScrollResetKey;
    isPanelHeaderCollapsedRef.current = false;
    isCompactHeaderVisibleRef.current = false;
    compactRestingScrollTopRef.current = 0;
    setIsPanelHeaderCollapsed(false);
    setIsCompactHeaderVisible(false);
  }, [profileScrollResetKey]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  if (!participant) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center">
        <p className="text-slate-muted text-sm">User profile not found</p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handlePanelScroll}
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-y-auto [--panel-cover-expanded-height:136px]",
        isPanelHeaderCollapsed
          ? "[--panel-cover-y:-64px] [--personality-cover-type-opacity:0.22] [--personality-cover-type-scale:0.48] [--personality-cover-type-y:-32px]"
          : "[--panel-cover-y:0px] [--personality-cover-type-opacity:0.82] [--personality-cover-type-scale:1] [--personality-cover-type-y:0px]",
        isCompactHeaderVisible
          ? "[--profile-panel-original-opacity:0] [--profile-panel-original-pointer-events:none]"
          : "[--profile-panel-original-opacity:1] [--profile-panel-original-pointer-events:auto]",
        isMobile
          ? "scrollbar-hide pb-6"
          : "[scrollbar-color:var(--muted-foreground)_transparent] [scrollbar-width:thin]",
      )}
    >
      <div className="flex-1">
        <ProfilePanelInfo
          participant={participant}
          isHydratingProfile={isHydratingProfile}
          chatNavigation={
            chat?.id ? buildActivityDmNavigation(chat.id) : undefined
          }
          compactHeaderVisible={isCompactHeaderVisible}
          onCompactHeaderClick={scrollPanelToTop}
          profileNavigation={
            profileNavigation ?? buildProfileNavigation(participant.id)
          }
          onBack={onBack}
        />

        <MutualGroupsSection groups={mutualGroups} />

        {isDirectChat && (
          <ProfilePanelSettings
            isMuted={isMuted}
            isBlocked={isBlocked}
            blockActionDisabled={blockActionDisabled}
            isBlockActionPending={isBlockActionPending}
            isMuteActionPending={isMuteActionPending}
            isMobile={isMobile}
            onToggleMute={onToggleMute}
            onToggleBlock={onToggleBlock}
          />
        )}
      </div>
    </div>
  );
}

function getProfilePanelCompactSnapTarget(element: HTMLElement) {
  const maxScrollTop = Math.max(0, element.scrollHeight - element.clientHeight);
  const originalCard = element.querySelector<HTMLElement>(
    PROFILE_PANEL_ORIGINAL_CARD_SELECTOR,
  );

  if (!originalCard) {
    return Math.min(PANEL_COMPACT_HEADER_SNAP_TARGET, maxScrollTop);
  }

  const elementRect = element.getBoundingClientRect();
  const originalCardRect = originalCard.getBoundingClientRect();
  const compactBoundary = elementRect.top + PANEL_COMPACT_HEADER_HEIGHT;
  const requiredScrollTop =
    element.scrollTop + (originalCardRect.bottom - compactBoundary) + 1;

  return Math.min(
    Math.max(PANEL_COMPACT_HEADER_SNAP_TARGET, Math.ceil(requiredScrollTop)),
    maxScrollTop,
  );
}
