import { useState } from "react";
import { ForgeCommands } from "@/features/forge/api/forge-commands";
import type { ForgeWizardData } from "@/features/forge/lib/forge-wizard";
import { captureException } from "@/shared/lib/telemetry";

import { buildForgeExecutionInput } from "./forge-execution-input";

export function useKeptForgeSearch(state: ForgeWizardData) {
  const [isKeepingSearch, setIsKeepingSearch] = useState(false);
  const [keptSearchActivityIds, setKeptSearchActivityIds] = useState<
    Set<string>
  >(new Set());

  function markSearchKept(activityId: string) {
    setKeptSearchActivityIds((current) => {
      const next = new Set(current);
      next.add(activityId);
      return next;
    });
  }

  async function handleKeepSearchingChange(enabled: boolean) {
    if (!state.activityId) {
      return;
    }

    const activityId = state.activityId;

    setKeptSearchActivityIds((current) => {
      const next = new Set(current);

      if (enabled) {
        next.add(activityId);
      } else {
        next.delete(activityId);
      }

      return next;
    });
    setIsKeepingSearch(true);

    try {
      if (enabled) {
        await ForgeCommands.keepSearching({
          activityId,
          forgeInput: buildForgeExecutionInput(state),
        });
      } else {
        await ForgeCommands.stopSearching(activityId);
      }
      setIsKeepingSearch(false);
    } catch (error) {
      setKeptSearchActivityIds((current) => {
        const next = new Set(current);

        if (enabled) {
          next.delete(activityId);
        } else {
          next.add(activityId);
        }

        return next;
      });
      captureException("forge.keepSearching", error, {
        activityId,
        enabled,
      });
      setIsKeepingSearch(false);
    }
  }

  return {
    handleKeepSearchingChange,
    isKeepingSearch,
    isSearchKept: state.activityId
      ? keptSearchActivityIds.has(state.activityId)
      : false,
    markSearchKept,
  };
}
