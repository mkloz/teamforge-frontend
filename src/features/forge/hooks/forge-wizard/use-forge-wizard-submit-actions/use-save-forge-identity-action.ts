import { useCallback, useState } from "react";

import { ForgeCommands } from "@/features/forge/api/forge-commands";
import { captureException } from "@/shared/lib/telemetry";

import type { UseForgeWizardSubmitActionsOptions } from "./types";

type UseSaveForgeIdentityActionOptions = Pick<
  UseForgeWizardSubmitActionsOptions,
  "goNext" | "state"
>;

export function useSaveForgeIdentityAction({
  goNext,
  state,
}: UseSaveForgeIdentityActionOptions) {
  const [isSavingIdentity, setIsSavingIdentity] = useState(false);

  const handleSaveIdentityAndContinue = useCallback(async () => {
    setIsSavingIdentity(true);

    try {
      await ForgeCommands.saveForgedIdentity({
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
      captureException("forge.saveIdentity", error, {
        groupId: state.groupId ?? "missing",
      });
      goNext();
      setIsSavingIdentity(false);
    }
  }, [
    goNext,
    state.avatarImage,
    state.coverImage,
    state.groupDescription,
    state.groupId,
    state.groupName,
    state.planId,
  ]);

  return {
    handleSaveIdentityAndContinue,
    isSavingIdentity,
  };
}
