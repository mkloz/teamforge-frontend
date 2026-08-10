import type {
  ActivityVisibility,
  GroupFormationMode,
  LocationMode,
  PlanCategory,
  PlanScheduleMode,
} from "@/shared/schemas/enums";

export type {
  FormationCandidate,
  FriendCompatibilityPreview,
} from "../schemas/plan-creation.schemas";
export type { GroupFormationMode, PlanCategory, PlanScheduleMode };
export type Visibility = ActivityVisibility;
export type LocationType = LocationMode;
export type GroupFormationScope = "LOCAL" | "ONLINE";
export type FixedGroupSize = 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type GroupSizeMode = "RANGE" | "FIXED";
export type GroupFormationResult = "IDLE" | "SUCCESS" | "FAILED" | "SEARCHING";
