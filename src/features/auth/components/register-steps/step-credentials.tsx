import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { ArrowRightAnimated } from "@/shared/components/common/arrow-right-animated";
import { GoogleIcon } from "@/shared/components/icons";
import { Button } from "@/shared/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import type { RegisterValues } from "../../schemas/auth-schemas";

const STRENGTH_LEVELS = [
  { score: 0 as const, label: "", color: "" },
  { score: 1 as const, label: "Weak", color: "#EF4444" },
  { score: 2 as const, label: "Good", color: "#F59E0B" },
  { score: 3 as const, label: "Strong", color: "#0D9488" },
] as const;

function getPasswordStrength(password: string): {
  score: 0 | 1 | 2 | 3;
  label: string;
  color: string;
} {
  if (!password) return STRENGTH_LEVELS[0];
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9!@#$%^&*]/.test(password)) score++;
  return STRENGTH_LEVELS[score];
}

interface StepCredentialsProps {
  onNext: () => void;
}

export function StepCredentials({ onNext }: StepCredentialsProps) {
  const { control } = useFormContext<RegisterValues>();
  const [showPassword, setShowPassword] = useState(false);

  const passwordValue = useWatch({
    control,
    name: "password",
  });
  const strength = getPasswordStrength(passwordValue || "");

  return (
    <div className="flex flex-col gap-4">
      {/* Full name */}
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem className="space-y-0">
            <FormLabel className="font-sans text-sm font-semibold text-ink">
              Full Name
            </FormLabel>
            <FormControl>
              <Input
                className="h-11 px-3.5 rounded-xl border-border bg-white font-sans text-sm text-ink placeholder:text-slate-muted focus-visible:border-forge-teal transition-colors duration-200"
                placeholder="Alex Johnson"
                autoComplete="name"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs font-medium text-red-500" />
          </FormItem>
        )}
      />

      {/* Email */}
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem className="space-y-0">
            <FormLabel className="font-sans text-sm font-semibold text-ink">
              Email
            </FormLabel>
            <FormControl>
              <Input
                className="h-11 px-3.5 rounded-xl border-border bg-white font-sans text-sm text-ink placeholder:text-slate-muted focus-visible:border-forge-teal transition-colors duration-200"
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs font-medium text-red-500" />
          </FormItem>
        )}
      />

      {/* Password + strength */}
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
                  className="h-11 pl-3.5 pr-10 rounded-xl border-border bg-white font-sans text-sm text-ink placeholder:text-slate-muted focus-visible:border-forge-teal transition-colors duration-200"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-invalid={!!formState.errors.password}
                  {...field}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-muted hover:text-forge-teal transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormControl>
            {passwordValue?.length > 0 && (
              <div className="mt-1 pb-1">
                <div className="flex gap-1 h-1">
                  {[1, 2, 3].map((seg) => (
                    <div
                      key={seg}
                      className="flex-1 rounded-full transition-[background-color] duration-300"
                      style={{
                        background:
                          strength.score >= seg ? strength.color : "#E5E7EB",
                      }}
                    />
                  ))}
                </div>
                {strength.label && (
                  <p
                    className="text-xs font-medium mt-1"
                    style={{ color: strength.color }}
                  >
                    {strength.label}
                  </p>
                )}
              </div>
            )}
            <FormMessage className="text-xs font-medium text-red-500" />
          </FormItem>
        )}
      />

      <Button
        type="button"
        onClick={onNext}
        className="w-full h-12 rounded-xl mt-2 text-sm sm:text-base font-semibold group transition-[transform,box-shadow,background-color] duration-200 active:scale-[0.98] shadow-lg shadow-forge-teal/20 hover:shadow-forge-teal/40 hover:-translate-y-0.5 bg-forge-teal text-white hover:bg-teal-500"
      >
        Continue
        <ArrowRightAnimated />
      </Button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="font-sans text-xs text-slate-muted font-medium">
          or continue with
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full h-12 rounded-xl border-border bg-white font-sans text-sm font-semibold text-ink flex items-center justify-center gap-2.5 hover:border-slate-muted hover:bg-slate-50 transition-colors duration-200 active:scale-[0.98] shadow-sm"
      >
        <GoogleIcon />
        Google
      </Button>
    </div>
  );
}
