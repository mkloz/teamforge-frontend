import type {
  FixedGroupSize,
  ForgeMode,
  ForgeScope,
  LocationType,
  PlanScheduleMode,
  Visibility,
} from "@/features/forge/lib/forge-contract";
import type { FriendshipApi } from "@/shared/schemas";

export interface Step3GroupProps {
  forgeMode: ForgeMode;
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
  forgeScope: ForgeScope;
  locationType: LocationType;
  planDate: string;
  planDescription: string;
  planLocation: string;
  planName: string;
  planScheduleMode: PlanScheduleMode;
  planTime: string;
}

export interface ManualGroupDetailsProps {
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
