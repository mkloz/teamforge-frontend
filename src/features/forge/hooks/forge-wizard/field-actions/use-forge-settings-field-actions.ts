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
  function setForgeMode(value: ForgeMode) {
    setField("forgeMode", value);
    setField("planScheduleMode", value === "AUTO" ? "TO_BE_DECIDED" : "FIXED");

    if (value === "AUTO") {
      setField("planDate", "");
      setField("planTime", "");
    }

    syncMode(value, { history: "replace" });
  }

  function setFixedSize(value: number) {
    const nextSize = normalizeFixedGroupSize(value);
    setField("fixedSize", nextSize);

    if (state.manualInviteeIds.length > nextSize - 1) {
      setField(
        "manualInviteeIds",
        state.manualInviteeIds.slice(0, nextSize - 1),
      );
    }
  }

  function setGroupSizeMode(value: GroupSizeMode) {
    setField("groupSizeMode", value);
  }

  function setAutoMinSize(value: number) {
    setField("autoMinSize", normalizeFixedGroupSize(value));
  }

  function setAutoMaxSize(value: number) {
    setField("autoMaxSize", normalizeFixedGroupSize(value));
  }

  function setAutoSizeRange(minSize: number, maxSize: number) {
    const range = normalizeGroupSizeRange(minSize, maxSize);

    setField("autoMinSize", range.min);
    setField("autoMaxSize", range.max);
  }

  function setCompatibilityWeight(value: number) {
    setField("compatibilityWeight", value);
  }

  function setDiversityWeight(value: number) {
    setField("diversityWeight", value);
  }

  function setNetworkReachWeight(value: number) {
    setField("networkReachWeight", value);
  }

  function setMaxDistanceKm(value: number) {
    setField("maxDistanceKm", value);
  }

  function setVisibility(value: Visibility) {
    setField("visibility", value);
  }

  function toggleManualInvitee(inviteeId: string) {
    const alreadySelected = state.manualInviteeIds.includes(inviteeId);
    const nextInviteeIds = alreadySelected
      ? state.manualInviteeIds.filter((id) => id !== inviteeId)
      : state.manualInviteeIds.length < state.fixedSize - 1
        ? [...state.manualInviteeIds, inviteeId]
        : state.manualInviteeIds;

    setField("manualInviteeIds", nextInviteeIds);
  }

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
