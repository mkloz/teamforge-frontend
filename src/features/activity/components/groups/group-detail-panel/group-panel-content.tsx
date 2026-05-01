import type { DirectChat } from "@/features/activity/lib/activity-contract";
import type {
  Group,
  GroupMember,
  MemberRole,
} from "@/features/activity/lib/activity-contract";
import { buildMemberProfileChat } from "@/features/activity/lib/activity-projections";
import { useActivityFriendships } from "@/features/activity/hooks/use-activity-friendships";
import { useActivityGroupActions } from "@/features/activity/hooks/use-activity-group-actions";
import { useActivityMessageActions } from "@/features/activity/hooks/use-activity-message-actions";
import { UserProfilePanel } from "@/shared/components/user-profile-panel/user-profile-panel";
import { Button } from "@/shared/components/ui/button";
import { PlanCover } from "@/shared/components/common/plan-cover";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { Pencil, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ActionsSection } from "./actions-section";
import { GroupIdentitySection } from "./group-identity-section";
import { MembersSection } from "./members-section";
import { PlanHistorySection } from "./plan-history-section";
import { PlanSection } from "./plan-section";
import { PinnedMessagesSection } from "./pinned-messages-section";
import { EditGroupIdentityDialog } from "./edit-group-identity-dialog";

interface GroupPanelContentProps {
  group: Group;
  focusedPlanId?: string | null;
  focusedProposalId?: string | null;
  onClose: () => void;
  isMobile?: boolean;
}

