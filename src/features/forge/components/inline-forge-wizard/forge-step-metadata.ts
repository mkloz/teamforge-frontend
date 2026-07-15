import type { ForgeWizardState } from "@/features/forge/hooks/use-forge-wizard";

export function getForgeStepMetadata(fw: ForgeWizardState) {
  const metadata = {
    1: {
      hint: "Pick a category or describe it in your own words",
      sub: "Activity Selection",
      title: "What are we doing?",
    },
    2: {
      hint: "Choose a template, then edit any detail.",
      sub: "Suggested Templates",
      title: "Pick a starting point",
    },
    3: {
      hint: "Add what you know now. The group can decide the rest.",
      sub: "Planning Details",
      title: "When and where?",
    },
    4: {
      hint: "TeamForge uses your profile and group preferences",
      sub: "Group Preferences",
      title: "Who are we looking for?",
    },
    5: {
      hint:
        fw.forgeResult === "FAILED"
          ? "Adjust the group settings, then try again"
          : "Review the group before continuing",
      sub: fw.forgeResult === "FAILED" ? "Let's try adjusting" : "Success",
      title: fw.forgeResult === "FAILED" ? "No group yet" : "We found a group!",
    },
    6: {
      hint: "You can change this anytime from the group settings",
      sub: "Group Details",
      title: "Give it a look",
    },
    7: {
      hint: "Invitations are optional. Members can also find the group in Activity.",
      sub: "Invitations",
      title: "Ready to go!",
    },
  } as const;

  return metadata[fw.step] || { hint: "", sub: "", title: "" };
}
