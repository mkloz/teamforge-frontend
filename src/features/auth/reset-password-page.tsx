import { Link } from "@tanstack/react-router";
import { AuthSupportShell } from "@/features/auth/components/auth-support-shell";
import { FormLevelError } from "@/features/auth/components/form-level-error";
import { ResetPasswordForm } from "@/features/auth/components/reset-password";
import { useResetPasswordForm } from "@/features/auth/hooks/use-reset-password-form";
import {
  buildAuthRouteNavigation,
  useAuthReturnState,
} from "@/shared/lib/auth-route";

export function ResetPasswordPage() {
  const { returnTo } = useAuthReturnState();
  const { form, loading, onSubmit, rootError, success } =
    useResetPasswordForm();

  return (
    <AuthSupportShell
      title="Choose a new password"
      description="This password will replace the old one for your TeamForge account."
      backNavigation={buildAuthRouteNavigation("/auth/login", returnTo)}
      backLabel="Back to login"
      footer={
        success ? (
          <p className="text-center text-slate-muted text-sm">
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
        <div className="rounded-xl border border-forge-teal/20 bg-forge-teal/8 px-4 py-3 text-foreground text-sm">
          Your password has been updated. You can head back to login now.
        </div>
      ) : (
        <ResetPasswordForm form={form} loading={loading} onSubmit={onSubmit} />
      )}
    </AuthSupportShell>
  );
}
