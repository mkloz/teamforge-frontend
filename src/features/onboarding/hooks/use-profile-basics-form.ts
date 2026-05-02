import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { OnboardingCache } from "@/features/onboarding/api/onboarding-cache";
import { OnboardingCommands } from "@/features/onboarding/api/onboarding-commands";
import { useOnboardingFlowState } from "@/features/onboarding/lib/onboarding-flow-state";
import {
  profileBasicsSchema,
  type ProfileBasicsValues,
} from "@/features/onboarding/schemas/profile-basics.schema";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { getPostAuthRedirectPath } from "@/shared/lib/post-auth-route";

function buildFlowSearch({
  returnTo,
  returnSearch,
  returnSection,
}: ReturnType<typeof useOnboardingFlowState>) {
  return {
    ...(returnTo ? { returnTo } : {}),
    ...(returnSearch ? { returnSearch } : {}),
    ...(returnSection ? { returnSection } : {}),
  };
}

export function useProfileBasicsForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const flowState = useOnboardingFlowState();
  const { data: currentUser } = useCurrentUserQuery();
  const [saveError, setSaveError] = useState<string | null>(null);

  const form = useForm<ProfileBasicsValues>({
    resolver: zodResolver(profileBasicsSchema),
    mode: "onBlur",
    defaultValues: {
      age: "",
      gender: "",
      city: "",
      locationLat: null,
      locationLng: null,
    },
  });
  const watchedValues = useWatch({ control: form.control });

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    form.reset({
      age: currentUser.age ? String(currentUser.age) : "",
      gender: currentUser.gender ?? "",
      city: currentUser.city ?? "",
      locationLat: currentUser.locationLat ?? null,
      locationLng: currentUser.locationLng ?? null,
    });
  }, [currentUser, form]);

  const profileBasicsMutation = useMutation({
    mutationFn: OnboardingCommands.updateProfileBasics,
    onSuccess: (updatedUser) => {
      OnboardingCache.setCurrentUser(queryClient, updatedUser);
    },
  });

  const filledProfileFields = [
    watchedValues.age?.trim().length ? true : false,
    Boolean(watchedValues.gender),
    watchedValues.city?.trim().length ? true : false,
  ].filter(Boolean).length;

  const progress = filledProfileFields / 3;

  const onSubmit = form.handleSubmit(async (values) => {
    setSaveError(null);

    if (!values.gender) {
      return;
    }

    try {
      const updatedUser = await profileBasicsMutation.mutateAsync({
        age: Number(values.age),
        gender: values.gender,
        city: values.city.trim(),
        locationLat: values.locationLat,
        locationLng: values.locationLng,
      });
      const nextDestination = getPostAuthRedirectPath(updatedUser);
      const nextSearch = buildFlowSearch(flowState);

      await navigate({
        to:
          nextDestination === "/onboarding/profile"
            ? "/onboarding/personality"
            : nextDestination,
        search: Object.keys(nextSearch).length > 0 ? nextSearch : undefined,
      });
    } catch (error) {
      setSaveError(
        getApiErrorMessage(
          error,
          "We couldn't save those details. Please try again.",
        ),
      );
    }
  });

  return {
    form,
    watchedValues,
    progress,
    saveError,
    isSaving: profileBasicsMutation.isPending,
    onSubmit,
  };
}
