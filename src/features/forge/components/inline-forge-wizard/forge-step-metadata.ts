import type { ForgeWizardState } from "@/features/forge/hooks/use-forge-wizard";

export function getForgeStepMetadata(fw: ForgeWizardState) {
  const metadata = {
    1: {
      hint: "Pick a category or describe it in your own words",
      sub: "Activity Selection",
      title: "What are we doing?",
    },
    2: {
      hint: "Use a template or start with a blank plan.",
      sub: "Template",
      title: "Pick a starting point",
    },
    3: {
      hint:
        fw.forgeMode === "AUTO"
          ? "Choose how the group starts, then add what you know now."
          : "Choose how the group starts, then set the details.",
      sub: "Plan details",
      title: "Set the plan",
    },
    4: {
      hint:
        fw.forgeMode === "AUTO"
          ? "Check the request before starting the search."
          : "Check the group details before forming it.",
      sub: fw.forgeMode === "AUTO" ? "Review" : "Group setup",
      title:
        fw.forgeMode === "AUTO" ? "Review the request" : "Set up the group",
    },
    5: {
      hint:
        fw.forgeResult === "SEARCHING"
          ? "Home will show the current request and check timing"
          : fw.forgeResult === "FAILED"
            ? "Adjust the group settings, then try again"
            : "Review the group before continuing",
      sub:
        fw.forgeResult === "SEARCHING"
          ? "Request saved"
          : fw.forgeResult === "FAILED"
            ? "Let's try adjusting"
            : "Success",
      title:
        fw.forgeResult === "SEARCHING"
          ? "Your request is active"
          : fw.forgeResult === "FAILED"
            ? "No group yet"
            : "We found a group!",
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
