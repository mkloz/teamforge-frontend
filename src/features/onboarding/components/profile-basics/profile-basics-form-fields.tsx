import type { UseFormReturn } from "react-hook-form";
import type { ProfileBasicsValues } from "@/features/onboarding/schemas/profile-basics.schema";
import { DateOfBirthField } from "@/shared/components/profile/date-of-birth-field";

import { CityField } from "./city-field";
import { ProfileBasicsGenderField } from "./gender-field";
import { HiddenLocationFields } from "./hidden-location-fields";

interface ProfileBasicsFormFieldsProps {
  form: UseFormReturn<ProfileBasicsValues>;
  requiresDateOfBirth: boolean;
  watchedValues: Partial<ProfileBasicsValues>;
}

export function ProfileBasicsFormFields({
  form,
  requiresDateOfBirth,
  watchedValues,
}: ProfileBasicsFormFieldsProps) {
  return (
    <>
      {requiresDateOfBirth ? (
        <DateOfBirthField control={form.control} name="dateOfBirth" />
      ) : null}
      <ProfileBasicsGenderField form={form} />
      <CityField form={form} watchedValues={watchedValues} />
      <HiddenLocationFields form={form} />
    </>
  );
}
