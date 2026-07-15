import type {
  ActivityVisibility,
  ForgeMode,
  LocationMode,
  PlanCategory,
  PlanScheduleMode,
} from "@/shared/schemas/enums";

export type { ForgeParticipant } from "../schemas/forge.schemas";
export type { ForgeMode, PlanCategory, PlanScheduleMode };
export type Visibility = ActivityVisibility;
export type LocationType = LocationMode;
export type FixedGroupSize = 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type GroupSizeMode = "RANGE" | "FIXED";
export type ForgeResult = "IDLE" | "SUCCESS" | "FAILED";
