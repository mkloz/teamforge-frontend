import { getScenarioCatalogEntry } from "@/dev/scenarios/catalog/scenario-catalog";
import type { ScenarioController } from "@/dev/scenarios/runtime/scenario-controller";
import type { ForgeParticipant } from "@/features/forge/lib/forge-contract";
import {
  createInitialForgeWizardState,
  type Step,
} from "@/features/forge/lib/forge-wizard";
import { useForgeWizardDraftStore } from "@/features/forge/store/use-forge-wizard-draft-store";

export function prepareScenarioProductState(
  controller: ScenarioController | null,
  search: string,
) {
  const scenario = controller
    ? getScenarioCatalogEntry(controller.descriptor.id)
    : null;
  if (!controller || scenario?.feature !== "Forge") {
    return;
  }

  const step = getForgeStep(search);
  const isResultStep = step >= 5;
  const isSuccess = isResultStep && controller.descriptor.id !== "forge-failed";
  const isFailed = isResultStep && !isSuccess;
  const participants = isSuccess ? buildSuccessParticipants(controller) : [];
  const initialState = createInitialForgeWizardState();

  useForgeWizardDraftStore.getState().saveDraft({
    ...initialState,
    activityId: "scenario-activity-career",
    autoForgeRequestId: isSuccess ? "scenario-forge-request-preview" : null,
    autoForgeRequestLifecycle: isSuccess ? "FORMED" : null,
    autoForgeRequestRevision: isSuccess ? 1 : null,
    chatId: isSuccess ? "scenario-chat-scenario-group-career" : null,
    coverImage: "/group-covers/paper-collage.png",
    forgeMode: "AUTO",
    forgeResult: isSuccess ? "SUCCESS" : isFailed ? "FAILED" : "IDLE",
    groupDescription: "A thoughtful table for practical career changes.",
    groupId: isSuccess ? "scenario-group-career" : null,
    groupName: "Career Switcher Coffee",
    locationType: "IN_PERSON",
    participants,
    planCategory: "TECH",
    planDate: "2026-08-12",
    planDescription:
      "Bring one career question and leave with a practical next step.",
    planId: isSuccess ? "scenario-plan-career" : null,
    planLocation: "Shoreditch, London",
    planLocationLat: 51.5255,
    planLocationLng: -0.0754,
    planName: "Career switcher coffee",
    planScheduleMode: "FIXED",
    planTime: "10:25",
    selectedActivity: "Career switcher coffee",
    step,
    templateCoverImage: "/group-covers/paper-collage.png",
  });
}

function getForgeStep(search: string): Step {
  const value = Number(new URLSearchParams(search).get("step"));

  switch (value) {
    case 2:
      return 2;
    case 3:
      return 3;
    case 4:
      return 4;
    case 5:
      return 5;
    case 6:
      return 6;
    case 7:
      return 7;
    default:
      return 1;
  }
}

function buildSuccessParticipants(
  controller: ScenarioController,
): ForgeParticipant[] {
  const groupId = "scenario-group-career";
  const group = controller.world.entities.groups[groupId];
  const viewerId = controller.world.viewerId;

  if (!group) {
    return [];
  }

  return group.memberIds
    .filter((userId) => userId !== viewerId)
    .map((userId, index) => {
      const user = controller.world.entities.users[userId];

      return {
        compatibilityScore: 90 - index * 4,
        groupId,
        joinedAt: group.createdAt,
        leftAt: null,
        role: index === 0 ? "MODERATOR" : "MEMBER",
        sortOrder: index,
        user: {
          avatar: user.avatar,
          id: user.id,
          name: user.name,
          trustScore: user.trustScore,
        },
        userId,
      };
    });
}
