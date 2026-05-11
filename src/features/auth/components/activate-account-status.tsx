import { Link } from "@tanstack/react-router";

import { ErrorAuthLinkVisual } from "@/assets/error-state/error-auth-link";
import { Button } from "@/shared/components/ui/button";
import { buildAuthRouteNavigation } from "@/shared/lib/auth-route";

interface ActivateAccountStatusProps {
  errorMessage: string | null;
  returnTo?: string | null;
  state: "loading" | "success" | "error";
}

export function ActivateAccountStatus({
  errorMessage,
  returnTo,
  state,
}: ActivateAccountStatusProps) {
  if (state === "loading") {
    return (
      <div className="rounded-xl border border-border bg-background px-4 py-6 text-center">
        <div className="mx-auto mb-4 size-9 animate-spin rounded-full border-2 border-forge-teal/20 border-t-forge-teal" />
        <p className="text-foreground text-sm">
          Confirming your email and preparing your TeamForge account.
        </p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-5 text-center text-foreground text-sm">
          <ErrorAuthLinkVisual className="mx-auto mb-3 w-28 text-foreground" />
          <p>{errorMessage}</p>
        </div>
        <Button asChild size="lg" className="w-full">
          <Link {...buildAuthRouteNavigation("/auth/register", returnTo)}>
            Request a new code
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-forge-teal/20 bg-forge-teal/8 px-4 py-3 text-foreground text-sm">
      Your account is ready. Taking you back into TeamForge now.
    </div>
  );
}
