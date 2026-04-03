import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X, Pencil } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type {
  Group,
  MemberRole,
  GroupMember,
} from "@/features/activity/types/groups.types";
import { ActionsSection } from "./actions-section";
import { GroupIdentitySection } from "./group-identity-section";
import { MembersSection } from "./members-section";
import { PlanHistorySection } from "./plan-history-section";
import { PlanSection } from "./plan-section";
import { UserProfilePanel } from "@/features/profile/components/user-profile-panel/user-profile-panel";
import type { DirectChat } from "@/features/activity/types/direct-chats.types";

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
    const isAdmin =
      group.members.find((m) => m.role === "ADMIN")?.id === group.createdBy;
    return isAdmin ? "ADMIN" : "MEMBER";
  }, [group.members, group.createdBy]);

  // Performance: memoize member count to avoid recalculation if not needed
  const memberCount = useMemo(
    () => group.members.length,
    [group.members.length],
  );

  // Map GroupMember to a mock DirectChat for the UserProfilePanel
  const memberChat: DirectChat | null = useMemo(() => {
    if (!selectedMember) return null;
    return {
      id: `temp-dm-${selectedMember.id}`,
      participant: {
        id: selectedMember.id,
        name: selectedMember.name,
        avatar: selectedMember.avatar,
        personalityType: selectedMember.personalityType,
        age: 26, // Mocked
        location: "London, UK", // Mocked
        onlineStatus: "ONLINE", // Mocked
        bio: "Creative group member passionate about collective experiences.", // Mocked
      },
      createdAt: new Date().toISOString(),
      isMuted: false,
      isBlocked: false,
      mutualGroups: [
        {
          id: group.id,
          name: group.identity.name,
          avatar: group.identity.avatar,
        },
      ],
    };
  }, [selectedMember, group.id, group.identity]);

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
            size="icon"
            onClick={onClose}
            className="h-8 w-8 hover:bg-muted"
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
          <div className={cn("relative w-full", isMobile ? "h-40" : "h-32")}>
            <motion.img
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6 }}
              src={group.plan.coverImage}
              alt=""
              className="w-full h-full object-cover"
              loading="eager" // Hero image
            />
            <div className="absolute inset-0 bg-linear-to-t from-canvas via-canvas/20 to-transparent" />

            {/* Global Edit Button - Optimized for Admin Role */}
            {currentUserRole === "ADMIN" && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute z-30 transition-all",
                  isMobile ? "top-4 right-14 h-9 w-9" : "top-3 right-4 h-8 w-8",
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
                size="icon"
                onClick={onClose}
                className="absolute top-3 right-3 h-8 w-8 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white border-0 rounded-full"
                aria-label="Close group panel"
              >
                <X size={16} />
              </Button>
            )}
          </div>

          {/* Overlapping Avatar Overlay - Spring Animation */}
          <div className="px-4 -mt-8 relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-2xl overflow-hidden bg-muted ring-4 ring-canvas shadow-xl flex items-center justify-center group pointer-events-auto"
            >
              <img
                src={group.identity.avatar}
                alt={`${group.identity.name} avatar`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
          </div>
        </header>

        {/* Main Content Sections - Staggered entrance */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-4 space-y-6"
        >
          {/* Group Identity Details */}
          <motion.div variants={itemVariants}>
            <GroupIdentitySection
              identity={group.identity}
              memberCount={memberCount}
              maxMembers={group.maxMembers}
              hideAvatar
            />
          </motion.div>

          {/* Current Active Plan Section */}
          <motion.div variants={itemVariants}>
            <PlanSection plan={group.plan} />
          </motion.div>

          {/* Members List Section */}
          <motion.div variants={itemVariants}>
            <MembersSection
              members={group.members}
              maxMembers={group.maxMembers}
              onShowProfile={(m) => setSelectedMember(m)}
            />
          </motion.div>

          {/* Plan History Feed */}
          <motion.div variants={itemVariants}>
            <PlanHistorySection
              history={group.planHistory ?? []}
              userRole={currentUserRole}
            />
          </motion.div>

          {/* Critical Group Actions */}
          <motion.div variants={itemVariants} className="pt-2">
            <ActionsSection groupId={group.id} groupStatus={group.status} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
