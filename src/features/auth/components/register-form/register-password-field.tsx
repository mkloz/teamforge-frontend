import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { RegisterValues } from "@/features/auth/schemas/auth-schemas";
import { Button } from "@/shared/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";

import { getPasswordStrength } from "./password-strength";
import { PasswordStrengthMeter } from "./password-strength-meter";

export function RegisterPasswordField() {
  const { control } = useFormContext<RegisterValues>();
  const [showPassword, setShowPassword] = useState(false);
  const passwordValue = useWatch({
    control,
    name: "password",
  });
  const strength = getPasswordStrength(passwordValue || "");

  return (
    <FormField
      control={control}
      name="password"
      render={({ field, formState }) => (
        <FormItem className="gap-0">
          <FormLabel className="font-sans font-semibold text-ink text-sm">
            Password
          </FormLabel>
          <FormControl>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!formState.errors.password}
              rightIcon={
                <Button
                  variant="accentGhost"
                  size="icon-sm"
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="size-8 rounded-md"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              }
              {...field}
            />
          </FormControl>
          {passwordValue?.length > 0 && (
            <PasswordStrengthMeter strength={strength} />
          )}
          <FormMessage className="font-medium text-destructive text-xs" />
        </FormItem>
      )}
    />
  );
}
