import { Link } from "@tanstack/react-router";
import { ActivateAccountStatus } from "@/features/auth/components/activate-account-status";
import { AuthSupportShell } from "@/features/auth/components/auth-support-shell";
import { useActivateAccount } from "@/features/auth/hooks/use-activate-account";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import {
  buildAuthRouteNavigation,
  useAuthReturnState,
} from "@/shared/lib/auth-route";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";

const ACTIVATE_ACCOUNT_METADATA = createTeamForgePageMetadata({
  title: "Activate Account",
  description: "Verify your email address and activate your TeamForge account.",
});

export function ActivateAccountPage() {
  usePageMetadata(ACTIVATE_ACCOUNT_METADATA);

  const { returnTo } = useAuthReturnState();
  const { errorMessage, state } = useActivateAccount(returnTo);

  return (
    <AuthSupportShell
      title="Activating your account"
      description="We're checking your verification link and signing you in securely."
      backNavigation={buildAuthRouteNavigation("/auth/login", returnTo)}
      backLabel="Back to login"
      footer={
        state === "error" ? (
          <p className="text-center text-slate-muted text-sm">
            Still stuck?{" "}
            <Link
              {...buildAuthRouteNavigation("/auth/register", returnTo)}
              className="font-medium text-forge-teal hover:underline"
            >
              Return to sign up
            </Link>
            .
          </p>
        ) : null
      }
    >
      <ActivateAccountStatus
        errorMessage={errorMessage}
        returnTo={returnTo}
        state={state}
      />
    </AuthSupportShell>
  );
}
