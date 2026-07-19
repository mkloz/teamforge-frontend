import type { AutoForgeExecutionInput } from "@/features/forge/lib/forge-execution-schema";

export function createAutoForgeExecutionInput(
  overrides: Partial<AutoForgeExecutionInput> = {},
): AutoForgeExecutionInput {
  return {
    forgeScope: "LOCAL",
    selectedActivity: "Tech & Build",
    planCategory: "TECH",
    planName: "AI tool test",
    planDescription: "Compare small tools over coffee.",
    planScheduleMode: "FIXED",
    planDate: "2099-01-02",
    planTime: "18:30",
    planLocation: "Makers Cafe",
    planLocationLat: 51.5072,
    planLocationLng: -0.1276,
    coverImage: null,
    locationType: "IN_PERSON",
    planCost: "FREE",
    planCostAmount: "",
    planCostDetails: "",
    groupSizeMode: "RANGE",
    fixedSize: 6,
    autoMinSize: 4,
    autoMaxSize: 8,
    compatibilityWeight: 70,
    diversityWeight: 50,
    networkReachWeight: 40,
    maxDistanceKm: 40,
    visibility: "FRIENDS_ONLY",
    groupName: "Tool Test Table",
    groupDescription: "Practical people trying practical things.",
    avatarImage: null,
    ...overrides,
  };
}
