import type {
  FixedGroupSize,
  ForgeMode,
  Visibility,
} from "@/features/forge/lib/forge-contract";
import type { FriendshipApi } from "@/shared/schemas";

export interface Step3GroupProps {
  forgeMode: ForgeMode;
  fixedSize: FixedGroupSize;
  onFixedSizeChange: (v: number) => void;
  visibility: Visibility;
  onVisibilityChange: (v: Visibility) => void;
  groupName?: string;
  onGroupNameChange?: (v: string) => void;
  groupDescription?: string;
  onGroupDescriptionChange?: (v: string) => void;
  manualInviteeIds: string[];
  onManualInviteeToggle: (userId: string) => void;
  existingGroupNames?: string[];
  selectedActivity?: string | null;
}

export interface ManualGroupDetailsProps {
  fixedSize: FixedGroupSize;
  friends: FriendshipApi[];
  isLoadingFriends: boolean;
  manualInviteeIds: string[];
  onFixedSizeChange: (v: number) => void;
  onManualInviteeToggle: (userId: string) => void;
}
