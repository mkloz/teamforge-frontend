import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import type { ResetPasswordValues } from "@/features/auth/schemas/auth-schemas";

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
        <FormItem className="space-y-0 text-left">
          <FormLabel className="font-sans text-sm font-semibold text-foreground">
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={isVisible ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                className="h-11 pl-3.5 pr-10 rounded-xl border border-border bg-background font-sans text-sm text-foreground placeholder:text-slate-muted/70 hover:border-forge-teal/40 focus-visible:border-forge-teal focus-visible:ring-2 focus-visible:ring-forge-teal/15 transition-all duration-200"
                {...field}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsVisible((value) => !value)}
                className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-slate-muted hover:text-forge-teal"
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
            </div>
          </FormControl>
          <FormMessage className="text-xs font-medium text-destructive mt-1" />
        </FormItem>
      )}
    />
  );
}
