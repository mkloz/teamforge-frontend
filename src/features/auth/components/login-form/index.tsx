import { Link } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { FormLevelError } from "@/features/auth/components/form-level-error";
import { useGoogleAuth } from "@/features/auth/hooks/use-google-auth";
import { useLoginForm } from "@/features/auth/hooks/use-login-form";
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
    <div className="flex w-full flex-col">
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
              <FormItem className="gap-0 text-left">
                <FormLabel className="font-sans font-semibold text-ink text-sm">
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
                <FormMessage className="mt-1 font-medium text-destructive text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="gap-0 text-left">
                <div className="flex items-center justify-between">
                  <FormLabel className="font-sans font-semibold text-ink text-sm">
                    Password
                  </FormLabel>
                  <Link
                    {...buildAuthRouteNavigation(
                      "/auth/forgot-password",
                      authReturnTo,
                    )}
                    className="font-medium font-sans text-forge-teal text-xs outline-hidden transition-colors hover:underline focus:ring-2 focus:ring-forge-teal/20"
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
                        variant="accentGhost"
                        size="icon-sm"
                        type="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={togglePasswordVisibility}
                        className="size-8 rounded-md"
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
                <FormMessage className="mt-1 font-medium text-destructive text-xs" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="mt-2 w-full"
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