// Staggered animation variants - Hoisted outside to prevent re-creation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function GroupPanelContent({
  group,
  focusedPlanId = null,
  focusedProposalId = null,
  onClose,
  isMobile = false,
}: GroupPanelContentProps) {
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(
    null,
  );
  const [isEditOpen, setIsEditOpen] = useState(false);
  const {
    currentUserId,
    disbandGroup,
    inviteMember,
    isDisbanding,
    isLeaving,
    invitingMemberId,
    leaveGroup,
    removeMember,
    removingMemberId,
  } = useActivityGroupActions(group.id);
  const { unpinMessage } = useActivityMessageActions();
  const friendshipsQuery = useActivityFriendships();

  const currentUserRole: MemberRole = useMemo(() => {
    const currentMember = group.members?.find(
      (member: GroupMember) =>
        member.userId === currentUserId && member.leftAt === null,
    );

    return currentMember?.role ?? "MEMBER";
  }, [currentUserId, group.members]);
  const members = useMemo(() => group.members ?? [], [group.members]);

  // Performance: memoize member count to avoid recalculation if not needed
  const memberCount = members.length;

  // Build a backend-shaped chat projection for the shared profile panel.
  const memberChat: DirectChat | null = useMemo(() => {
    return buildMemberProfileChat(selectedMember, group);
  }, [selectedMember, group]);

  const inviteCandidates = useMemo(() => {
    const memberIds = new Set(members.map((member) => member.userId));

    return (friendshipsQuery.data ?? [])
      .filter((friendship) => friendship.status === "ACCEPTED")
      .map((friendship) => friendship.counterpart)
      .filter((counterpart) => !memberIds.has(counterpart.id))
      .map((counterpart) => ({
        id: counterpart.id,
        name: counterpart.name,
        avatar: counterpart.avatar,
        city: counterpart.city ?? null,
        personalityType: counterpart.personalityType,
        onlineStatus: counterpart.onlineStatus,
        trustScore:
          counterpart.trustScore > 0 && counterpart.trustScore <= 1
            ? Math.round(counterpart.trustScore * 100)
            : Math.round(counterpart.trustScore),
      }));
  }, [friendshipsQuery.data, members]);

  const jumpToPinnedMessage = (messageId: string) => {
    const scroll = () => {
      const element = document.getElementById(`msg-${messageId}`);
      if (!element) {
        return;
      }

      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("ring-2", "ring-forge-teal/40", "rounded-xl");
      window.setTimeout(() => {
        element.classList.remove("ring-2", "ring-forge-teal/40", "rounded-xl");
      }, 1400);
    };

    if (isMobile) {
      onClose();
      window.setTimeout(scroll, 220);
      return;
    }

    scroll();
  };

  if (selectedMember && memberChat) {
    return (
      <UserProfilePanel
        chat={memberChat}
        isMobile={isMobile}
        isDirectChat={false}
        onBack={() => setSelectedMember(null)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full overflow-hidden relative",
        isMobile && "flex-1",
      )}
    >
      {!isMobile && (
        /* Desktop Header - Premium Backdrop Blur */
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-canvas/80 backdrop-blur-md z-20">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Group Info
          </h3>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="text-slate-muted hover:text-ink transition-colors"
            aria-label="Close panel"
          >
            <X size={16} />
          </Button>
        </div>
      )}

      {/* Scrollable Content Container */}
      <div
        className={cn(
          "flex-1 overflow-y-auto",
          isMobile && "pb-safe scrollbar-hide",
        )}
      >
        {/* Header section with cover/avatar overlap */}
        <header className="relative">
          {/* Cover image area with entrance scale animation */}
          <div className={cn("relative w-full", isMobile ? "h-44" : "h-36")}>
            <motion.div
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6 }}
              className="h-full w-full"
            >
              <PlanCover
                value={group.plan?.coverImage}
                alt={`${group.name} cover`}
                imageClassName="transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />
            </motion.div>
            {/* Gradient: stronger pull-down so avatar reads cleanly on top */}
            <div className="absolute inset-0 bg-linear-to-t from-canvas/90 via-canvas/10 to-transparent" />

            {/* Global Edit Button - Optimized for Admin Role */}
            {currentUserRole === "ADMIN" && (
              <Button
                variant="ghost"
                size="icon-xs"
                className={cn(
                  "absolute z-30 transition-all p-0",
                  isMobile ? "top-4 right-14 size-9" : "top-3 right-4",
                  "bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white border-0 rounded-full",
                )}
                aria-label="Edit group settings"
                onClick={() => setIsEditOpen(true)}
              >
                <Pencil size={isMobile ? 18 : 16} />
              </Button>
            )}

            {isMobile && (
              /* Mobile Close Button - Touch Optimized */
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onClose}
                className="absolute top-3 right-3 p-0 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white border-0 rounded-full"
                aria-label="Close group panel"
              >
                <X size={16} />
              </Button>
            )}
          </div>
        </header>

        {/* Main Content Sections - Staggered entrance */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="px-4 pt-3 pb-6"
        >
          {/* Group Identity Details — sits tight below the cover */}
          <motion.div variants={itemVariants}>
            <GroupIdentitySection
              name={group.name}
              description={group.description}
              memberCount={memberCount}
              maxMembers={group.maxMembers}
            />
          </motion.div>

          {/* Current Active Plan — closely related to identity, tighter gap */}
          {group.plan && (
            <motion.div variants={itemVariants} className="mt-5">
              <PlanSection
                plan={group.plan}
                isFocused={focusedPlanId === group.plan.id}
                focusedProposalId={focusedProposalId}
              />
            </motion.div>
          )}

          {/* Pinned Messages — contextual importance, sits before the broad member list */}
          {group.chat?.pinnedMessages &&
            group.chat.pinnedMessages.length > 0 && (
              <motion.div variants={itemVariants} className="mt-6">
                <PinnedMessagesSection
                  onJumpToMessage={jumpToPinnedMessage}
                  onUnpinMessage={unpinMessage}
                  pinnedMessages={group.chat.pinnedMessages}
                />
              </motion.div>
            )}

          {/* Divider: separates plan context from people */}
          <div className="border-t border-border/50 my-6" />

          {/* Members List Section */}
          {members.length > 0 && (
            <motion.div variants={itemVariants}>
              <MembersSection
                members={members}
                maxMembers={group.maxMembers}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                inviteCandidates={inviteCandidates}
                invitingMemberId={invitingMemberId}
                onInviteMember={inviteMember}
                onRemoveMember={removeMember}
                onShowProfile={(m) => setSelectedMember(m)}
                removingMemberId={removingMemberId}
              />
            </motion.div>
          )}

          {/* Plan History — generous separation, it's a secondary zone */}
          <motion.div variants={itemVariants} className="mt-8">
            <PlanHistorySection
              history={group.planHistory ?? []}
              userRole={currentUserRole}
            />
          </motion.div>

          {/* Critical Group Actions — maximum separation, danger zone */}
          <motion.div variants={itemVariants} className="mt-8">
            <ActionsSection
              currentUserRole={currentUserRole}
              groupStatus={group.status}
              isDisbanding={isDisbanding}
              isLeaving={isLeaving}
              onDisbandGroup={disbandGroup}
              onLeaveGroup={leaveGroup}
            />
          </motion.div>
        </motion.div>
      </div>
      {currentUserRole === "ADMIN" && (
        <EditGroupIdentityDialog
          group={group}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}
    </div>
  );
}
