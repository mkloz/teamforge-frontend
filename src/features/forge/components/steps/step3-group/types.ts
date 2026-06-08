import type { LucideIcon } from "lucide-react";
import type {
  FixedGroupSize,
  ForgeMode,
  GroupSizeMode,
  LocationType,
  Visibility,
} from "@/features/forge/lib/forge-contract";
import type { FriendshipApi } from "@/shared/schemas";

export interface Step3GroupProps {
  forgeMode: ForgeMode;
  onForgeModeChange: (v: ForgeMode) => void;
  fixedSize: FixedGroupSize;
  onFixedSizeChange: (v: number) => void;
  groupSizeMode: GroupSizeMode;
  onGroupSizeModeChange: (v: GroupSizeMode) => void;
  autoMinSize: number;
  autoMaxSize: number;
  onAutoSizeRangeChange: (minSize: number, maxSize: number) => void;
  locationType: LocationType;
  compatibilityWeight: number;
  onCompatibilityWeightChange: (v: number) => void;
  diversityWeight: number;
  onDiversityWeightChange: (v: number) => void;
  networkReachWeight: number;
  onNetworkReachWeightChange: (v: number) => void;
  maxDistanceKm: number;
  onMaxDistanceKmChange: (v: number) => void;
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

export interface ModeButtonProps {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  title: string;
  description: string;
  activeColor: "primary" | "accent";
}

export interface ManualGroupDetailsProps {
  fixedSize: FixedGroupSize;
  friends: FriendshipApi[];
  isLoadingFriends: boolean;
  manualInviteeIds: string[];
  onFixedSizeChange: (v: number) => void;
  onManualInviteeToggle: (userId: string) => void;
}

export interface AutoGroupDetailsProps {
  algorithmsExpanded: boolean;
  autoMaxSize: number;
  autoMinSize: number;
  compatibilityWeight: number;
  diversityWeight: number;
  fixedSize: FixedGroupSize;
  groupSizeMode: GroupSizeMode;
  locationType: LocationType;
  maxDistanceKm: number;
  onAlgorithmsExpandedChange: (value: boolean) => void;
  onAutoSizeRangeChange: (minSize: number, maxSize: number) => void;
  onCompatibilityWeightChange: (v: number) => void;
  onDiversityWeightChange: (v: number) => void;
  onFixedSizeChange: (v: number) => void;
  onGroupSizeModeChange: (v: GroupSizeMode) => void;
  onMaxDistanceKmChange: (v: number) => void;
  onNetworkReachWeightChange: (v: number) => void;
  networkReachWeight: number;
}

export interface WeightSliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  warning?: string;
  subLabel?: string;
  minLabel?: string;
  maxLabel?: string;
  formatValue?: (value: number) => string;
}
