import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { AuthQueries } from "@/features/auth/api/auth.queries";
import type { Gender } from "@/shared/schemas/enums";
import { SettingsQueries } from "../api/settings.queries";
import {
  settingsProfileSchema,
  type SettingsProfileValues,
} from "../schemas/settings-profile.schema";

function toNullableText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toNullableAge(value: string) {
  if (!value.trim()) {
    return null;
  }

  return Number(value);
}

function toNullableGender(value: SettingsProfileValues["gender"]) {
  return value || null;
}

export function useSettingsProfileForm() {
  const {
    data: currentUser,
    isLoading,
    isError,
    refetch,
  } = AuthQueries.useCurrentUser();
  const invalidateCurrentUser = AuthQueries.useInvalidateCurrentUser();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const form = useForm<SettingsProfileValues>({
    resolver: zodResolver(settingsProfileSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      age: "",
      gender: "",
      city: "",
      bio: "",
    },
  });

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    form.reset({
      name: currentUser.name,
      age: currentUser.age ? String(currentUser.age) : "",
      gender: currentUser.gender ?? "",
      city: currentUser.city ?? "",
      bio: currentUser.bio ?? "",
    });
  }, [currentUser, form]);

  const profileMutation = useMutation({
    mutationFn: SettingsQueries.updateProfile,
    onSuccess: async () => {
      await invalidateCurrentUser();
      setSaveError(null);
      setSaveMessage("Profile updated.");
    },
    onError: () => {
      setSaveMessage(null);
      setSaveError("We couldn't save your changes. Please try again.");
    },
  });

  const avatarMutation = useMutation({
    mutationFn: SettingsQueries.uploadAvatar,
    onSuccess: async () => {
      await invalidateCurrentUser();
      setAvatarError(null);
      setAvatarMessage("Profile photo updated.");
    },
    onError: () => {
      setAvatarMessage(null);
      setAvatarError("We couldn't upload that image. Please try again.");
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSaveMessage(null);
    setSaveError(null);

    await profileMutation.mutateAsync({
      name: values.name.trim(),
      bio: toNullableText(values.bio),
      age: toNullableAge(values.age),
      gender: toNullableGender(values.gender) as Gender | null,
      city: toNullableText(values.city),
    });
  });

  const profileSummary = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    return [
      {
        label: "Email",
        value: currentUser.email,
      },
      {
        label: "Provider",
        value: currentUser.authProvider === "GOOGLE" ? "Google" : "Email",
      },
      {
        label: "Verification",
        value: currentUser.emailVerified ? "Verified" : "Pending",
      },
      {
        label: "Member Since",
        value: new Date(currentUser.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      },
    ];
  }, [currentUser]);

  return {
    currentUser,
    form,
    isLoading,
    isError,
    refetch,
    onSubmit,
    isSaving: profileMutation.isPending,
    isUploadingAvatar: avatarMutation.isPending,
    saveMessage,
    saveError,
    avatarMessage,
    avatarError,
    profileSummary,
    uploadAvatar: (file: File) => {
      setAvatarMessage(null);
      setAvatarError(null);
      return avatarMutation.mutateAsync(file);
    },
  };
}
