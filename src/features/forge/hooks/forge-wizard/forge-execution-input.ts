import type { AutoForgeExecutionInput } from "@/features/forge/api/forge-types";
import type { ForgeWizardData } from "@/features/forge/lib/forge-wizard";

export function buildForgeExecutionInput(
  state: ForgeWizardData,
): AutoForgeExecutionInput {
  return {
    selectedActivity: state.selectedActivity,
    planName: state.planName,
    planDescription: state.planDescription,
    planDate: state.planDate,
    planTime: state.planTime,
    planLocation: state.planLocation,
    planLocationLat: state.planLocationLat,
    planLocationLng: state.planLocationLng,
    coverImage: state.coverImage,
    locationType: state.locationType,
    planCost: state.planCost,
    planCostAmount: state.planCostAmount,
    planCostDetails: state.planCostDetails,
    groupSizeMode: state.groupSizeMode,
    fixedSize: state.fixedSize,
    autoMinSize: state.autoMinSize,
    autoMaxSize: state.autoMaxSize,
    visibility: state.visibility,
    groupName: state.groupName,
    groupDescription: state.groupDescription,
    avatarImage: state.avatarImage,
  };
}
