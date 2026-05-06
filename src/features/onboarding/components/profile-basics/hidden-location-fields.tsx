import type { UseFormReturn } from "react-hook-form";

import { FormField } from "@/shared/components/ui/form";
import type { ProfileBasicsValues } from "@/features/onboarding/schemas/profile-basics.schema";

interface HiddenLocationFieldsProps {
  form: UseFormReturn<ProfileBasicsValues>;
}

export function HiddenLocationFields({ form }: HiddenLocationFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="locationLat"
        render={({ field }) => (
          <input type="hidden" value={field.value ?? ""} readOnly />
        )}
      />
      <FormField
        control={form.control}
        name="locationLng"
        render={({ field }) => (
          <input type="hidden" value={field.value ?? ""} readOnly />
        )}
      />
    </>
  );
}
