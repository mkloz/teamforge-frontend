import { useCallback } from "react";

import type {
  ForgeMode,
  GroupSizeMode,
  LocationType,
  Visibility,
} from "@/features/forge/lib/forge-contract";
import { normalizeFixedGroupSize } from "@/features/forge/lib/forge-size";
import type {
  ForgeWizardData,
  ForgeWizardField,
} from "@/features/forge/lib/forge-wizard";

import type { ForgeWizardDispatch } from "./forge-wizard-hook.types";

interface UseForgeWizardFieldActionsOptions {
  dispatch: ForgeWizardDispatch;
  state: ForgeWizardData;
  syncMode: (
    mode: ForgeMode,
    options?: { history?: "push" | "replace" },
  ) => void;
}

export function useForgeWizardFieldActions({
  dispatch,
  state,
  syncMode,
}: UseForgeWizardFieldActionsOptions) {
  const setField = useCallback(
    (field: ForgeWizardField, value: ForgeWizardData[ForgeWizardField]) => {
      dispatch({
        type: "set-field",
        field,
        value,
      });
    },
    [dispatch],
  );

  const setSelectedActivity = useCallback(
    (value: string | null) => setField("selectedActivity", value),
    [setField],
  );
  const setPlanName = useCallback(
    (value: string) => setField("planName", value),
    [setField],
  );
  const setPlanDescription = useCallback(
    (value: string) => setField("planDescription", value),
    [setField],
  );
  const setGroupName = useCallback(
    (value: string) => setField("groupName", value),
    [setField],
  );
  const setGroupDescription = useCallback(
    (value: string) => setField("groupDescription", value),
    [setField],
  );
  const setPlanDate = useCallback(
    (value: string) => setField("planDate", value),
    [setField],
  );
  const setPlanTime = useCallback(
    (value: string) => setField("planTime", value),
    [setField],
  );
  const setPlanLocation = useCallback(
    (value: string) => setField("planLocation", value),
    [setField],
  );
  const setPlanLocationCoordinates = useCallback(
    (lat: number | null, lng: number | null) => {
      setField("planLocationLat", lat);
      setField("planLocationLng", lng);
    },
    [setField],
  );
  const setLocationType = useCallback(
    (value: LocationType) => setField("locationType", value),
    [setField],
  );
  const setPlanCost = useCallback(
    (value: "FREE" | "PAID") => {
      setField("planCost", value);
      if (value === "FREE") {
        setField("planCostAmount", "");
      }
    },
    [setField],
  );
  const setPlanCostAmount = useCallback(
    (value: string) => setField("planCostAmount", value),
    [setField],
  );
  const setPlanCostDetails = useCallback(
    (value: string) => setField("planCostDetails", value),
    [setField],
  );
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
  const setCompatibilityWeight = useCallback(
    (value: number) => setField("compatibilityWeight", value),
    [setField],
  );
  const setDiversityWeight = useCallback(
    (value: number) => setField("diversityWeight", value),
    [setField],
  );
  const setVisibility = useCallback(
    (value: Visibility) => setField("visibility", value),
    [setField],
  );
  const setCoverImage = useCallback(
    (value: string | null) => setField("coverImage", value),
    [setField],
  );
  const setAvatarImage = useCallback(
    (value: string | null) => setField("avatarImage", value),
    [setField],
  );
  const setInvitesSent = useCallback(
    (value: boolean) => setField("invitesSent", value),
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
    setField,
    setSelectedActivity,
    setPlanName,
    setPlanDescription,
    setGroupName,
    setGroupDescription,
    setPlanDate,
    setPlanTime,
    setPlanLocation,
    setPlanLocationCoordinates,
    setLocationType,
    setPlanCost,
    setPlanCostAmount,
    setPlanCostDetails,
    setForgeMode,
    setFixedSize,
    setGroupSizeMode,
    setAutoMinSize,
    setAutoMaxSize,
    setCompatibilityWeight,
    setDiversityWeight,
    setVisibility,
    setCoverImage,
    setAvatarImage,
    setInvitesSent,
    toggleManualInvitee,
  };
}
