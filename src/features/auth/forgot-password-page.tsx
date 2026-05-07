import { Link } from "@tanstack/react-router";

import {
  buildAuthRouteNavigation,
  useAuthReturnState,
} from "@/shared/lib/auth-route";

import { AuthSupportShell } from "@/features/auth/components/auth-support-shell";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { FormLevelError } from "@/features/auth/components/form-level-error";
import { useForgotPasswordForm } from "@/features/auth/hooks/use-forgot-password-form";

export function ForgotPasswordPage() {
  const { returnTo } = useAuthReturnState();
  const { form, loading, onSubmit, rootError, successMessage } =
    useForgotPasswordForm();

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
        <div className="rounded-xl border border-forge-teal/20 bg-forge-teal/8 px-4 py-3 text-sm text-foreground">
          {successMessage}
        </div>
      ) : null}

      <ForgotPasswordForm form={form} loading={loading} onSubmit={onSubmit} />
    </AuthSupportShell>
  );
}
