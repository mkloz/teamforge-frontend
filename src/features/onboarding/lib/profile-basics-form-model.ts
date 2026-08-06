import type { UpdateProfileBasicsDto } from "@/features/onboarding/api/onboarding.api";
import {
  buildOnboardingReturnSearch,
  type OnboardingReturnSearchParams,
} from "@/features/onboarding/lib/onboarding-flow-state";
import type { ProfileBasicsValues } from "@/features/onboarding/schemas/profile-basics.schema";
import type { AdultEligibility, User } from "@/shared/schemas";
import { getAgeFromDateOfBirth } from "@/shared/validators/date-of-birth.validator";

const PROFILE_BASICS_FIELD_COUNT = 3;

export const PROFILE_BASICS_DEFAULT_VALUES: ProfileBasicsValues = {
  dateOfBirth: "",
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
    gender: toProfileBasicsTextValue(user.gender),
    city: toProfileBasicsTextValue(user.city),
    locationLat: toProfileBasicsLocationValue(user.locationLat),
    locationLng: toProfileBasicsLocationValue(user.locationLng),
  };
}

function toProfileBasicsTextValue<T extends string>(
  value: T | null | undefined,
): T | "" {
  return value ?? "";
}

function toProfileBasicsLocationValue(value: number | null | undefined) {
  return value ?? null;
}

export function requiresProfileBasicsDateOfBirth(
  adultEligibility?: AdultEligibility,
  currentAge?: number | null,
) {
  return (
    currentAge === null ||
    currentAge === undefined ||
    !adultEligibility ||
    adultEligibility.status === "UNKNOWN"
  );
}

export function getProfileBasicsProgress(
  values: Partial<ProfileBasicsValues>,
  requiresDateOfBirth = true,
) {
  const filledFields = [
    ...(requiresDateOfBirth
      ? [Boolean(values.dateOfBirth?.trim().length)]
      : []),
    Boolean(values.gender),
    Boolean(values.city?.trim().length),
  ].filter(Boolean).length;

  const fieldCount = requiresDateOfBirth
    ? PROFILE_BASICS_FIELD_COUNT
    : PROFILE_BASICS_FIELD_COUNT - 1;

  return filledFields / fieldCount;
}

export function toProfileBasicsDto(
  values: ProfileBasicsValues,
  options: {
    includeDateOfBirth?: boolean;
    today?: Date;
  } = {},
): UpdateProfileBasicsDto | null {
  if (!values.gender) {
    return null;
  }

  const includeDateOfBirth = options.includeDateOfBirth !== false;
  const age = includeDateOfBirth
    ? getAgeFromDateOfBirth(values.dateOfBirth, options.today)
    : null;

  if (includeDateOfBirth && age === null) {
    return null;
  }

  return {
    ...(includeDateOfBirth
      ? { age: age ?? undefined, dateOfBirth: values.dateOfBirth }
      : {}),
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
  returnGroupId,
}: OnboardingReturnSearchParams) {
  return buildOnboardingReturnSearch({
    returnTo,
    returnSearch,
    returnSection,
    returnGroupId,
  });
}

export function getProfileBasicsNextRoute(nextDestination: string) {
  return nextDestination === "/onboarding/profile"
    ? "/onboarding/intent"
    : nextDestination;
}
