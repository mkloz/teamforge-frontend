import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import {
  type ControllerRenderProps,
  type UseFormStateReturn,
  useFormContext,
  useWatch,
} from "react-hook-form";
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
import {
  authFormItemClassName,
  authFormLabelClassName,
  authFormMessageClassName,
} from "../auth-form-styles";

import {
  getPasswordStrength,
  type PasswordStrength,
} from "./password-strength";
import { PasswordStrengthMeter } from "./password-strength-meter";

interface PasswordFieldControlProps {
  field: ControllerRenderProps<RegisterValues, "password">;
  formState: UseFormStateReturn<RegisterValues>;
  onTogglePassword: () => void;
  passwordValue: string;
  showPassword: boolean;
  strength: PasswordStrength;
}

export function RegisterPasswordField() {
  const { control } = useFormContext<RegisterValues>();
  const [showPassword, setShowPassword] = useState(false);
  const passwordValue = useWatch({
    control,
    name: "password",
  });
  const password = passwordValue || "";
  const strength = getPasswordStrength(password);

  return (
    <FormField
      control={control}
      name="password"
      render={({ field, formState }) => (
        <PasswordFieldControl
          field={field}
          formState={formState}
          onTogglePassword={() => setShowPassword((value) => !value)}
          passwordValue={password}
          showPassword={showPassword}
          strength={strength}
        />
      )}
    />
  );
}

function PasswordFieldControl({
  field,
  formState,
  onTogglePassword,
  passwordValue,
  showPassword,
  strength,
}: PasswordFieldControlProps) {
  return (
    <FormItem className={authFormItemClassName}>
      <FormLabel className={authFormLabelClassName}>Password</FormLabel>
      <FormControl>
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          autoComplete="new-password"
          aria-invalid={!!formState.errors.password}
          className="pr-12 [@media(pointer:fine)]:pr-10"
          rightIcon={
            <PasswordVisibilityButton
              onTogglePassword={onTogglePassword}
              showPassword={showPassword}
            />
          }
          {...field}
        />
      </FormControl>
      {shouldShowPasswordStrength(passwordValue) && (
        <PasswordStrengthMeter strength={strength} />
      )}
      <FormMessage className={authFormMessageClassName} />
    </FormItem>
  );
}

function PasswordVisibilityButton({
  onTogglePassword,
  showPassword,
}: Pick<PasswordFieldControlProps, "onTogglePassword" | "showPassword">) {
  return (
    <Button
      variant="accentGhost"
      size="icon-sm"
      type="button"
      aria-label={showPassword ? "Hide password" : "Show password"}
      onClick={onTogglePassword}
      className="size-11 rounded-md [@media(pointer:fine)]:size-8"
    >
      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
    </Button>
  );
}

function shouldShowPasswordStrength(passwordValue: string) {
  return passwordValue.length > 0;
}
