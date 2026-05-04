import { useCallback, useState } from "react";

import { captureException } from "@/shared/lib/telemetry";

import { ForgeCommands } from "@/features/forge/api/forge-commands";
import type { ForgeWizardData } from "@/features/forge/lib/forge-wizard";

import { buildForgeExecutionInput } from "./forge-execution-input";

export function useKeptForgeSearch(state: ForgeWizardData) {
  const [isKeepingSearch, setIsKeepingSearch] = useState(false);
  const [keptSearchActivityIds, setKeptSearchActivityIds] = useState<
    Set<string>
  >(new Set());

  const markSearchKept = useCallback((activityId: string) => {
    setKeptSearchActivityIds((current) => {
      const next = new Set(current);
      next.add(activityId);
      return next;
    });
  }, []);

  const handleKeepSearchingChange = useCallback(
    async (enabled: boolean) => {
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
      } finally {
        setIsKeepingSearch(false);
      }
    },
    [state],
  );

  return {
    handleKeepSearchingChange,
    isKeepingSearch,
    isSearchKept:
      Boolean(state.activityId) &&
      keptSearchActivityIds.has(state.activityId as string),
    markSearchKept,
  };
}
