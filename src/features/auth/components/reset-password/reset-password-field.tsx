import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { ResetPasswordValues } from "@/features/auth/schemas/auth-schemas";
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

interface ResetPasswordFieldProps {
  label: string;
  name: "password" | "confirmPassword";
}

export function ResetPasswordField({ label, name }: ResetPasswordFieldProps) {
  const { control } = useFormContext<ResetPasswordValues>();
  const [isVisible, setIsVisible] = useState(false);
  const isConfirmation = name === "confirmPassword";

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={authFormItemClassName}>
          <FormLabel className={authFormLabelClassName}>{label}</FormLabel>
          <FormControl>
            <Input
              type={isVisible ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              rightIcon={
                <Button
                  type="button"
                  variant="accentGhost"
                  size="icon-sm"
                  onClick={() => setIsVisible((value) => !value)}
                  className="size-8 rounded-md"
                  aria-label={
                    isVisible
                      ? isConfirmation
                        ? "Hide password confirmation"
                        : "Hide password"
                      : isConfirmation
                        ? "Show password confirmation"
                        : "Show password"
                  }
                >
                  {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              }
              {...field}
            />
          </FormControl>
          <FormMessage className={authFormMessageClassName} />
        </FormItem>
      )}
    />
  );
}
