import { Link } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { ArrowRightAnimated } from "@/shared/components/common/arrow-right-animated";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { buildAuthRouteNavigation } from "@/shared/lib/auth-route";
import { FormLevelError } from "@/features/auth/components/form-level-error";
import { useGoogleAuth } from "@/features/auth/hooks/use-google-auth";
import { useLoginForm } from "@/features/auth/hooks/use-login-form";
import { FormHeader } from "./form-header";
import { GoogleAuthButton } from "./google-auth-button";
import { SocialLoginDivider } from "./social-login-divider";
import { SwitchViewPrompt } from "./switch-view-prompt";

interface LoginFormProps {
  authReturnTo?: string | null;
  onSwitchToRegister: () => void;
  onSuccess?: () => void;
  onProgress?: (progress: number) => void;
}

/**
 * LoginForm
 * Secure entry point for existing TeamForge users.
 * Optimized with hook-based logic and premium micro-interactions.
 */
export function LoginForm({
  authReturnTo,
  onSwitchToRegister,
  onSuccess,
  onProgress,
}: LoginFormProps) {
  const {
    form,
    loading,
    rootError,
    showPassword,
    onSubmit,
    togglePasswordVisibility,
  } = useLoginForm({ onSuccess, onProgress });
  const {
    loading: googleLoading,
    rootError: googleError,
    startGoogleAuth,
  } = useGoogleAuth({ intent: "login", onSuccess });
  const currentRootError = rootError ?? googleError;

  return (
    <div className="flex flex-col w-full">
      <FormHeader />

      {currentRootError ? <FormLevelError message={currentRootError} /> : null}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-0 text-left">
                <FormLabel className="font-sans text-sm font-semibold text-ink">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    type="email"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs font-medium text-destructive mt-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-0 text-left">
                <div className="flex items-center justify-between">
                  <FormLabel className="font-sans text-sm font-semibold text-ink">
                    Password
                  </FormLabel>
                  <Link
                    {...buildAuthRouteNavigation(
                      "/auth/forgot-password",
                      authReturnTo,
                    )}
                    className="font-sans text-xs font-medium text-forge-teal hover:underline transition-colors focus:ring-2 focus:ring-forge-teal/20 outline-hidden"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    aria-invalid={!!form.formState.errors.password}
                    rightIcon={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        type="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={togglePasswordVisibility}
                        className="size-8 rounded-md text-slate-muted hover:text-forge-teal"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </Button>
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs font-medium text-destructive mt-1" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="w-full mt-2"
          >
            Let's go
            <ArrowRightAnimated />
          </Button>

          <SocialLoginDivider />
          <GoogleAuthButton
            loading={loading || googleLoading}
            onClick={startGoogleAuth}
          />
        </form>
      </Form>

      <SwitchViewPrompt onClick={onSwitchToRegister} />
    </div>
  );
}
