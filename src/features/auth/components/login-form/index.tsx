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
import {
  authFormItemClassName,
  authFormLabelClassName,
  authFormMessageClassName,
} from "../auth-form-styles";
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

type LoginFormController = ReturnType<typeof useLoginForm>;
type LoginGoogleAuthController = ReturnType<typeof useGoogleAuth>;

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
    isOnline,
    loading,
    rootError,
    showPassword,
    onSubmit,
    togglePasswordVisibility,
  } = useLoginForm({ onSuccess, onProgress });
  const {
    isOnline: isGoogleOnline,
    loading: googleLoading,
    preloadGoogleAuth,
    rootError: googleError,
    startGoogleAuth,
  } = useGoogleAuth({ intent: "login", onSuccess });
  const currentRootError = getCurrentLoginRootError({ rootError, googleError });

  return (
    <div className="flex w-full flex-col">
      <FormHeader />

      <LoginRootError message={currentRootError} />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <LoginEmailField form={form} />
          <LoginPasswordField
            authReturnTo={authReturnTo}
            form={form}
            showPassword={showPassword}
            togglePasswordVisibility={togglePasswordVisibility}
          />
          <LoginSubmitButton isOnline={isOnline} loading={loading} />

          <SocialLoginDivider />
          <LoginGoogleAuthButton
            isGoogleOnline={isGoogleOnline}
            loading={loading || googleLoading}
            preloadGoogleAuth={preloadGoogleAuth}
            startGoogleAuth={startGoogleAuth}
          />
        </form>
      </Form>

      <SwitchViewPrompt onClick={onSwitchToRegister} />
    </div>
  );
}

function LoginRootError({ message }: { message?: string | null }) {
  return message ? <FormLevelError message={message} /> : null;
}

function LoginEmailField({ form }: { form: LoginFormController["form"] }) {
  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem className={authFormItemClassName}>
          <FormLabel className={authFormLabelClassName}>Email</FormLabel>
          <FormControl>
            <Input
              placeholder="you@example.com"
              type="email"
              autoComplete="email"
              {...field}
            />
          </FormControl>
          <FormMessage className={authFormMessageClassName} />
        </FormItem>
      )}
    />
  );
}

function LoginPasswordField({
  authReturnTo,
  form,
  showPassword,
  togglePasswordVisibility,
}: {
  authReturnTo?: string | null;
  form: LoginFormController["form"];
  showPassword: boolean;
  togglePasswordVisibility: () => void;
}) {
  return (
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem className={authFormItemClassName}>
          <LoginPasswordLabel authReturnTo={authReturnTo} />
          <FormControl>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={!!form.formState.errors.password}
              rightIcon={
                <LoginPasswordVisibilityToggle
                  isVisible={showPassword}
                  onToggle={togglePasswordVisibility}
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

function LoginPasswordLabel({
  authReturnTo,
}: {
  authReturnTo?: string | null;
}) {
  return (
    <div className="flex items-center justify-between">
      <FormLabel className={authFormLabelClassName}>Password</FormLabel>
      <Link
        {...buildAuthRouteNavigation("/auth/forgot-password", authReturnTo)}
        className="font-medium font-sans text-forge-teal text-xs outline-hidden transition-colors hover:underline focus:ring-2 focus:ring-forge-teal/20"
      >
        Forgot password?
      </Link>
    </div>
  );
}

function LoginPasswordVisibilityToggle({
  isVisible,
  onToggle,
}: {
  isVisible: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      variant="accentGhost"
      size="icon-sm"
      type="button"
      aria-label={isVisible ? "Hide password" : "Show password"}
      onClick={onToggle}
      className="size-8 rounded-md"
    >
      {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
    </Button>
  );
}

function LoginSubmitButton({
  isOnline,
  loading,
}: Pick<LoginFormController, "isOnline" | "loading">) {
  return (
    <Button
      type="submit"
      disabled={!isOnline}
      loading={loading}
      size="lg"
      title={isOnline ? undefined : "Reconnect before signing in."}
      className="mt-2 w-full"
    >
      Let's go
      <ArrowRightAnimated />
    </Button>
  );
}

function LoginGoogleAuthButton({
  isGoogleOnline,
  loading,
  preloadGoogleAuth,
  startGoogleAuth,
}: {
  isGoogleOnline: boolean;
  loading: boolean;
  preloadGoogleAuth: LoginGoogleAuthController["preloadGoogleAuth"];
  startGoogleAuth: LoginGoogleAuthController["startGoogleAuth"];
}) {
  return (
    <GoogleAuthButton
      disabled={!isGoogleOnline}
      loading={loading}
      onClick={startGoogleAuth}
      onIntent={preloadGoogleAuth}
      title={
        isGoogleOnline ? undefined : "Reconnect before continuing with Google."
      }
    />
  );
}

function getCurrentLoginRootError({
  rootError,
  googleError,
}: {
  rootError?: string | null;
  googleError?: string | null;
}) {
  return rootError ?? googleError;
}
