import { Eye, EyeOff, Loader2 } from "lucide-react";
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
import { cn } from "@/shared/lib/utils";
import { useLoginForm } from "../../hooks/use-login-form";
import { FormHeader } from "./form-header";
import { FormLevelError } from "./form-level-error";
import { SocialLoginDivider } from "./social-login-divider";
import { GoogleAuthButton } from "./google-auth-button";
import { SwitchViewPrompt } from "./switch-view-prompt";

interface LoginFormProps {
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

  return (
    <div className="flex flex-col w-full">
      <FormHeader />

      {rootError && <FormLevelError message={rootError} />}

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
                    className="h-11 px-3.5 rounded-xl border-border bg-white font-sans text-sm text-ink placeholder:text-slate-muted focus-visible:border-forge-teal transition-colors duration-200"
                    placeholder="you@example.com"
                    type="email"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs font-medium text-red-500 mt-1" />
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
                  <a
                    href="/auth/forgot-password"
                    className="font-sans text-xs font-medium text-forge-teal hover:underline transition-colors focus:ring-2 focus:ring-forge-teal/20 outline-hidden"
                    tabIndex={-1}
                  >
                    Forgot password?
                  </a>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      className="h-11 pl-3.5 pr-10 rounded-xl border-border bg-white font-sans text-sm text-ink placeholder:text-slate-muted focus-visible:border-forge-teal transition-colors duration-200"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      aria-invalid={!!form.formState.errors.password}
                      {...field}
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-muted hover:text-forge-teal transition-colors focus:outline-hidden"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs font-medium text-red-500 mt-1" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full h-12 rounded-xl mt-2 text-sm sm:text-base font-semibold group transition-all duration-200 cursor-pointer active:scale-[0.98]",
              !loading &&
                "shadow-lg shadow-forge-teal/20 hover:shadow-forge-teal/40 hover:-translate-y-0.5 bg-forge-teal text-white hover:bg-teal-500",
            )}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>Sign In</span>
                <ArrowRightAnimated />
              </div>
            )}
          </Button>

          <SocialLoginDivider />
          <GoogleAuthButton loading={loading} />
        </form>
      </Form>

      <SwitchViewPrompt onClick={onSwitchToRegister} />
    </div>
  );
}
