import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { captureException, trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

import { Button } from "@/shared/components/ui/button";

import { AuthApi } from "./api/auth.api";
import { AuthQueries } from "./api/auth.queries";
import { AuthSupportShell } from "./components/auth-support-shell";
import {
  buildAuthRouteNavigation,
  buildPostAuthRedirectNavigation,
  useAuthReturnState,
} from "./lib/auth-return";

export function ActivateAccountPage() {
  const { token } = useParams({ from: "/auth/activate/$token" });
  const navigate = useNavigate();
  const { returnTo } = useAuthReturnState();
  const [state, setState] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const activate = async () => {
      setState("loading");
      setErrorMessage(null);

      try {
        const activationResult = await AuthApi.activateAccount(token);
        const user = await AuthQueries.ensureCurrentUser();

        if (!active) {
          return;
        }

        trackMutationOutcome(
          trackedMutationNames.authActivateAccount,
          "success",
          {
            requestId: activationResult.requestId,
          },
        );
        setState("success");
        await navigate(buildPostAuthRedirectNavigation(user, returnTo));
      } catch (error) {
        if (!active) {
          return;
        }

        captureException(trackedMutationNames.authActivateAccount, error);
        trackMutationOutcome(trackedMutationNames.authActivateAccount, "error");
        setErrorMessage(
          AuthApi.getAuthErrorMessage(
            error,
            "This activation link is no longer valid. Request a fresh verification code and try again.",
          ),
        );
        setState("error");
      }
    };

    void activate();

    return () => {
      active = false;
    };
  }, [navigate, returnTo, token]);

  return (
    <AuthSupportShell
      title="Activating your account"
      description="We're checking your verification link and signing you in securely."
      backNavigation={buildAuthRouteNavigation("/auth/login", returnTo)}
      backLabel="Back to login"
      footer={
        state === "error" ? (
          <p className="text-center text-sm text-slate-muted">
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
      {state === "loading" ? (
        <div className="rounded-2xl border border-border bg-background px-4 py-6 text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-forge-teal/20 border-t-forge-teal" />
          <p className="text-sm text-foreground">
            Confirming your email and preparing your TeamForge account.
          </p>
        </div>
      ) : null}

      {state === "error" ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-foreground">
            {errorMessage}
          </div>
          <Button asChild size="lg" className="w-full">
            <Link {...buildAuthRouteNavigation("/auth/register", returnTo)}>
              Request a new code
            </Link>
          </Button>
        </div>
      ) : null}

      {state === "success" ? (
        <div className="rounded-2xl border border-forge-teal/20 bg-forge-teal/8 px-4 py-3 text-sm text-foreground">
          Your account is ready. Taking you back into TeamForge now.
        </div>
      ) : null}
    </AuthSupportShell>
  );
}
