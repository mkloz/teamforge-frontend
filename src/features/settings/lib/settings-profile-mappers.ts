import type { UpdateSettingsProfileDto } from "@/features/settings/api/settings.api";
import {
  type SettingsProfileValues,
  unspecifiedGenderValue,
} from "@/features/settings/schemas/settings-profile.schema";
import type { Gender, User } from "@/shared/schemas";

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

function toNullableGender(
  value: SettingsProfileValues["gender"],
): Gender | null {
  return value && value !== unspecifiedGenderValue ? value : null;
}

export function buildSettingsProfileFormValues(
  user: User,
): SettingsProfileValues {
  return {
    name: user.name,
    age: toSettingsProfileAgeValue(user.age),
    gender: toSettingsProfileTextValue(user.gender),
    city: toSettingsProfileTextValue(user.city),
    locationLat: toSettingsProfileLocationValue(user.locationLat),
    locationLng: toSettingsProfileLocationValue(user.locationLng),
    bio: toSettingsProfileTextValue(user.bio),
  };
}

function toSettingsProfileAgeValue(age: User["age"]) {
  return age ? String(age) : "";
}

function toSettingsProfileTextValue<T extends string>(
  value: T | null | undefined,
): T | "" {
  return value ?? "";
}

function toSettingsProfileLocationValue(value: number | null | undefined) {
  return value ?? null;
}

export function buildSettingsProfilePayload(
  values: SettingsProfileValues,
): UpdateSettingsProfileDto {
  return {
    name: values.name.trim(),
    bio: toNullableText(values.bio),
    age: toNullableAge(values.age),
    gender: toNullableGender(values.gender),
    city: toNullableText(values.city),
    locationLat: values.locationLat,
    locationLng: values.locationLng,
  };
}

export function buildProfileSummary(user: User) {
  return [
    {
      label: "Email",
      value: user.email,
    },
    {
      label: "Provider",
      value: user.authProvider === "GOOGLE" ? "Google" : "Email",
    },
    {
      label: "Verification",
      value: user.emailVerified ? "Verified" : "Pending",
    },
    {
      label: "Member Since",
      value: new Date(user.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    },
  ];
}
