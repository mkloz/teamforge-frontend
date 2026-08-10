import { Link } from "@tanstack/react-router";
import { AuthSupportShell } from "@/features/auth/components/auth-support-shell";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { FormLevelError } from "@/features/auth/components/form-level-error";
import { useForgotPasswordForm } from "@/features/auth/hooks/use-forgot-password-form";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import {
  buildAuthRouteNavigation,
  useAuthReturnState,
} from "@/shared/lib/auth-route";
import { createFindafewPageMetadata } from "@/shared/lib/findafew-page-metadata";

const FORGOT_PASSWORD_METADATA = createFindafewPageMetadata({
  title: "Reset Password",
  description: "Request a password reset link for your Findafew account.",
});

export function ForgotPasswordPage() {
  usePageMetadata(FORGOT_PASSWORD_METADATA);

  const { returnTo } = useAuthReturnState();
  const { form, isOnline, loading, onSubmit, progress, rootError } =
    useForgotPasswordForm();

  return (
    <AuthSupportShell
      title="Reset your password"
      description="Enter your email and we'll send you a secure link to choose a new password."
      backNavigation={buildAuthRouteNavigation("/auth/login", returnTo)}
      backLabel="Back to login"
      progress={progress}
      footer={
        <p className="text-center text-slate-muted text-sm">
          Need a fresh start instead?{" "}
          <Link
            {...buildAuthRouteNavigation("/auth/register", returnTo)}
            className="font-medium text-foreground hover:underline"
          >
            Create an account
          </Link>
          .
        </p>
      }
    >
      {rootError ? <FormLevelError message={rootError} /> : null}

      <ForgotPasswordForm
        form={form}
        isOnline={isOnline}
        loading={loading}
        onSubmit={onSubmit}
      />
    </AuthSupportShell>
  );
}
