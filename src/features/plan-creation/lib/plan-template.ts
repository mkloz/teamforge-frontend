import type {
  ActivityVisibility,
  CostType,
  GroupFormationMode,
  LocationMode,
} from "@/shared/schemas";

export interface PlanTemplate {
  selectedActivity: string;
  planName: string;
  planDescription: string;
  planLocation: string;
  planLocationLat: number | null;
  planLocationLng: number | null;
  locationType: LocationMode;
  planCost: CostType;
  planCostAmount: string;
  planCostDetails: string;
  groupFormationMode: GroupFormationMode;
  fixedSize: number | null;
  recommendedMinimumGroupSize: number | null;
  recommendedMaximumGroupSize: number | null;
  visibility: ActivityVisibility;
  groupName: string;
  groupDescription: string;
  coverImage: string | null;
  avatarImage: string | null;
}
