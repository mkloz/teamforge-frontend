import type { ForgeMode } from "@/features/forge/lib/forge-contract";

import type { Step4FailedContent } from "./types";

const AUTO_FAILED_CONTENT = {
  description: "We couldn't start or confirm this group request.",
  context: "Review the activity details, then try the request again.",
  reasons: [
    "The request may not have reached TeamForge.",
    "Your account or activity may need another review.",
    "The request may have changed while this page was open.",
  ],
  suggestions: [
    "Review the activity details",
    "Try sending the request again",
    "Switch to manual invites",
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
