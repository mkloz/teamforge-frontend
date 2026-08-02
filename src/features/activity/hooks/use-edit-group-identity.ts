import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { ActivityCommands } from "@/features/activity/api/activity-commands";
import type { Group } from "@/features/activity/lib/activity-contract";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { getBrowserTimeZone } from "@/shared/lib/plan-schedule";
import {
  buildGroupIdentityUpdateInput,
  type GroupIdentityFormValues,
  getInitialGroupIdentityValues,
  hasGroupIdentityChanges,
  hasGroupIdentityDetailsChanges,
  hasGroupPlanDetailsChanges,
  isGroupIdentityNameValid,
  isGroupPlanValid,
} from "./group-identity/group-identity-form-state";
import { useImageUploadField } from "./group-identity/use-image-upload-field";

interface UseEditGroupIdentityOptions {
  onSaved?: () => void;
}

interface GroupIdentitySaveAvailabilityInput {
  hasChanges: boolean;
  hasGroupDetailsChanges: boolean;
  hasPlanDetailsChanges: boolean;
  isAvatarUploading: boolean;
  isBusy: boolean;
  isCoverUploading: boolean;
  isNameValid: boolean;
  isOnline: boolean;
  isPlanValid: boolean;
}

function allConditionsPass(conditions: boolean[]) {
  return conditions.every(Boolean);
}

function getGroupIdentitySaveAvailability({
  hasChanges,
  hasGroupDetailsChanges,
  hasPlanDetailsChanges,
  isAvatarUploading,
  isBusy,
  isCoverUploading,
  isNameValid,
  isOnline,
  isPlanValid,
}: GroupIdentitySaveAvailabilityInput) {
  const canUseNetwork = isOnline && !isBusy;

  return {
    canSave: allConditionsPass([
      hasChanges,
      isNameValid,
      isPlanValid,
      canUseNetwork,
      !isAvatarUploading,
      !isCoverUploading,
    ]),
    canSaveGroupDetails: allConditionsPass([
      isNameValid,
      hasGroupDetailsChanges,
      canUseNetwork,
      !isAvatarUploading,
    ]),
    canSavePlanDetails: allConditionsPass([
      isPlanValid,
      hasPlanDetailsChanges,
      canUseNetwork,
      !isCoverUploading,
    ]),
  };
}

