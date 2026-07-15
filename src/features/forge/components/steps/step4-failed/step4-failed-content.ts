import type { ForgeMode } from "@/features/forge/lib/forge-contract";

import type { Step4FailedContent } from "./types";

const AUTO_FAILED_CONTENT = {
  description:
    "We couldn't form a group with the people available and these settings.",
  context: "Group size and balance settings affect who can be included.",
  reasons: [
    "Not enough people are available for this request.",
    "The group balance settings may be too narrow.",
    "The group size range does not fit the people available right now.",
  ],
  suggestions: [
    "Use broader group balance settings",
    "Expand the group size range",
    "Try again when more people are available",
  ],
} as const satisfies Step4FailedContent;

const MANUAL_FAILED_CONTENT = {
  description: "We couldn't form the group with the people you selected.",
  context:
    "The selected people and group size determine whether this can work.",
  reasons: [
    "Not enough people were selected for the requested group.",
    "The group size does not fit the selected invitees.",
    "The selected people cannot fill a group of this size.",
  ],
  suggestions: [
    "Invite more people",
    "Lower the selected group size",
    "Let TeamForge choose from more available people",
  ],
} as const satisfies Step4FailedContent;

export function getStep4FailedContent(
  forgeMode: ForgeMode,
): Step4FailedContent {
  return forgeMode === "AUTO" ? AUTO_FAILED_CONTENT : MANUAL_FAILED_CONTENT;
}
