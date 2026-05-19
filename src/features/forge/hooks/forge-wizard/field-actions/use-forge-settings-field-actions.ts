import { useCallback } from "react";

import type {
  ForgeMode,
  GroupSizeMode,
  Visibility,
} from "@/features/forge/lib/forge-contract";
import {
  normalizeFixedGroupSize,
  normalizeGroupSizeRange,
} from "@/features/forge/lib/forge-size";

import type { ForgeSettingsFieldActionOptions } from "./types";

export function useForgeSettingsFieldActions({
  setField,
  state,
  syncMode,
}: ForgeSettingsFieldActionOptions) {
  const setForgeMode = useCallback(
    (value: ForgeMode) => {
      setField("forgeMode", value);
      syncMode(value, { history: "replace" });
    },
    [setField, syncMode],
  );

  const setFixedSize = useCallback(
    (value: number) => {
      const nextSize = normalizeFixedGroupSize(value);
      setField("fixedSize", nextSize);

      if (state.manualInviteeIds.length > nextSize - 1) {
        setField(
          "manualInviteeIds",
          state.manualInviteeIds.slice(0, nextSize - 1),
        );
      }
    },
    [setField, state.manualInviteeIds],
  );

  const setGroupSizeMode = useCallback(
    (value: GroupSizeMode) => setField("groupSizeMode", value),
    [setField],
  );
  const setAutoMinSize = useCallback(
    (value: number) => setField("autoMinSize", normalizeFixedGroupSize(value)),
    [setField],
  );
  const setAutoMaxSize = useCallback(
    (value: number) => setField("autoMaxSize", normalizeFixedGroupSize(value)),
    [setField],
  );
  const setAutoSizeRange = useCallback(
    (minSize: number, maxSize: number) => {
      const range = normalizeGroupSizeRange(minSize, maxSize);

      setField("autoMinSize", range.min);
      setField("autoMaxSize", range.max);
    },
    [setField],
  );
  const setCompatibilityWeight = useCallback(
    (value: number) => setField("compatibilityWeight", value),
    [setField],
  );
  const setDiversityWeight = useCallback(
    (value: number) => setField("diversityWeight", value),
    [setField],
  );
  const setNetworkReachWeight = useCallback(
    (value: number) => setField("networkReachWeight", value),
    [setField],
  );
  const setMaxDistanceKm = useCallback(
    (value: number) => setField("maxDistanceKm", value),
    [setField],
  );
  const setVisibility = useCallback(
    (value: Visibility) => setField("visibility", value),
    [setField],
  );
  const toggleManualInvitee = useCallback(
    (inviteeId: string) => {
      const alreadySelected = state.manualInviteeIds.includes(inviteeId);
      const nextInviteeIds = alreadySelected
        ? state.manualInviteeIds.filter((id) => id !== inviteeId)
        : state.manualInviteeIds.length < state.fixedSize - 1
          ? [...state.manualInviteeIds, inviteeId]
          : state.manualInviteeIds;

      setField("manualInviteeIds", nextInviteeIds);
    },
    [setField, state.fixedSize, state.manualInviteeIds],
  );

  return {
    setAutoMaxSize,
    setAutoMinSize,
    setAutoSizeRange,
    setCompatibilityWeight,
    setDiversityWeight,
    setFixedSize,
    setForgeMode,
    setGroupSizeMode,
    setMaxDistanceKm,
    setNetworkReachWeight,
    setVisibility,
    toggleManualInvitee,
  };
}
