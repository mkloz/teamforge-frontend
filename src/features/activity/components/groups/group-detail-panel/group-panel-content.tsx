import type { DirectChat } from "@/features/activity/types/direct-chats.types";
import type {
  Group,
  GroupMember,
  MemberRole,
} from "@/features/activity/types/groups.types";
import { UserProfilePanel } from "@/features/profile/components/user-profile-panel/user-profile-panel";
import { Button } from "@/shared/components/ui/button";
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

interface GroupPanelContentProps {
  group: Group;
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
  onClose,
  isMobile = false,
}: GroupPanelContentProps) {
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(
    null,
  );

  // Memoize current user's role (derive from group data)
  // In production, this would likely come from an Auth Context
  const currentUserRole: MemberRole = useMemo(() => {
    const isAdmin = group.members?.some((m) => m.role === "ADMIN");
    return isAdmin ? "ADMIN" : "MEMBER";
  }, [group.members]);

  // Performance: memoize member count to avoid recalculation if not needed
  const memberCount = useMemo(
    () => group.members?.length || 0,
    [group.members?.length],
  );

  // Map GroupMember to a mock DirectChat for the UserProfilePanel
  const memberChat: DirectChat | null = useMemo(() => {
    if (!selectedMember || !selectedMember.user) return null;
    const chat: DirectChat = {
      id: `temp-dm-${selectedMember.userId}`,
      type: "PRIVATE",
      createdAt: new Date().toISOString(),
      groupId: null,
      participants: [
        {
          userId: selectedMember.userId,
          chatId: `temp-dm-${selectedMember.userId}`,
          user: selectedMember.user,
        },
      ],
      isMuted: false,
      isBlocked: false,
      mutualGroups: [
        {
          id: group.id,
          name: group.name,
          avatar: group.avatar,
        },
      ],
    };
    return chat;
  }, [selectedMember, group.id, group.name, group.avatar]);

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
            <motion.img
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6 }}
              src={group.plan?.coverImage || undefined}
              alt=""
              className="w-full h-full object-cover"
              loading="eager" // Hero image
            />
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
              <PlanSection plan={group.plan} />
            </motion.div>
          )}

          {/* Pinned Messages — contextual importance, sits before the broad member list */}
          {group.chat?.pinnedMessages &&
            group.chat.pinnedMessages.length > 0 && (
              <motion.div variants={itemVariants} className="mt-6">
                <PinnedMessagesSection
                  pinnedMessages={group.chat.pinnedMessages}
                />
              </motion.div>
            )}

          {/* Divider: separates plan context from people */}
          <div className="border-t border-border/50 my-6" />

          {/* Members List Section */}
          {group.members && (
            <motion.div variants={itemVariants}>
              <MembersSection
                members={group.members}
                maxMembers={group.maxMembers}
                onShowProfile={(m) => setSelectedMember(m)}
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
            <ActionsSection groupId={group.id} groupStatus={group.status} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
