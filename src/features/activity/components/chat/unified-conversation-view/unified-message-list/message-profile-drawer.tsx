import { UserProfilePanel } from "@/features/activity/components/user-profile-panel";
import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";

interface MessageProfileDrawerProps {
  selectedSender: ActivityParticipant | null;
  onClose: () => void;
}

export function MessageProfileDrawer({
  selectedSender,
  onClose,
}: MessageProfileDrawerProps) {
  return (
    <Drawer open={!!selectedSender} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="mx-auto max-h-[75svh] rounded-t-3xl border-t bg-canvas sm:max-w-md">
        <DrawerHeader className="sr-only">
          <DrawerTitle>User Profile</DrawerTitle>
        </DrawerHeader>

        {selectedSender && (
          <UserProfilePanel
            participant={selectedSender}
            profileNavigation={buildProfileNavigation()}
            isMobile={true}
            isDirectChat={false}
            onBack={onClose}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}
