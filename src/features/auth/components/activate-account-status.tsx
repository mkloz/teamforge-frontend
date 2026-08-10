import { Link } from "@tanstack/react-router";

import { ErrorAuthLinkVisual } from "@/assets/error-state/error-auth-link";
import { LoadingBlock } from "@/shared/components/loading/loading-block";
import { Button } from "@/shared/components/ui/button";
import { Notice } from "@/shared/components/ui/notice";
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
      <div className="flex min-h-64 flex-col justify-center rounded-xl border border-border bg-background px-4 py-6 text-center">
        <span className="sr-only">
          Confirming your email and preparing your Findafew account.
        </span>
        <LoadingBlock className="mx-auto mb-4 size-10 rounded-full bg-brand-teal/18" />
        <LoadingBlock className="mx-auto h-3 w-full max-w-64 rounded-md" />
        <LoadingBlock className="mx-auto mt-2 h-3 w-44 rounded-md" />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex min-h-64 flex-col justify-center gap-4">
        <div className="px-4 py-5 text-center text-foreground text-sm">
          <ErrorAuthLinkVisual className="mx-auto mb-3 h-28 w-auto text-foreground" />
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
    <Notice
      role="status"
      tone="success"
      size="md"
      className="min-h-64 items-center px-4"
    >
      Your account is ready. Taking you back into Findafew now.
    </Notice>
  );
}
