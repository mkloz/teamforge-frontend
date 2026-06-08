import type { ForgeWizardState } from "@/features/forge/hooks/use-forge-wizard";

export function getForgeStepMetadata(fw: ForgeWizardState) {
  const metadata = {
    1: {
      hint: "Pick a category or describe it in your own words",
      sub: "Activity Selection",
      title: "What are we doing?",
    },
    2: {
      hint: "Templates save you the planning — edit anything after",
      sub: "Suggested Templates",
      title: "Pick a starting point",
    },
    3: {
      hint: "Vague is fine — your group will lock in the final details",
      sub: "Planning Details",
      title: "When and where?",
    },
    4: {
      hint: "Forge selects based on your personality and interests",
      sub: "Group Preferences",
      title: "Who are we looking for?",
    },
    5: {
      hint:
        fw.forgeResult === "FAILED"
          ? "Try a wider time window or a different activity"
          : "Here's why they fit",
      sub: fw.forgeResult === "FAILED" ? "Let's try adjusting" : "Success",
      title: fw.forgeResult === "FAILED" ? "No group yet" : "We found a group!",
    },
    6: {
      hint: "You can change this anytime from the group settings",
      sub: "Group Identity",
      title: "Give it a look",
    },
    7: {
      hint: "Skip this step — they'll find you in the activity feed",
      sub: "Invitations",
      title: "Ready to go!",
    },
  } as const;

  return metadata[fw.step] || { hint: "", sub: "", title: "" };
}
