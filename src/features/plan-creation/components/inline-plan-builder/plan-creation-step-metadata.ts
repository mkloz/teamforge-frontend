import type { PlanBuilderState } from "@/features/plan-creation/hooks/use-plan-builder";

export function getPlanCreationStepMetadata(fw: PlanBuilderState) {
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
        fw.groupFormationMode === "AUTO"
          ? "Review the request"
          : "Set up the group",
    },
    5: {
      title:
        fw.groupFormationResult === "SEARCHING"
          ? "Your request is active"
          : fw.groupFormationResult === "FAILED"
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
