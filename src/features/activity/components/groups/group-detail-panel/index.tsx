import type { Group } from "@/features/activity/lib/activity-contract";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
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
  onSelectedMemberIdChange?: (memberId: string | null) => void;
}

export function GroupDetailPanel({
  group,
  isOpen,
  focusedPlanId = null,
  focusedProposalId = null,
  selectedMemberId = null,
  onClose,
  onSelectedMemberIdChange,
}: GroupDetailPanelProps) {
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  useEscapeKey({ enabled: isOpen, onEscape: onClose });

  if (isDesktop) {
    return (
      <aside
        className={cn(
          "hidden h-full flex-col border-border border-l bg-canvas xl:flex",
          "transition duration-300 ease-in-out",
          isOpen ? "w-96 opacity-100" : "w-0 overflow-hidden opacity-0",
        )}
      >
        {isOpen ? (
          <GroupPanelContent
            group={group}
            focusedPlanId={focusedPlanId}
            focusedProposalId={focusedProposalId}
            selectedMemberId={selectedMemberId}
            onClose={onClose}
            onSelectedMemberIdChange={onSelectedMemberIdChange}
          />
        ) : null}
      </aside>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="flex h-dvh max-h-dvh flex-col overflow-hidden rounded-t-3xl border-t-0 bg-canvas xl:hidden [&>div:first-child]:hidden">
        <DrawerHeader className="sr-only">
          <DrawerTitle>{group.name} Details</DrawerTitle>
          <DrawerDescription>
            Group members, plan details, and group actions.
          </DrawerDescription>
        </DrawerHeader>
        {isOpen ? (
          <GroupPanelContent
            group={group}
            focusedPlanId={focusedPlanId}
            focusedProposalId={focusedProposalId}
            selectedMemberId={selectedMemberId}
            onClose={onClose}
            onSelectedMemberIdChange={onSelectedMemberIdChange}
            isMobile
          />
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
