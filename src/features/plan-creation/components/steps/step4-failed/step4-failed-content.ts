import type { GroupFormationMode } from "@/features/plan-creation/lib/plan-creation-contract";

import type { Step4FailedContent } from "./types";

const AUTO_FAILED_CONTENT = {
  title: "We couldn't complete the search",
  description:
    "No group was changed. Your plan is still here and ready to adjust.",
  context: "Review the activity details, then try the request again.",
  reasons: [
    "The request may not have reached Findafew.",
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
  title: "This group needs a different lineup",
  description:
    "Nobody was added. Your plan and selected people are still here.",
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
    "Let Findafew choose from more available people",
  ],
} as const satisfies Step4FailedContent;

export function getStep4FailedContent(
  groupFormationMode: GroupFormationMode,
): Step4FailedContent {
  return groupFormationMode === "AUTO"
    ? AUTO_FAILED_CONTENT
    : MANUAL_FAILED_CONTENT;
}
