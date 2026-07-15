import { Link } from "@tanstack/react-router";
import { ExternalLink, KeyRound, Mail } from "lucide-react";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { buildProfileNavigation } from "@/shared/navigation/profile-navigation";
import type { User } from "@/shared/schemas";

interface PasswordRecoverySectionProps {
  currentUser: User | undefined;
  isOnline: boolean;
  isSendingPasswordResetLink: boolean;
  securityError: string | null;
  onSendPasswordResetLink: () => Promise<unknown>;
}

interface PasswordRecoveryViewState {
  description: string;
  isEmailAccount: boolean;
  resetButtonDisabled: boolean;
  resetButtonLabel: string;
  resetConfirmLabel: string;
  resetDescription: string;
}

type PasswordResetProgress = "idle" | "pending";

const GOOGLE_PASSWORD_RECOVERY_DESCRIPTION =
  "This account signs in with Google, so password changes are managed by Google instead of TeamForge.";
const EMAIL_PASSWORD_RECOVERY_DESCRIPTION =
  "Send a password reset link to your email if you want to change your password.";

const PASSWORD_RESET_BUTTON_LABELS = {
  idle: "Send reset link",
  pending: "Sending link...",
} as const satisfies Record<PasswordResetProgress, string>;

const PASSWORD_RESET_CONFIRM_LABELS = {
  idle: "Send reset link",
  pending: "Sending...",
} as const satisfies Record<PasswordResetProgress, string>;

export function PasswordRecoverySection({
  currentUser,
  isOnline,
  isSendingPasswordResetLink,
  securityError,
  onSendPasswordResetLink,
}: PasswordRecoverySectionProps) {
  const viewState = getPasswordRecoveryViewState({
    currentUser,
    isOnline,
    isSendingPasswordResetLink,
  });

  return (
    <div className="mt-8 border-border border-t pt-6">
      <h3 className="font-semibold text-base text-ink">Password & recovery</h3>
      <p className="mt-1 text-slate-muted text-sm">{viewState.description}</p>

      {securityError && (
        <p className="mt-4 text-destructive text-sm">{securityError}</p>
      )}

      <PasswordRecoveryActions
        isSendingPasswordResetLink={isSendingPasswordResetLink}
        onSendPasswordResetLink={onSendPasswordResetLink}
        viewState={viewState}
      />
    </div>
  );
}

function PasswordRecoveryActions({
  isSendingPasswordResetLink,
  onSendPasswordResetLink,
  viewState,
}: {
  isSendingPasswordResetLink: boolean;
  onSendPasswordResetLink: () => Promise<unknown>;
  viewState: PasswordRecoveryViewState;
}) {
  return (
    <div className="responsive-action-grid mt-5 grid gap-3">
      {viewState.isEmailAccount ? (
        <PasswordResetAction
          isSendingPasswordResetLink={isSendingPasswordResetLink}
          onSendPasswordResetLink={onSendPasswordResetLink}
          viewState={viewState}
        />
      ) : (
        <GoogleManagedPasswordButton />
      )}

      <Button asChild variant="outline" size="compact" className="min-w-0">
        <Link {...buildProfileNavigation()}>
          <ExternalLink className="size-4" aria-hidden="true" />
          View public profile
        </Link>
      </Button>
    </div>
  );
}

function PasswordResetAction({
  isSendingPasswordResetLink,
  onSendPasswordResetLink,
  viewState,
}: {
  isSendingPasswordResetLink: boolean;
  onSendPasswordResetLink: () => Promise<unknown>;
  viewState: PasswordRecoveryViewState;
}) {
  return (
    <ActionDialog
      cancelLabel="Not now"
      confirmLabel={viewState.resetConfirmLabel}
      description={viewState.resetDescription}
      details={[
        "Your current password stays active until you change it.",
        "You can ignore the email if you did not mean to request it.",
      ]}
      disabled={viewState.resetButtonDisabled}
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
          disabled={viewState.resetButtonDisabled}
        >
          <Mail className="size-4" aria-hidden="true" />
          {viewState.resetButtonLabel}
        </Button>
      }
    />
  );
}

function GoogleManagedPasswordButton() {
  return (
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
  );
}

function getPasswordRecoveryViewState({
  currentUser,
  isOnline,
  isSendingPasswordResetLink,
}: Pick<
  PasswordRecoverySectionProps,
  "currentUser" | "isOnline" | "isSendingPasswordResetLink"
>): PasswordRecoveryViewState {
  const progress = getPasswordResetProgress(isSendingPasswordResetLink);

  return {
    description: getPasswordRecoveryDescription(currentUser),
    isEmailAccount: isEmailAccount(currentUser),
    resetButtonDisabled: isPasswordResetDisabled({
      isOnline,
      isSendingPasswordResetLink,
    }),
    resetButtonLabel: PASSWORD_RESET_BUTTON_LABELS[progress],
    resetConfirmLabel: PASSWORD_RESET_CONFIRM_LABELS[progress],
    resetDescription: getPasswordResetDescription(currentUser),
  };
}

function getPasswordResetProgress(
  isSendingPasswordResetLink: boolean,
): PasswordResetProgress {
  return isSendingPasswordResetLink ? "pending" : "idle";
}

function getPasswordRecoveryDescription(currentUser: User | undefined) {
  return isGoogleAccount(currentUser)
    ? GOOGLE_PASSWORD_RECOVERY_DESCRIPTION
    : EMAIL_PASSWORD_RECOVERY_DESCRIPTION;
}

function isGoogleAccount(currentUser: User | undefined) {
  return currentUser?.authProvider === "GOOGLE";
}

function isEmailAccount(currentUser: User | undefined) {
  return currentUser?.authProvider === "EMAIL";
}

function isPasswordResetDisabled({
  isOnline,
  isSendingPasswordResetLink,
}: Pick<
  PasswordRecoverySectionProps,
  "isOnline" | "isSendingPasswordResetLink"
>) {
  return !isOnline || isSendingPasswordResetLink;
}

function getPasswordResetDescription(currentUser: User | undefined) {
  return `We'll email a password reset link to ${currentUser?.email ?? ""}.`;
}
