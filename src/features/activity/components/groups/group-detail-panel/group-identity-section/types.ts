import type { LucideIcon } from "lucide-react";
import type {
  Group,
  GroupStatus,
  MemberRole,
} from "@/features/activity/lib/activity-contract";
import type { IconTileTone } from "@/shared/components/ui/icon-tile";
import type { ImageMedia } from "@/shared/schemas/media";

export interface GroupIdentitySectionProps {
  canCreateJoinLinks?: boolean;
  canEditGroup?: boolean;
  canLeaveGroup?: boolean;
  canSuggestPlanChange?: boolean;
  activity?: Group["activity"];
  activityId: string;
  avatar?: string | null;
  avatarMedia?: ImageMedia | null;
  coverImage?: string | null;
  createdAt: string;
  currentUserRole: MemberRole;
  description: string | null;
  isReadOnly?: boolean;
  isOnline?: boolean;
  isSystemManaged?: boolean;
  memberCount: number;
  maxMembers: number;
  groupId: string;
  name: string;
  onEditGroup: () => void;
  plan?: Group["plan"];
  status: GroupStatus;
}

export interface GroupIdentityViewState {
  activityTitle: string | null;
  avatarSrc: string | null;
  canEditGroup: boolean;
  createdLabel: string;
  displayDescription: string | null;
  displayName: string;
  groupLink: string;
}

export interface CapacityDisplayState {
  capacitySegments: string[];
  filledCapacitySegments: number;
}

export interface GroupFactProps {
  icon: LucideIcon;
  label: string;
  tone: Extract<IconTileTone, "amber" | "muted" | "teal">;
  value: string;
}
