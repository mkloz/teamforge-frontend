import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
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

import { AuthApi } from "./api/auth.api";
import { AuthSupportShell } from "./components/auth-support-shell";
import { FormLevelError } from "./components/login-form/form-level-error";
import {
  buildAuthRouteNavigation,
  useAuthReturnState,
} from "./lib/auth-return";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "./schemas/auth-schemas";

export function ForgotPasswordPage() {
  const { returnTo } = useAuthReturnState();
  const [loading, setLoading] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setRootError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const result = await AuthApi.sendResetPasswordLink(values.email);
      trackMutationOutcome(trackedMutationNames.authForgotPassword, "success", {
        emailDomain: values.email.split("@")[1] ?? "unknown",
        requestId: result.requestId,
      });
      setSuccessMessage(
        "If that email belongs to a verified account, a reset link is on its way.",
      );
    } catch (error) {
      captureException(trackedMutationNames.authForgotPassword, error, {
        emailDomain: values.email.split("@")[1] ?? "unknown",
      });
      trackMutationOutcome(trackedMutationNames.authForgotPassword, "error", {
        emailDomain: values.email.split("@")[1] ?? "unknown",
      });
      setRootError(
        AuthApi.getAuthErrorMessage(
          error,
          "We couldn't send a reset link right now. Please try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthSupportShell
      title="Reset your password"
      description="Enter your email and we'll send you a secure link to choose a new password."
      backNavigation={buildAuthRouteNavigation("/auth/login", returnTo)}
      backLabel="Back to login"
      footer={
        <p className="text-center text-sm text-slate-muted">
          Need a fresh start instead?{" "}
          <Link
            {...buildAuthRouteNavigation("/auth/register", returnTo)}
            className="font-medium text-forge-teal hover:underline"
          >
            Create an account
          </Link>
          .
        </p>
      }
    >
      {rootError ? <FormLevelError message={rootError} /> : null}

      {successMessage ? (
        <div className="rounded-2xl border border-forge-teal/20 bg-forge-teal/8 px-4 py-3 text-sm text-foreground">
          {successMessage}
        </div>
      ) : null}

      <Form {...form}>
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-0 text-left">
                <FormLabel className="font-sans text-sm font-semibold text-foreground">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="h-11 px-3.5 rounded-xl border border-border bg-background font-sans text-sm text-foreground placeholder:text-slate-muted/70 hover:border-forge-teal/40 focus-visible:border-forge-teal focus-visible:ring-2 focus-visible:ring-forge-teal/15 transition-all duration-200"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs font-medium text-destructive mt-1" />
              </FormItem>
            )}
          />

          <Button type="submit" loading={loading} size="lg" className="w-full">
            Send reset link
            <ArrowRightAnimated />
          </Button>
        </form>
      </Form>
    </AuthSupportShell>
  );
}
