import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { ActivityCommands } from "@/features/activity/api/activity-commands";
import type { Group } from "@/features/activity/lib/activity-contract";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
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
    planDescription,
    planLocation,
    planLocationLat,
    planLocationLng,
    planLocationMode,
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
  const canSaveGroupDetails =
    isNameValid &&
    hasGroupDetailsChanges &&
    !isBusy &&
    !avatarUpload.isUploading;
  const canSavePlanDetails =
    isPlanValid && hasPlanDetailsChanges && !isBusy && !coverUpload.isUploading;
  const canSave =
    hasChanges &&
    isNameValid &&
    isPlanValid &&
    !isBusy &&
    !avatarUpload.isUploading &&
    !coverUpload.isUploading;

  function save() {
    setError(null);
    void mutation.mutateAsync(values);
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
    isPlanValid,
    isSaving: mutation.isPending,
    name,
    planCategory,
    planCost,
    planCostAmount,
    planCostDetails,
    planDateTime,
    planDescription,
    planLocation,
    planLocationLat,
    planLocationLng,
    planLocationMode,
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
    setPlanDateTime,
    setPlanDescription,
    setPlanLocation,
    setPlanLocationLat,
    setPlanLocationLng,
    setPlanLocationMode,
    setPlanTitle,
  };
}
