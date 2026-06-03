import { Link } from "@tanstack/react-router";
import { AuthSupportShell } from "@/features/auth/components/auth-support-shell";
import { FormLevelError } from "@/features/auth/components/form-level-error";
import { ResetPasswordForm } from "@/features/auth/components/reset-password";
import { useResetPasswordForm } from "@/features/auth/hooks/use-reset-password-form";
import { Notice } from "@/shared/components/ui/notice";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import {
  buildAuthRouteNavigation,
  useAuthReturnState,
} from "@/shared/lib/auth-route";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";

const RESET_PASSWORD_METADATA = createTeamForgePageMetadata({
  title: "New Password",
  description: "Choose a new password for your TeamForge account.",
});

export function ResetPasswordPage() {
  usePageMetadata(RESET_PASSWORD_METADATA);

  const { returnTo } = useAuthReturnState();
  const { form, isOnline, loading, onSubmit, rootError, success } =
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
        <Notice role="status" tone="success" size="md" className="px-4">
          Your password has been updated. You can head back to login now.
        </Notice>
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
