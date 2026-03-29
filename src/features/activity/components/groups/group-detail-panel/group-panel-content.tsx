import { Button } from "@/shared/components/ui/button";
import { X } from "lucide-react";
import type { Group, MemberRole } from "@/features/activity/types/groups.types";
import { ActionsSection } from "./actions-section";
import { GroupIdentitySection } from "./group-identity-section";
import { MembersSection } from "./members-section";
import { PlanHistorySection } from "./plan-history-section";
import { PlanSection } from "./plan-section";
import { cn } from "@/shared/lib/utils";

interface GroupPanelContentProps {
  group: Group;
  onClose: () => void;
  isMobile?: boolean;
}

export function GroupPanelContent({
  group,
  onClose,
  isMobile = false,
}: GroupPanelContentProps) {
  // Get current user's role (would come from auth context in production)
  const currentUserRole: MemberRole =
    group.members.find((m) => m.role === "ADMIN")?.id === group.createdBy
      ? "ADMIN"
      : "MEMBER";

  return (
    <div
      className={cn(
        "flex flex-col h-full overflow-hidden",
        isMobile && "flex-1",
      )}
    >
      {!isMobile && (
        /* Desktop Header */
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
      )}

      {/* Scrollable Content */}
      <div className={cn("flex-1 overflow-y-auto", isMobile && "pb-safe")}>
        {/* Cover image */}
        <div className={cn("relative w-full", isMobile ? "h-40" : "h-32")}>
          <img
            src={group.plan.coverImage}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />

          {isMobile && (
            /* Mobile Close Button (on top of image) */
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-3 right-3 h-8 w-8 bg-black/30 hover:bg-black/50 text-white border-0"
              aria-label="Close panel"
            >
              <X size={16} />
            </Button>
          )}
        </div>

        <div className="p-4 space-y-6">
          {/* Group Identity */}
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

          {/* Plan History */}
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
