import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

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
import { loginSchema, type LoginValues } from "../schemas/auth-schemas";

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSuccess?: () => void;
  onProgress?: (progress: number) => void;
}

export function LoginForm({
  onSwitchToRegister,
  onSuccess,
  onProgress,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // Root error could be set here if backend returns e.g. "Invalid credentials"
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const emailValue = form.watch("email");
  const passwordValue = form.watch("password");

  useEffect(() => {
    if (!onProgress) return;
    let p = 0;
    if (emailValue && emailValue.length > 3) p += 0.5;
    if (passwordValue && passwordValue.length > 3) p += 0.5;
    onProgress(p);
  }, [emailValue, passwordValue, onProgress]);

  async function onSubmit(values: LoginValues) {
    setRootError(null);
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    console.log("Login submitted", values);
    if (onSuccess) onSuccess();
  }

  return (
    <div className="flex flex-col w-full">
      {/* Logo + title */}
      <div className="flex flex-col items-center mb-8">
        <h1 className="font-sans text-3xl sm:text-4xl font-extrabold text-ink leading-tight text-balance text-center tracking-tight">
          Welcome back<span className="text-forge-teal">.</span>
        </h1>
        <p className="font-sans text-sm sm:text-base text-slate-muted mt-2 text-center">
          Sign in to your TeamForge account.
        </p>
      </div>

      {/* Form-level error */}
      {rootError && (
        <div className="mb-4 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-red-200 bg-red-50">
          <span className="text-red-500 text-xs font-medium">{rootError}</span>
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormLabel className="font-sans text-sm font-semibold text-ink">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    className="h-11 px-3.5 rounded-xl border-[#E5E7EB] bg-white font-sans text-sm text-ink placeholder:text-slate-muted focus-visible:border-forge-teal transition-all duration-200"
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

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <div className="flex items-center justify-between">
                  <FormLabel className="font-sans text-sm font-semibold text-ink">
                    Password
                  </FormLabel>
                  <a
                    href="/auth/forgot-password"
                    className="font-sans text-xs font-medium text-forge-teal hover:underline"
                    tabIndex={-1}
                  >
                    Forgot password?
                  </a>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      className="h-11 pl-3.5 pr-10 rounded-xl border-[#E5E7EB] bg-white font-sans text-sm text-ink placeholder:text-slate-muted focus-visible:border-forge-teal transition-all duration-200"
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
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-muted hover:text-forge-teal transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs font-medium text-red-500" />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className={`w-full h-12 rounded-xl mt-2 text-sm sm:text-base font-semibold group transition-all active:scale-[0.98] ${!loading ? "shadow-lg shadow-forge-teal/20 hover:shadow-forge-teal/40 hover:-translate-y-0.5 bg-forge-teal text-white hover:bg-teal-500" : ""}`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <svg
                  className="w-4 h-4 ml-1.5 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E5E7EB]" />
            <span className="font-sans text-xs text-slate-muted font-medium">
              or continue with
            </span>
            <div className="flex-1 h-px bg-[#E5E7EB]" />
          </div>

          {/* Google OAuth */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-xl border-[#E5E7EB] bg-white font-sans text-sm font-semibold text-ink flex items-center justify-center gap-2.5 hover:border-[#9CA3AF] hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm"
          >
            <GoogleIcon />
            Google
          </Button>
        </form>
      </Form>

      {/* Switch to register */}
      <p className="font-sans text-sm text-slate-muted text-center mt-6">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-semibold text-forge-teal hover:underline"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}
