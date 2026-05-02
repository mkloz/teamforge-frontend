import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import type { RegisterValues } from "@/features/auth/schemas/auth-schemas";

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
        <FormItem className="space-y-0">
          <FormLabel className="font-sans text-sm font-semibold text-ink">
            Password
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                className="h-11 pl-3.5 pr-10 rounded-xl border border-border bg-white font-sans text-sm text-ink placeholder:text-slate-muted/70 hover:border-forge-teal/40 focus-visible:border-forge-teal focus-visible:ring-2 focus-visible:ring-forge-teal/15 transition-all duration-200"
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={!!formState.errors.password}
                {...field}
              />
              <Button
                variant="ghost"
                size="icon"
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-slate-muted hover:text-forge-teal"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          </FormControl>
          {passwordValue?.length > 0 && (
            <PasswordStrengthMeter strength={strength} />
          )}
          <FormMessage className="text-xs font-medium text-destructive" />
        </FormItem>
      )}
    />
  );
}
