import type { UpdateProfileBasicsDto } from "@/features/onboarding/api/onboarding.api";
import {
  buildOnboardingReturnSearch,
  type OnboardingReturnSearchParams,
} from "@/features/onboarding/lib/onboarding-flow-state";
import type { ProfileBasicsValues } from "@/features/onboarding/schemas/profile-basics.schema";
import type { User } from "@/shared/schemas";

export const PROFILE_BASICS_FIELD_COUNT = 3;

export const PROFILE_BASICS_DEFAULT_VALUES: ProfileBasicsValues = {
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

  return {
    age: user.age ? String(user.age) : "",
    gender: user.gender ?? "",
    city: user.city ?? "",
    locationLat: user.locationLat ?? null,
    locationLng: user.locationLng ?? null,
  };
}

export function getProfileBasicsProgress(values: Partial<ProfileBasicsValues>) {
  const filledFields = [
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
