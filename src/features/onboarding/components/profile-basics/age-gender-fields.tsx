import type { UseFormReturn } from "react-hook-form";
import type { ProfileBasicsValues } from "@/features/onboarding/schemas/profile-basics.schema";
import { AgeGenderFields as SharedAgeGenderFields } from "@/shared/components/profile/age-gender-fields";

interface ProfileBasicsAgeGenderFieldsProps {
  form: UseFormReturn<ProfileBasicsValues>;
}

export function ProfileBasicsAgeGenderFields({
  form,
}: ProfileBasicsAgeGenderFieldsProps) {
  return (
    <SharedAgeGenderFields
      ageName="age"
      ageValueMode="string"
      control={form.control}
      genderName="gender"
    />
  );
}
