import { UserProfilePanel as ProfilePanelContent } from "@/features/activity/components/user-profile-panel";
import { useDirectChatSafetyActions } from "@/features/activity/hooks/use-direct-chat-safety-actions";
import type { DirectChat } from "@/features/activity/lib/activity-contract";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import { useEscapeKey } from "@/shared/hooks/use-escape-key";
import { cn } from "@/shared/lib/utils";
import { ProfilePanelHeader } from "./profile-panel-header";

interface ProfilePanelProps {
  chat: DirectChat;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ProfilePanel - Desktop side panel for direct chat participant profiles.
 */
export function ProfilePanel({ chat, isOpen, onClose }: ProfilePanelProps) {
  useEscapeKey({ enabled: isOpen, onEscape: onClose });

  return (
    <aside
      className={cn(
        "hidden h-full min-h-0 flex-col overflow-hidden border-border border-l bg-canvas transition duration-300 ease-out xl:flex",
        isOpen ? "w-96 opacity-100" : "w-0 overflow-hidden opacity-0",
      )}
    >
      {isOpen ? (
        <ProfilePanelBody chat={chat} onClose={onClose} mode="desktop" />
      ) : null}
    </aside>
  );
}

/**
 * ProfilePanelMobile - Mobile bottom drawer for direct chat profiles.
 */
export function ProfilePanelMobile({
  chat,
  isOpen,
  onClose,
}: ProfilePanelProps) {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="h-dvh max-h-dvh overflow-hidden rounded-t-3xl border-t bg-canvas">
        <DrawerHeader className="sr-only">
          <DrawerTitle>User Profile</DrawerTitle>
          <DrawerDescription>
            Profile details and account actions for this person.
          </DrawerDescription>
        </DrawerHeader>
        {isOpen ? (
          <ProfilePanelBody chat={chat} onClose={onClose} mode="mobile" />
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

function ProfilePanelBody({
  chat,
  mode,
  onClose,
}: Pick<ProfilePanelProps, "chat" | "onClose"> & {
  mode: "desktop" | "mobile";
}) {
  const safetyActions = useDirectChatSafetyActions(chat);

  return (
    <>
      {mode === "desktop" ? <ProfilePanelHeader onClose={onClose} /> : null}
      <ProfilePanelContent
        chat={chat}
        mode={mode === "mobile" ? "mobile" : undefined}
        safety={{
          blockActionDisabled: !safetyActions.canToggleBlock,
          blockActionPending: safetyActions.isBlockActionPending,
          isMuteActionDisabled: safetyActions.isMuteActionDisabled,
          muteActionPending: safetyActions.isMuteActionPending,
          onToggleMute: safetyActions.toggleMute,
          onToggleBlock: safetyActions.toggleBlock,
        }}
      />
    </>
  );
}
