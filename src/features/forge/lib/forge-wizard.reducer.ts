import type {
  FixedGroupSize,
  ForgeMode,
  ForgeParticipant,
  ForgeResult,
  GroupSizeMode,
  LocationType,
  Visibility,
} from "@/features/forge/lib/forge-contract";

export type Step = 1 | 2 | 3 | 4 | 5 | 6;
export type NavDirection = "forward" | "back";

export interface ForgeWizardData {
  step: Step;
  navDirection: NavDirection;
  selectedActivity: string | null;
  planName: string;
  planDescription: string;
  planDate: string;
  planTime: string;
  planLocation: string;
  planLocationLat: number | null;
  planLocationLng: number | null;
  locationType: LocationType;
  planCost: "FREE" | "PAID";
  planCostAmount: string;
  planCostDetails: string;
  forgeMode: ForgeMode;
  fixedSize: FixedGroupSize;
  groupSizeMode: GroupSizeMode;
  autoMinSize: number;
  autoMaxSize: number;
  compatibilityWeight: number;
  diversityWeight: number;
  visibility: Visibility;
  forgeResult: ForgeResult;
  participants: ForgeParticipant[];
  removedIds: Set<string>;
  groupName: string;
  groupDescription: string;
  manualInviteeIds: string[];
  coverImage: string | null;
  avatarImage: string | null;
  activityId: string | null;
  groupId: string | null;
  chatId: string | null;
  planId: string | null;
  inviteCopied: boolean;
  invitesSent: boolean;
}

export type ForgeWizardField =
  | "selectedActivity"
  | "planName"
  | "planDescription"
  | "planDate"
  | "planTime"
  | "planLocation"
  | "planLocationLat"
  | "planLocationLng"
  | "locationType"
  | "planCost"
  | "planCostAmount"
  | "planCostDetails"
  | "forgeMode"
  | "fixedSize"
  | "groupSizeMode"
  | "autoMinSize"
  | "autoMaxSize"
  | "compatibilityWeight"
  | "diversityWeight"
  | "visibility"
  | "groupName"
  | "groupDescription"
  | "manualInviteeIds"
  | "coverImage"
  | "avatarImage"
  | "activityId"
  | "groupId"
  | "chatId"
  | "planId"
  | "inviteCopied"
  | "invitesSent";

export type ForgeWizardAction =
  | { type: "reset" }
  | { type: "set-step"; step: Step; navDirection: NavDirection }
  | { type: "go-next" }
  | { type: "go-back" }
  | {
      type: "set-field";
      field: ForgeWizardField;
      value: ForgeWizardData[ForgeWizardField];
    }
  | {
      type: "apply-forge-result";
      result: ForgeResult;
      participants: ForgeParticipant[];
      activityId: string | null;
      groupId: string | null;
      chatId: string | null;
      planId: string | null;
    }
  | { type: "remove-participant"; userId: string }
  | { type: "restore-participant"; userId: string }
  | { type: "reforge" };

export function createInitialForgeWizardState(): ForgeWizardData {
  return {
    step: 1,
    navDirection: "forward",
    selectedActivity: null,
    planName: "",
    planDescription: "",
    planDate: "",
    planTime: "",
    planLocation: "",
    planLocationLat: null,
    planLocationLng: null,
    locationType: "TBD",
    planCost: "FREE",
    planCostAmount: "",
    planCostDetails: "",
    forgeMode: "AUTO",
    fixedSize: 6,
    groupSizeMode: "RANGE",
    autoMinSize: 4,
    autoMaxSize: 8,
    compatibilityWeight: 70,
    diversityWeight: 50,
    visibility: "FRIENDS_ONLY",
    forgeResult: "IDLE",
    participants: [],
    removedIds: new Set(),
    groupName: "",
    groupDescription: "",
    manualInviteeIds: [],
    coverImage: null,
    avatarImage: null,
    activityId: null,
    groupId: null,
    chatId: null,
    planId: null,
    inviteCopied: false,
    invitesSent: false,
  };
}

export function forgeWizardReducer(
  state: ForgeWizardData,
  action: ForgeWizardAction,
): ForgeWizardData {
  switch (action.type) {
    case "reset":
      return createInitialForgeWizardState();
    case "set-step":
      return {
        ...state,
        navDirection: action.navDirection,
        step: action.step,
      };
    case "go-next":
      return {
        ...state,
        navDirection: "forward",
        step: getNextStep(state.step),
      };
    case "go-back":
      return {
        ...state,
        navDirection: "back",
        step: getPreviousStep(state.step),
      };
    case "set-field":
      return {
        ...state,
        [action.field]: action.value,
      };
    case "apply-forge-result":
      return {
        ...state,
        navDirection: "forward",
        step: 4,
        forgeResult: action.result,
        participants: action.participants,
        activityId: action.activityId,
        groupId: action.groupId,
        chatId: action.chatId,
        planId: action.planId,
        removedIds: new Set(),
      };
    case "remove-participant":
      return {
        ...state,
        removedIds: new Set([...state.removedIds, action.userId]),
      };
    case "restore-participant": {
      const nextRemovedIds = new Set(state.removedIds);
      nextRemovedIds.delete(action.userId);

      return {
        ...state,
        removedIds: nextRemovedIds,
      };
    }
    case "reforge":
      return {
        ...state,
        navDirection: "back",
        step: 3,
        forgeResult: "IDLE",
        participants: [],
        manualInviteeIds: [],
        activityId: null,
        groupId: null,
        chatId: null,
        planId: null,
        removedIds: new Set(),
      };
    default:
      return state;
  }
}

function getNextStep(step: Step): Step {
  if (step === 1) return 2;
  if (step === 2) return 3;
  if (step === 3) return 4;
  if (step === 4) return 5;
  if (step === 5) return 6;
  return step;
}

function getPreviousStep(step: Step): Step {
  if (step === 2) return 1;
  if (step === 3) return 2;
  if (step === 5) return 4;
  if (step === 6) return 5;
  return step;
}

export { getNextStep, getPreviousStep };
