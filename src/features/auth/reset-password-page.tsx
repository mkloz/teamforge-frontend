import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useParams } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { captureException, trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

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
import {
  buildAuthRouteNavigation,
  useAuthReturnState,
} from "@/shared/lib/auth-route";

import { AuthCommands } from "@/features/auth/api/auth-commands";
import { AuthSupportShell } from "@/features/auth/components/auth-support-shell";
import { FormLevelError } from "@/features/auth/components/login-form/form-level-error";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/features/auth/schemas/auth-schemas";

export function ResetPasswordPage() {
  const { token } = useParams({ from: "/auth/reset-password/$token" });
  const { returnTo } = useAuthReturnState();
  const [loading, setLoading] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setRootError(null);
    setLoading(true);

    try {
      const result = await AuthCommands.resetPassword(token, values.password);
      trackMutationOutcome(trackedMutationNames.authResetPassword, "success", {
        requestId: result.requestId,
      });
      setSuccess(true);
    } catch (error) {
      captureException(trackedMutationNames.authResetPassword, error);
      trackMutationOutcome(trackedMutationNames.authResetPassword, "error");
      setRootError(
        AuthCommands.getAuthErrorMessage(
          error,
          "We couldn't reset your password. Your link may have expired.",
        ),
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthSupportShell
      title="Choose a new password"
      description="This password will replace the old one for your TeamForge account."
      backNavigation={buildAuthRouteNavigation("/auth/login", returnTo)}
      backLabel="Back to login"
      footer={
        success ? (
          <p className="text-center text-sm text-slate-muted">
            Password updated.{" "}
            <Link
              {...buildAuthRouteNavigation("/auth/login", returnTo)}
              className="font-medium text-forge-teal hover:underline"
            >
              Sign in now
            </Link>
            .
          </p>
        ) : null
      }
    >
      {rootError ? <FormLevelError message={rootError} /> : null}

      {success ? (
        <div className="rounded-2xl border border-forge-teal/20 bg-forge-teal/8 px-4 py-3 text-sm text-foreground">
          Your password has been updated. You can head back to login now.
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-0 text-left">
                  <FormLabel className="font-sans text-sm font-semibold text-foreground">
                    New password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="h-11 pl-3.5 pr-10 rounded-xl border border-border bg-background font-sans text-sm text-foreground placeholder:text-slate-muted/70 hover:border-forge-teal/40 focus-visible:border-forge-teal focus-visible:ring-2 focus-visible:ring-forge-teal/15 transition-all duration-200"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-slate-muted hover:text-forge-teal"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs font-medium text-destructive mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-0 text-left">
                  <FormLabel className="font-sans text-sm font-semibold text-foreground">
                    Confirm password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="h-11 pl-3.5 pr-10 rounded-xl border border-border bg-background font-sans text-sm text-foreground placeholder:text-slate-muted/70 hover:border-forge-teal/40 focus-visible:border-forge-teal focus-visible:ring-2 focus-visible:ring-forge-teal/15 transition-all duration-200"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setShowConfirmPassword((value) => !value)
                        }
                        className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-slate-muted hover:text-forge-teal"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password confirmation"
                            : "Show password confirmation"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs font-medium text-destructive mt-1" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              loading={loading}
              size="lg"
              className="w-full"
            >
              Save new password
              <ArrowRightAnimated />
            </Button>
          </form>
        </Form>
      )}
    </AuthSupportShell>
  );
}
