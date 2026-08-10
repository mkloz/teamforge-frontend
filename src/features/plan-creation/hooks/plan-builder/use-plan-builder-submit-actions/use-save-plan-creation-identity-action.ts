import { useState } from "react";

import { PlanCreationCommands } from "@/features/plan-creation/api/plan-creation-commands";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { captureException } from "@/shared/lib/telemetry";

import type { UsePlanBuilderSubmitActionsOptions } from "./types";

type UseSavePlanCreationIdentityActionOptions = Pick<
  UsePlanBuilderSubmitActionsOptions,
  "goNext" | "state"
>;

export function useSavePlanCreationIdentityAction({
  goNext,
  state,
}: UseSavePlanCreationIdentityActionOptions) {
  const [isSavingIdentity, setIsSavingIdentity] = useState(false);
  const { guardOfflineAction } = useOfflineActionGuard();

  async function handleSaveIdentityAndContinue() {
    if (
      guardOfflineAction({
        id: "plan-creation-identity-save-offline",
        description: "Reconnect before saving group details.",
      })
    ) {
      return;
    }

    setIsSavingIdentity(true);

    try {
      await PlanCreationCommands.saveGroupIdentity({
        groupId: state.groupId,
        planId: state.planId,
        groupName: state.groupName,
        groupDescription: state.groupDescription,
        avatarImage: state.avatarImage,
        coverImage: state.coverImage,
      });
      goNext();
      setIsSavingIdentity(false);
    } catch (error) {
      captureException("planCreation.saveIdentity", error, {
        groupId: state.groupId ?? "missing",
      });
      goNext();
      setIsSavingIdentity(false);
    }
  }

  return {
    handleSaveIdentityAndContinue,
    isSavingIdentity,
  };
}
