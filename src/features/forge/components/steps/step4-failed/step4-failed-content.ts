import type { ForgeMode } from "@/features/forge/lib/forge-contract";

import type { Step4FailedContent } from "./types";

const AUTO_FAILED_CONTENT = {
  description:
    "The current pool did not produce a balanced group with these preferences.",
  context: "Only pool size and group balance preferences are considered here.",
  reasons: [
    "The current candidate pool is too small for this request.",
    "Group balance preferences are too narrow for the available pool.",
    "The group size range does not fit the candidates available right now.",
  ],
  suggestions: [
    "Loosen group balance preferences",
    "Expand the group size range",
    "Try again when more candidates are available",
  ],
} as const satisfies Step4FailedContent;

const MANUAL_FAILED_CONTENT = {
  description:
    "The manual group request could not be completed with the selected invite pool.",
  context: "Only invite pool and group size are considered here.",
  reasons: [
    "The current invite pool is too small for the requested group.",
    "The selected group size does not fit the available invitees.",
    "The request could not create a valid group from this pool.",
  ],
  suggestions: [
    "Invite more people",
    "Lower the selected group size",
    "Switch to Automatic mode to use the wider candidate pool",
  ],
} as const satisfies Step4FailedContent;

export function getStep4FailedContent(
  forgeMode: ForgeMode,
): Step4FailedContent {
  return forgeMode === "AUTO" ? AUTO_FAILED_CONTENT : MANUAL_FAILED_CONTENT;
}
