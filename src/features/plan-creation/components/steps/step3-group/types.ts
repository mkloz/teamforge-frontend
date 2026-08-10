import type {
  FixedGroupSize,
  FriendCompatibilityPreview,
  GroupFormationMode,
  GroupFormationScope,
  LocationType,
  PlanScheduleMode,
  Visibility,
} from "@/features/plan-creation/lib/plan-creation-contract";
import type { FriendshipApi } from "@/shared/schemas";

export interface Step3GroupProps {
  groupFormationMode: GroupFormationMode;
  fixedSize: FixedGroupSize;
  onFixedSizeChange: (v: number) => void;
  autoMinSize: number;
  autoMaxSize: number;
  onAutoSizeRangeChange: (minimum: number, maximum: number) => void;
  visibility: Visibility;
  onVisibilityChange: (v: Visibility) => void;
  groupName?: string;
  groupDescription?: string;
  manualInviteeIds: string[];
  onManualInviteeToggle: (userId: string) => void;
  selectedActivity?: string | null;
  coverImage: string | null;
  groupFormationScope: GroupFormationScope;
  locationType: LocationType;
  planDate: string;
  planDescription: string;
  planLocation: string;
  planName: string;
  planScheduleMode: PlanScheduleMode;
  planTime: string;
}

export interface ManualGroupDetailsProps {
  compatibilityByUserId: ReadonlyMap<string, FriendCompatibilityPreview>;
  compatibilityPending: boolean;
  fixedSize: FixedGroupSize;
  friends: FriendshipApi[];
  friendSearch: string;
  hasMoreFriends: boolean;
  isFriendsError: boolean;
  isLoadingMoreFriends: boolean;
  isLoadingFriends: boolean;
  manualInviteeIds: string[];
  onFixedSizeChange: (v: number) => void;
  onFriendSearchChange: (value: string) => void;
  onLoadMoreFriends: () => void;
  onManualInviteeToggle: (userId: string) => void;
  onRetryFriends: () => void;
  totalFriends: number;
}
