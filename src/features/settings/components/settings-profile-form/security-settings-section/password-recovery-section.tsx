import { KeyRound, Mail } from "lucide-react";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { GroupedMenuItem } from "@/shared/components/ui/grouped-menu";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { StatusPill } from "@/shared/components/ui/status-pill";
import type { User } from "@/shared/schemas";

interface PasswordRecoverySectionProps {
  currentUser: User | undefined;
  isOnline: boolean;
  isSendingPasswordResetLink: boolean;
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
  "Google manages password recovery for this account.";
const EMAIL_PASSWORD_RECOVERY_DESCRIPTION =
  "Get a password reset link by email.";

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
  onSendPasswordResetLink,
}: PasswordRecoverySectionProps) {
  const viewState = getPasswordRecoveryViewState({
    currentUser,
    isOnline,
    isSendingPasswordResetLink,
  });

  return (
    <GroupedMenuItem>
      <div className="flex min-h-16 flex-wrap items-center gap-3 px-3 py-3 sm:flex-nowrap sm:px-5">
        <IconTile icon={KeyRound} shape="circle" size="lg" tone="neutral" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink text-sm">Password recovery</p>
          <p className="mt-0.5 text-slate-muted text-xs leading-relaxed">
            {viewState.description}
          </p>
        </div>
        <PasswordRecoveryAction
          isSendingPasswordResetLink={isSendingPasswordResetLink}
          onSendPasswordResetLink={onSendPasswordResetLink}
          viewState={viewState}
        />
      </div>
    </GroupedMenuItem>
  );
}

function PasswordRecoveryAction({
  isSendingPasswordResetLink,
  onSendPasswordResetLink,
  viewState,
}: {
  isSendingPasswordResetLink: boolean;
  onSendPasswordResetLink: () => Promise<unknown>;
  viewState: PasswordRecoveryViewState;
}) {
  if (!viewState.isEmailAccount) {
    return (
      <StatusPill size="xs" surface="soft" tone="neutral">
        Managed by Google
      </StatusPill>
    );
  }

  return (
    <PasswordResetAction
      isSendingPasswordResetLink={isSendingPasswordResetLink}
      onSendPasswordResetLink={onSendPasswordResetLink}
      viewState={viewState}
    />
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
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          disabled={viewState.resetButtonDisabled}
        >
          <Mail className="size-4" aria-hidden="true" />
          {viewState.resetButtonLabel}
        </Button>
      }
    />
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
