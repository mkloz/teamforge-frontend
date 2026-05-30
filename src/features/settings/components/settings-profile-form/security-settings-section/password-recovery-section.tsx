import { Link } from "@tanstack/react-router";
import { ExternalLink, KeyRound, Mail } from "lucide-react";

import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import type { User } from "@/shared/schemas";

interface PasswordRecoverySectionProps {
  currentUser: User | undefined;
  isSendingPasswordResetLink: boolean;
  securityError: string | null;
  onSendPasswordResetLink: () => Promise<unknown>;
}

export function PasswordRecoverySection({
  currentUser,
  isSendingPasswordResetLink,
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

      {securityError && (
        <p className="mt-4 text-destructive text-sm">{securityError}</p>
      )}

      <div className="responsive-action-grid mt-5 grid gap-3">
        {currentUser?.authProvider === "EMAIL" ? (
          <ActionDialog
            cancelLabel="Not now"
            confirmLabel={
              isSendingPasswordResetLink ? "Sending..." : "Send reset link"
            }
            description={`We'll email a password reset link to ${
              currentUser.email
            }.`}
            details={[
              "Your current password stays active until you change it.",
              "You can ignore the email if you did not mean to request it.",
            ]}
            disabled={isSendingPasswordResetLink}
            loading={isSendingPasswordResetLink}
            onConfirm={onSendPasswordResetLink}
            title="Send a reset link?"
            tone="info"
            trigger={
              <Button
                type="button"
                variant="primary"
                size="compact"
                className="min-w-0"
                disabled={isSendingPasswordResetLink}
              >
                <Mail className="size-4" aria-hidden="true" />
                {isSendingPasswordResetLink
                  ? "Sending link..."
                  : "Send reset link"}
              </Button>
            }
          />
        ) : (
          <Button
            type="button"
            variant="outline"
            size="compact"
            className="min-w-0"
            disabled
          >
            <KeyRound className="size-4" aria-hidden="true" />
            Password managed by Google
          </Button>
        )}

        <Button asChild variant="outline" size="compact" className="min-w-0">
          <Link {...buildProfileNavigation()}>
            <ExternalLink className="size-4" aria-hidden="true" />
            View public profile
          </Link>
        </Button>
      </div>
    </div>
  );
}
