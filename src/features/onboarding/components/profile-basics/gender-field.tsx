import type { UseFormReturn } from "react-hook-form";
import type { ProfileBasicsValues } from "@/features/onboarding/schemas/profile-basics.schema";
import { GenderField } from "@/shared/components/profile/gender-field";

interface ProfileBasicsGenderFieldProps {
  form: UseFormReturn<ProfileBasicsValues>;
}

export function ProfileBasicsGenderField({
  form,
}: ProfileBasicsGenderFieldProps) {
  return (
    <div className="flex flex-col gap-4">
      <GenderField control={form.control} name="gender" />
      <p className="text-center text-slate-muted text-xs">
        Your age is calculated automatically. Age and gender can appear on your
        profile.
      </p>
    </div>
  );
}
