import { Link } from "@tanstack/react-router";

import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import { Button } from "@/shared/components/ui/button";
import type { User } from "@/shared/schemas";

interface PasswordRecoverySectionProps {
  currentUser: User | undefined;
  isSendingPasswordResetLink: boolean;
  securityMessage: string | null;
  securityError: string | null;
  onSendPasswordResetLink: () => Promise<unknown>;
}

export function PasswordRecoverySection({
  currentUser,
  isSendingPasswordResetLink,
  securityMessage,
  securityError,
  onSendPasswordResetLink,
}: PasswordRecoverySectionProps) {
  return (
    <div className="mt-8 border-border border-t pt-6">
      <h3 className="font-semibold text-base text-ink">Password & recovery</h3>
      <p className="mt-1 text-slate-muted text-sm">
        {currentUser?.authProvider === "GOOGLE"
          ? "This account signs in with Google, so password changes are managed by Google instead of TeamForge."
          : "Send a secure password reset link to your email if you want to rotate your password."}
      </p>

      {(securityMessage || securityError) && (
        <p
          className={`mt-4 text-sm ${securityError ? "text-destructive" : "text-forge-teal"}`}
        >
          {securityError ?? securityMessage}
        </p>
      )}

      <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,8rem),1fr))] gap-3">
        {currentUser?.authProvider === "EMAIL" ? (
          <Button
            type="button"
            variant="primary"
            className="min-w-0 px-3"
            disabled={isSendingPasswordResetLink}
            onClick={() => {
              void onSendPasswordResetLink();
            }}
          >
            {isSendingPasswordResetLink ? "Sending link..." : "Send reset link"}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="min-w-0 px-3"
            disabled
          >
            Password managed by Google
          </Button>
        )}

        <Button asChild variant="outline" className="min-w-0 px-3">
          <Link {...buildProfileNavigation()}>View public profile</Link>
        </Button>
      </div>
    </div>
  );
}