export function useEditGroupIdentity(
  group: Group,
  { onSaved }: UseEditGroupIdentityOptions = {},
) {
  const initialValues = getInitialGroupIdentityValues(group);
  const [name, setName] = useState(initialValues.name);
  const [description, setDescription] = useState(initialValues.description);
  const [avatar, setAvatar] = useState(initialValues.avatar);
  const [coverImage, setCoverImage] = useState(initialValues.coverImage);
  const [planTitle, setPlanTitle] = useState(initialValues.planTitle);
  const [planDescription, setPlanDescription] = useState(
    initialValues.planDescription,
  );
  const [planCategory, setPlanCategory] = useState(initialValues.planCategory);
  const [planDateTime, setPlanDateTime] = useState(initialValues.planDateTime);
  const [planDurationMinutes, setPlanDurationMinutes] = useState(
    initialValues.planDurationMinutes,
  );
  const [planScheduleFold, setPlanScheduleFold] = useState(
    initialValues.planScheduleFold,
  );
  const [planScheduleTouched, setPlanScheduleTouched] = useState(false);
  const [planTimeZoneId, setPlanTimeZoneId] = useState(
    initialValues.planTimeZoneId,
  );
  const [planLocationMode, setPlanLocationMode] = useState(
    initialValues.planLocationMode,
  );
  const [planLocation, setPlanLocation] = useState(initialValues.planLocation);
  const [planLocationLat, setPlanLocationLat] = useState(
    initialValues.planLocationLat,
  );
  const [planLocationLng, setPlanLocationLng] = useState(
    initialValues.planLocationLng,
  );
  const [planCost, setPlanCost] = useState(initialValues.planCost);
  const [planCostAmount, setPlanCostAmount] = useState(
    initialValues.planCostAmount,
  );
  const [planCostDetails, setPlanCostDetails] = useState(
    initialValues.planCostDetails,
  );
  const [error, setError] = useState<string | null>(null);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const avatarUpload = useImageUploadField(setAvatar);
  const coverUpload = useImageUploadField(setCoverImage);
  const values: GroupIdentityFormValues = {
    avatar,
    coverImage,
    description,
    name,
    planCategory,
    planCost,
    planCostAmount,
    planCostDetails,
    planDateTime,
    planDurationMinutes,
    planDescription,
    planLocation,
    planLocationLat,
    planLocationLng,
    planLocationMode,
    planScheduleFold,
    planScheduleTouched,
    planTimeZoneId,
    planTitle,
  };

  const mutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't save those changes. Please try again.",
    },
    mutationKey: ["activity", "group-identity", "update", group.id],
    mutationFn: (nextValues: GroupIdentityFormValues) =>
      ActivityCommands.updateGroupIdentity(
        buildGroupIdentityUpdateInput(group, nextValues),
      ),
    onSuccess: () => {
      setError(null);
      onSaved?.();
    },
    onError: (mutationError) => {
      setError(
        getApiErrorMessage(
          mutationError,
          "We couldn't save those changes. Please try again.",
        ),
      );
    },
  });

  const isNameValid = isGroupIdentityNameValid(name);
  const isPlanValid = !group.plan || isGroupPlanValid(values);
  const hasChanges = hasGroupIdentityChanges(group, values);
  const hasGroupDetailsChanges = hasGroupIdentityDetailsChanges(group, values);
  const hasPlanDetailsChanges = hasGroupPlanDetailsChanges(group, values);
  const isBusy = mutation.isPending;
  const { canSave, canSaveGroupDetails, canSavePlanDetails } =
    getGroupIdentitySaveAvailability({
      hasChanges,
      hasGroupDetailsChanges,
      hasPlanDetailsChanges,
      isAvatarUploading: avatarUpload.isUploading,
      isBusy,
      isCoverUploading: coverUpload.isUploading,
      isNameValid,
      isOnline,
      isPlanValid,
    });

  function save() {
    setError(null);
    if (
      guardOfflineAction({
        id: "activity-group-identity-save-offline",
        description: "Reconnect before saving group details.",
      })
    ) {
      setError("You are offline. Reconnect before saving group details.");
      return;
    }

    void mutation.mutateAsync(values);
  }

  function updatePlanDateTime(value: string) {
    setPlanScheduleTouched(true);
    setPlanDateTime(value);
    setPlanScheduleFold(0);
    if (value && !planTimeZoneId) {
      setPlanTimeZoneId(getBrowserTimeZone());
    }
    if (value && !planDurationMinutes) {
      setPlanDurationMinutes("90");
    }
  }

  function updatePlanTimeZoneId(value: string) {
    setPlanScheduleTouched(true);
    setPlanTimeZoneId(value);
    setPlanScheduleFold(0);
  }

  function updatePlanDurationMinutes(value: string) {
    setPlanScheduleTouched(true);
    setPlanDurationMinutes(value);
  }

  function updatePlanScheduleFold(value: number) {
    setPlanScheduleTouched(true);
    setPlanScheduleFold(value);
  }

  return {
    avatar,
    avatarUploadError: avatarUpload.error,
    canSave,
    canSaveGroupDetails,
    canSavePlanDetails,
    coverImage,
    coverUploadError: coverUpload.error,
    description,
    error,
    handleAvatarFiles: avatarUpload.handleFiles,
    handleCoverFiles: coverUpload.handleFiles,
    hasChanges,
    hasGroupDetailsChanges,
    hasPlanDetailsChanges,
    isAvatarUploading: avatarUpload.isUploading,
    isCoverUploading: coverUpload.isUploading,
    isNameValid,
    isOnline,
    isPlanValid,
    isSaving: mutation.isPending,
    name,
    planCategory,
    planCost,
    planCostAmount,
    planCostDetails,
    planDateTime,
    planDurationMinutes,
    planDescription,
    planLocation,
    planLocationLat,
    planLocationLng,
    planLocationMode,
    planScheduleFold,
    planScheduleTouched,
    planTimeZoneId,
    planTitle,
    save,
    setAvatar,
    setCoverImage,
    setDescription,
    setName,
    setPlanCategory,
    setPlanCost,
    setPlanCostAmount,
    setPlanCostDetails,
    setPlanDateTime: updatePlanDateTime,
    setPlanDurationMinutes: updatePlanDurationMinutes,
    setPlanDescription,
    setPlanLocation,
    setPlanLocationLat,
    setPlanLocationLng,
    setPlanLocationMode,
    setPlanScheduleFold: updatePlanScheduleFold,
    setPlanTimeZoneId: updatePlanTimeZoneId,
    setPlanTitle,
  };
}
