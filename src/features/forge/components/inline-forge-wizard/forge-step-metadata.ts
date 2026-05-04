import type { ForgeWizardState } from "@/features/forge/hooks/use-forge-wizard";

export function getForgeStepMetadata(fw: ForgeWizardState) {
  const metadata = {
    1: { title: "What are we doing?", sub: "Activity Selection" },
    2: { title: "Pick a starting point", sub: "Suggested Templates" },
    3: { title: "When and Where?", sub: "Planning Details" },
    4: { title: "Who are we looking for?", sub: "Group Preferences" },
    5: {
      title: fw.forgeResult === "FAILED" ? "No group yet" : "We found a group!",
      sub: fw.forgeResult === "FAILED" ? "Let's try adjusting" : "Success",
    },
    6: { title: "Give it a look", sub: "Group Identity" },
    7: { title: "Ready to go!", sub: "Invitations" },
  } as const;

  return metadata[fw.step] || { title: "", sub: "" };
}
