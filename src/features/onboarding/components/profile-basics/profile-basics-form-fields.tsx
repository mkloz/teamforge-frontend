import type { UseFormReturn } from "react-hook-form";
import type { ProfileBasicsValues } from "@/features/onboarding/schemas/profile-basics.schema";
import { DateOfBirthField } from "@/shared/components/profile/date-of-birth-field";

import { ProfileBasicsAgeGenderFields } from "./age-gender-fields";
import { CityField } from "./city-field";
import { HiddenLocationFields } from "./hidden-location-fields";

interface ProfileBasicsFormFieldsProps {
  form: UseFormReturn<ProfileBasicsValues>;
  watchedValues: Partial<ProfileBasicsValues>;
}

export function ProfileBasicsFormFields({
  form,
  watchedValues,
}: ProfileBasicsFormFieldsProps) {
  return (
    <>
      <DateOfBirthField control={form.control} name="dateOfBirth" />
      <ProfileBasicsAgeGenderFields form={form} />
      <CityField form={form} watchedValues={watchedValues} />
      <HiddenLocationFields form={form} />
    </>
  );
}
