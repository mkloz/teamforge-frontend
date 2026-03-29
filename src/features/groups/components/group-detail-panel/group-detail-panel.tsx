import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { X } from "lucide-react";
import { useCallback, useEffect } from "react";
import type { Group, MemberRole } from "../../types/groups.types";
import { ActionsSection } from "./actions-section";
import { GroupIdentitySection } from "./group-identity-section";
import { MembersSection } from "./members-section";
import { PlanHistorySection } from "./plan-history-section";
import { PlanSection } from "./plan-section";

interface GroupDetailPanelProps {
  group: Group;
  isOpen: boolean;
  onClose: () => void;
}

export function GroupDetailPanel({
  group,
  isOpen,
  onClose,
}: GroupDetailPanelProps) {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when mobile sheet is open
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-full border-l border-border bg-canvas",
          "transition-all duration-200 ease-in-out",
          isOpen ? "w-80" : "w-0 overflow-hidden",
        )}
      >
        <DesktopPanelContent group={group} onClose={onClose} />
      </aside>

      {/* Mobile/Tablet overlay sheet */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-50",
          "transition-opacity duration-200",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Sheet */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-canvas rounded-t-2xl",
            "transition-transform duration-300 ease-out",
            "max-h-[85vh] flex flex-col",
            isOpen ? "translate-y-0" : "translate-y-full",
          )}
        >
          {/* Drag handle */}
          <div className="flex justify-center py-3">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          <MobilePanelContent group={group} onClose={onClose} />
        </div>
      </div>
    </>
  );
}

function DesktopPanelContent({
  group,
  onClose,
}: {
  group: Group;
  onClose: () => void;
}) {
  // Get current user's role (would come from auth context in production)
  const currentUserRole: MemberRole =
    group.members.find((m) => m.role === "ADMIN")?.id === group.createdBy
      ? "ADMIN"
      : "MEMBER";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Group Info</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
          aria-label="Close panel"
        >
          <X size={16} />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Cover image */}
        <div className="relative h-32 w-full">
          <img
            src={group.plan.coverImage}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        <div className="p-4 space-y-6">
          {/* Group Identity - persistent across plans */}
          <GroupIdentitySection
            identity={group.identity}
            memberCount={group.members.length}
            maxMembers={group.maxMembers}
            userRole={currentUserRole}
          />

          {/* Current Plan Details */}
          <PlanSection plan={group.plan} userRole={currentUserRole} />

          {/* Members */}
          <MembersSection
            members={group.members}
            maxMembers={group.maxMembers}
          />

          {/* Plan History - for group reusability */}
          <PlanHistorySection
            history={group.planHistory ?? []}
            userRole={currentUserRole}
          />

          {/* Actions */}
          <ActionsSection groupId={group.id} groupStatus={group.status} />
        </div>
      </div>
    </div>
  );
}

function MobilePanelContent({
  group,
  onClose,
}: {
  group: Group;
  onClose: () => void;
}) {
  // Get current user's role (would come from auth context in production)
  const currentUserRole: MemberRole =
    group.members.find((m) => m.role === "ADMIN")?.id === group.createdBy
      ? "ADMIN"
      : "MEMBER";

  return (
    <div className="flex-1 overflow-y-auto pb-safe">
      {/* Cover image */}
      <div className="relative h-40 w-full">
        <img
          src={group.plan.coverImage}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-3 right-3 h-8 w-8 bg-black/30 hover:bg-black/50 text-white"
          aria-label="Close panel"
        >
          <X size={16} />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Group Identity */}
        <GroupIdentitySection
          identity={group.identity}
          memberCount={group.members.length}
          maxMembers={group.maxMembers}
          userRole={currentUserRole}
        />

        {/* Plan Details */}
        <PlanSection plan={group.plan} userRole={currentUserRole} />

        {/* Members */}
        <MembersSection members={group.members} maxMembers={group.maxMembers} />

        {/* Plan History */}
        <PlanHistorySection
          history={group.planHistory ?? []}
          userRole={currentUserRole}
        />

        {/* Actions */}
        <ActionsSection groupId={group.id} groupStatus={group.status} />
      </div>
    </div>
  );
}
