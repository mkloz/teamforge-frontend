import { useFormContext } from "react-hook-form";
import { AuthTextField } from "@/features/auth/components/auth-text-field";
import type { RegisterValues } from "@/features/auth/schemas/auth-schemas";

export function RegisterIdentityFields() {
  const { control } = useFormContext<RegisterValues>();

  return (
    <>
      <AuthTextField
        control={control}
        name="name"
        label="Full Name"
        placeholder="Alex Johnson"
        autoComplete="name"
      />

      <AuthTextField
        control={control}
        name="email"
        label="Email"
        placeholder="you@example.com"
        type="email"
        autoComplete="email"
      />
    </>
  );
}
