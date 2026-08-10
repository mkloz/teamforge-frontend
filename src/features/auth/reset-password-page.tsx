import { Link } from "@tanstack/react-router";
import { AuthSupportShell } from "@/features/auth/components/auth-support-shell";
import { FormLevelError } from "@/features/auth/components/form-level-error";
import { ResetPasswordForm } from "@/features/auth/components/reset-password";
import { useResetPasswordForm } from "@/features/auth/hooks/use-reset-password-form";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import {
  buildAuthRouteNavigation,
  useAuthReturnState,
} from "@/shared/lib/auth-route";
import { createFindafewPageMetadata } from "@/shared/lib/findafew-page-metadata";

const RESET_PASSWORD_METADATA = createFindafewPageMetadata({
  title: "New Password",
  description: "Choose a new password for your Findafew account.",
});

export function ResetPasswordPage() {
  usePageMetadata(RESET_PASSWORD_METADATA);

  const { returnTo } = useAuthReturnState();
  const { form, isOnline, loading, onSubmit, progress, rootError, success } =
    useResetPasswordForm();

  return (
    <AuthSupportShell
      title={success ? "Password updated" : "Choose a new password"}
      description={
        success
          ? "Your new password is ready to use."
          : "This password will replace the old one for your Findafew account."
      }
      backNavigation={buildAuthRouteNavigation("/auth/login", returnTo)}
      backLabel="Back to login"
      progress={success ? 1 : progress}
    >
      {rootError ? <FormLevelError message={rootError} /> : null}

      {success ? (
        <p className="text-center text-slate-muted text-sm" role="status">
          Your password has been updated.{" "}
          <Link
            {...buildAuthRouteNavigation("/auth/login", returnTo)}
            className="font-medium text-foreground hover:underline"
          >
            Sign in now
          </Link>
          .
        </p>
      ) : (
        <ResetPasswordForm
          form={form}
          isOnline={isOnline}
          loading={loading}
          onSubmit={onSubmit}
        />
      )}
    </AuthSupportShell>
  );
}
