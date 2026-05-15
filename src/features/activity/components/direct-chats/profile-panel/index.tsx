import { useRef } from "react";
import { UserProfilePanel as ProfilePanelContent } from "@/features/activity/components/user-profile-panel";
import { useDirectChatSafetyActions } from "@/features/activity/hooks/use-direct-chat-safety-actions";
import type { DirectChat } from "@/features/activity/lib/activity-contract";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import { useEscapeKey } from "@/shared/hooks/use-escape-key";
import { useResetScrollOnChange } from "@/shared/hooks/use-reset-scroll-on-change";
import { cn } from "@/shared/lib/utils";
import { ProfilePanelHeader } from "./profile-panel-header";

interface ProfilePanelProps {
  chat: DirectChat;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ProfilePanel - Desktop side panel for direct chat participant profiles.
 * Features a slide-in animation and unified content.
 */
export function ProfilePanel({ chat, isOpen, onClose }: ProfilePanelProps) {
  const safetyActions = useDirectChatSafetyActions(chat);
  useEscapeKey({ enabled: isOpen, onEscape: onClose });

  return (
    <aside
      className={cn(
        "hidden h-full flex-col border-border border-l bg-canvas transition duration-300 ease-out lg:flex",
        isOpen ? "w-80 opacity-100" : "w-0 overflow-hidden opacity-0",
      )}
    >
      <ProfilePanelHeader onClose={onClose} />
      <ProfilePanelContent
        chat={chat}
        blockActionDisabled={!safetyActions.canToggleBlock}
        isBlockActionPending={safetyActions.isBlockActionPending}
        onToggleBlock={safetyActions.toggleBlock}
      />
    </aside>
  );
}

/**
 * ProfilePanelMobile - Mobile bottom drawer for direct chat profiles.
 * Uses shadcn Drawer for high-performance sliding and accessibility.
 */
export function ProfilePanelMobile({
  chat,
  isOpen,
  onClose,
}: ProfilePanelProps) {
  const safetyActions = useDirectChatSafetyActions(chat);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useResetScrollOnChange({
    ref: scrollRef,
    resetKey: chat.id,
  });

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="h-dvh rounded-t-3xl border-t bg-canvas">
        <DrawerHeader className="sr-only">
          <DrawerTitle>User Profile</DrawerTitle>
        </DrawerHeader>
        <div
          ref={scrollRef}
          className="scrollbar-hide min-h-0 flex-1 overflow-y-auto pb-10"
        >
          <ProfilePanelContent
            chat={chat}
            isMobile={true}
            blockActionDisabled={!safetyActions.canToggleBlock}
            isBlockActionPending={safetyActions.isBlockActionPending}
            onToggleBlock={safetyActions.toggleBlock}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
