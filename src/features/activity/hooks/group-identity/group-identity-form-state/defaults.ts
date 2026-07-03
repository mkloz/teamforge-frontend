import type { GroupPlanInitialValues } from "@/features/activity/hooks/group-identity/group-identity-form-state/types";

export const DEFAULT_PLAN_VALUES = {
  coverImage: null,
  planCategory: "",
  planCost: "FREE",
  planCostAmount: "",
  planCostDetails: "",
  planDateTime: "",
  planDescription: "",
  planLocation: "",
  planLocationLat: null,
  planLocationLng: null,
  planLocationMode: "TBD",
  planTitle: "",
} satisfies GroupPlanInitialValues;
