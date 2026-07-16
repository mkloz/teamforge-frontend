import { SearchStarted } from "@/features/forge/components/steps/search-started";
import { Step4Failed } from "@/features/forge/components/steps/step4-failed";
import { Step4Success } from "@/features/forge/components/steps/step4-success";

import type { CurrentForgeStepProps } from "./types";

type ResultStepPanelProps = Pick<CurrentForgeStepProps, "actions" | "fw">;

export function ResultStepPanel({ actions, fw }: ResultStepPanelProps) {
  if (fw.forgeResult === "SEARCHING") {
    return <SearchStarted activityTitle={fw.selectedActivity ?? fw.planName} />;
  }

  if (fw.forgeResult === "SUCCESS") {
    return (
      <Step4Success planTitle={fw.planName} participants={fw.participants} />
    );
  }

  if (fw.forgeResult === "FAILED") {
    return (
      <Step4Failed
        forgeMode={fw.forgeMode}
        isKeepSearchingEnabled={fw.isSearchKept}
        isKeepingSearch={fw.isKeepingSearch}
        onKeepSearchingChange={
          fw.activityId ? fw.handleKeepSearchingChange : undefined
        }
        onSwitchToManual={actions.switchFailedForgeToManual}
      />
    );
  }

  return null;
}
