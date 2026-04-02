import { Eye, EyeOff, Loader2 } from "lucide-react";
import { ArrowRightAnimated } from "@/shared/components/common/arrow-right-animated";
import { GoogleIcon } from "@/shared/components/icons";
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
import { useLoginForm } from "../hooks/use-login-form";

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

/** Internal Sub-Components for cleaner orchestration */

function FormHeader() {
  return (
    <div className="flex flex-col items-center mb-6 sm:mb-8">
      <h1 className="font-sans text-2xl sm:text-4xl font-extrabold text-ink leading-tight text-balance text-center tracking-tight">
        Welcome back<span className="text-forge-teal">.</span>
      </h1>
      <p className="font-sans text-xs sm:text-base text-slate-muted mt-1 sm:mt-2 text-center">
        Sign in to your TeamForge account.
      </p>
    </div>
  );
}

function FormLevelError({ message }: { message: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-red-200 bg-red-50">
      <span className="text-red-500 text-xs font-medium">{message}</span>
    </div>
  );
}

function SocialLoginDivider() {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="flex-1 h-px bg-border" />
      <span className="font-sans text-xs text-slate-muted font-medium whitespace-nowrap">
        or continue with
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function GoogleAuthButton({ loading }: { loading: boolean }) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={loading}
      className="w-full h-12 rounded-xl border-border bg-white font-sans text-sm font-semibold text-ink flex items-center justify-center gap-2.5 hover:border-slate-muted hover:bg-slate-50 transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-xs"
    >
      <GoogleIcon />
      <span>Google</span>
    </Button>
  );
}

function SwitchViewPrompt({ onClick }: { onClick: () => void }) {
  return (
    <p className="font-sans text-sm text-slate-muted text-center mt-6">
      Don&apos;t have an account?{" "}
      <button
        type="button"
        onClick={onClick}
        className="font-semibold text-forge-teal hover:underline cursor-pointer transition-colors focus:outline-hidden"
      >
        Sign up
      </button>
    </p>
  );
}
