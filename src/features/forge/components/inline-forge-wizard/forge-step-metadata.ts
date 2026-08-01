import type { ForgeWizardState } from "@/features/forge/hooks/use-forge-wizard";

export function getForgeStepMetadata(fw: ForgeWizardState) {
  const metadata = {
    1: {
      title: "What are we doing?",
    },
    2: {
      title: "Pick a starting point",
    },
    3: {
      title: "Set the plan",
    },
    4: {
      title:
        fw.forgeMode === "AUTO" ? "Review the request" : "Set up the group",
    },
    5: {
      title:
        fw.forgeResult === "SEARCHING"
          ? "Your request is active"
          : fw.forgeResult === "FAILED"
            ? "No group yet"
            : "Group ready",
    },
    6: {
      title: "Group details",
    },
    7: {
      title: "Ready to go!",
    },
  } as const;

  return metadata[fw.step] || { title: "" };
}
