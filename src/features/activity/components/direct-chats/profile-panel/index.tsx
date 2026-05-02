import { cn } from "@/shared/lib/utils";
import type { DirectChat } from "@/features/activity/lib/activity-contract";
import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import { useDirectChatSafetyActions } from "@/features/activity/hooks/use-direct-chat-safety-actions";
import { useEscapeKey } from "@/shared/hooks/use-escape-key";
import { UserProfilePanel as ProfilePanelContent } from "@/features/activity/components/user-profile-panel";
import { ProfilePanelHeader } from "./profile-panel-header";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";

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
        "hidden lg:flex flex-col h-full bg-canvas border-l border-border transition duration-300 ease-out",
        isOpen ? "w-80 opacity-100" : "w-0 opacity-0 overflow-hidden",
      )}
    >
      <ProfilePanelHeader onClose={onClose} />
      <ProfilePanelContent
        chat={chat}
        profileNavigation={buildProfileNavigation()}
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

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-canvas border-t rounded-t-3xl h-[90vh]">
        <DrawerHeader className="sr-only">
          <DrawerTitle>User Profile</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto min-h-0 pb-10 scrollbar-hide">
          <ProfilePanelContent
            chat={chat}
            profileNavigation={buildProfileNavigation()}
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
