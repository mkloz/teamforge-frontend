import type { UpdateProfileBasicsDto } from "@/features/onboarding/api/onboarding.api";
import {
  buildOnboardingReturnSearch,
  type OnboardingReturnSearchParams,
} from "@/features/onboarding/lib/onboarding-flow-state";
import type { ProfileBasicsValues } from "@/features/onboarding/schemas/profile-basics.schema";
import type { User } from "@/shared/schemas";

const PROFILE_BASICS_FIELD_COUNT = 4;

export const PROFILE_BASICS_DEFAULT_VALUES: ProfileBasicsValues = {
  dateOfBirth: "",
  age: "",
  gender: "",
  city: "",
  locationLat: null,
  locationLng: null,
};

export function getProfileBasicsValuesFromUser(
  user: User | undefined,
): ProfileBasicsValues {
  if (!user) {
    return PROFILE_BASICS_DEFAULT_VALUES;
  }

  return buildProfileBasicsValues(user);
}

function buildProfileBasicsValues(user: User): ProfileBasicsValues {
  return {
    dateOfBirth: "",
    age: toProfileBasicsAgeValue(user.age),
    gender: toProfileBasicsTextValue(user.gender),
    city: toProfileBasicsTextValue(user.city),
    locationLat: toProfileBasicsLocationValue(user.locationLat),
    locationLng: toProfileBasicsLocationValue(user.locationLng),
  };
}

function toProfileBasicsAgeValue(age: User["age"]) {
  return age ? String(age) : "";
}

function toProfileBasicsTextValue<T extends string>(
  value: T | null | undefined,
): T | "" {
  return value ?? "";
}

function toProfileBasicsLocationValue(value: number | null | undefined) {
  return value ?? null;
}

export function getProfileBasicsProgress(values: Partial<ProfileBasicsValues>) {
  const filledFields = [
    Boolean(values.dateOfBirth?.trim().length),
    Boolean(values.age?.trim().length),
    Boolean(values.gender),
    Boolean(values.city?.trim().length),
  ].filter(Boolean).length;

  return filledFields / PROFILE_BASICS_FIELD_COUNT;
}

export function toProfileBasicsDto(
  values: ProfileBasicsValues,
): UpdateProfileBasicsDto | null {
  if (!values.gender) {
    return null;
  }

  return {
    dateOfBirth: values.dateOfBirth,
    age: Number(values.age),
    gender: values.gender,
    city: values.city.trim(),
    locationLat: values.locationLat,
    locationLng: values.locationLng,
  };
}

export function buildProfileBasicsFlowSearch({
  returnTo,
  returnSearch,
  returnSection,
}: OnboardingReturnSearchParams) {
  return buildOnboardingReturnSearch({ returnTo, returnSearch, returnSection });
}

export function getProfileBasicsNextRoute(nextDestination: string) {
  return nextDestination === "/onboarding/profile"
    ? "/onboarding/personality"
    : nextDestination;
}
