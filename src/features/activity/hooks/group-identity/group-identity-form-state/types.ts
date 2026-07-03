import type {
  UpdateGroupPayload,
  UpdatePlanPayload,
} from "@/features/activity/api/activity.api";
import type {
  CostType,
  Group,
  LocationMode,
  PlanCategory,
} from "@/features/activity/lib/activity-contract";

export interface GroupIdentityFormValues {
  avatar: string;
  coverImage: string | null;
  description: string;
  planCategory: PlanCategory | "";
  planCost: CostType;
  planCostAmount: string;
  planCostDetails: string;
  planDateTime: string;
  planDescription: string;
  planLocation: string;
  planLocationLat: number | null;
  planLocationLng: number | null;
  planLocationMode: LocationMode;
  planTitle: string;
  name: string;
}

export interface GroupIdentityUpdateInput {
  groupId: string;
  groupPayload?: UpdateGroupPayload;
  planId?: string;
  planPayload?: UpdatePlanPayload;
}

export type GroupIdentityDetailsInitialValues = Pick<
  GroupIdentityFormValues,
  "avatar" | "description" | "name"
>;

export type GroupPlanInitialValues = Omit<
  GroupIdentityFormValues,
  keyof GroupIdentityDetailsInitialValues
>;

export type GroupPlanCostInitialValues = Pick<
  GroupPlanInitialValues,
  "planCost" | "planCostAmount" | "planCostDetails"
>;

export type GroupPlanLocationInitialValues = Pick<
  GroupPlanInitialValues,
  "planLocation" | "planLocationLat" | "planLocationLng" | "planLocationMode"
>;

export type GroupPlan = Group["plan"];
export type ExistingGroupPlan = NonNullable<GroupPlan>;
export type GroupPayloadComparableField = keyof UpdateGroupPayload &
  keyof Group;
export type PlanPayloadComparableField = keyof UpdatePlanPayload &
  keyof ExistingGroupPlan;
