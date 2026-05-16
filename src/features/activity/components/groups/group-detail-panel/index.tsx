import type { Group } from "@/features/activity/lib/activity-contract";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import { useEscapeKey } from "@/shared/hooks/use-escape-key";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { cn } from "@/shared/lib/utils";
import { GroupPanelContent } from "./group-panel-content";

interface GroupDetailPanelProps {
  group: Group;
  isOpen: boolean;
  focusedPlanId?: string | null;
  focusedProposalId?: string | null;
  selectedMemberId?: string | null;
  onClose: () => void;
  onJumpToMessage?: (messageId: string) => void;
  onSelectedMemberIdChange?: (memberId: string | null) => void;
}

export function GroupDetailPanel({
  group,
  isOpen,
  focusedPlanId = null,
  focusedProposalId = null,
  selectedMemberId = null,
  onClose,
  onJumpToMessage,
  onSelectedMemberIdChange,
}: GroupDetailPanelProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  useEscapeKey({ enabled: isOpen, onEscape: onClose });

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden h-full flex-col border-border border-l bg-canvas lg:flex",
          "transition duration-300 ease-in-out",
          isOpen ? "w-96 opacity-100" : "w-0 overflow-hidden opacity-0",
        )}
      >
        <GroupPanelContent
          group={group}
          focusedPlanId={focusedPlanId}
          focusedProposalId={focusedProposalId}
          selectedMemberId={selectedMemberId}
          onClose={onClose}
          onJumpToMessage={onJumpToMessage}
          onSelectedMemberIdChange={onSelectedMemberIdChange}
        />
      </aside>

      {/* Mobile/Tablet overlay sheet using shadcn Drawer */}
      <Drawer
        open={isOpen && !isDesktop}
        onOpenChange={(open) => !open && onClose()}
      >
        <DrawerContent className="flex h-dvh max-h-dvh flex-col overflow-hidden rounded-t-3xl border-t bg-canvas lg:hidden">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{group.name} Details</DrawerTitle>
          </DrawerHeader>
          <GroupPanelContent
            group={group}
            focusedPlanId={focusedPlanId}
            focusedProposalId={focusedProposalId}
            selectedMemberId={selectedMemberId}
            onClose={onClose}
            onJumpToMessage={onJumpToMessage}
            onSelectedMemberIdChange={onSelectedMemberIdChange}
            isMobile
          />
        </DrawerContent>
      </Drawer>
    </>
  );
}
