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
                <ResetPasswordVisibilityToggle
                  isVisible={isVisible}
                  name={name}
                  onToggle={() => setIsVisible((value) => !value)}
                />
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

function ResetPasswordVisibilityToggle({
  isVisible,
  name,
  onToggle,
}: {
  isVisible: boolean;
  name: ResetPasswordFieldProps["name"];
  onToggle: () => void;
}) {
  return (
    <Button
      type="button"
      variant="accentGhost"
      size="icon-sm"
      onClick={onToggle}
      className="size-8 rounded-md"
      aria-label={getPasswordVisibilityAriaLabel({ isVisible, name })}
    >
      <PasswordVisibilityIcon isVisible={isVisible} />
    </Button>
  );
}

function PasswordVisibilityIcon({ isVisible }: { isVisible: boolean }) {
  return isVisible ? <EyeOff size={16} /> : <Eye size={16} />;
}

function getPasswordVisibilityAriaLabel({
  isVisible,
  name,
}: {
  isVisible: boolean;
  name: ResetPasswordFieldProps["name"];
}) {
  const action = isVisible ? "Hide" : "Show";
  const target =
    name === "confirmPassword" ? "password confirmation" : "password";

  return `${action} ${target}`;
}
