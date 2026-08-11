import { KeyRound, Mail } from "lucide-react";
import { SettingsActionDialog } from "@/features/settings/components/settings-action-dialog";
import { Button } from "@/shared/components/ui/button";
import { GroupedMenuItem } from "@/shared/components/ui/grouped-menu";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { getUserSignInMethods } from "@/shared/lib/user-sign-in-methods";
import type { User } from "@/shared/schemas";

interface PasswordRecoverySectionProps {
  currentUser: User | undefined;
  isOnline: boolean;
  isSendingPasswordResetLink: boolean;
  onSendPasswordResetLink: () => Promise<unknown>;
}

interface PasswordRecoveryViewState {
  description: string;
  hasPassword: boolean;
  resetButtonDisabled: boolean;
  resetButtonLabel: string;
  resetConfirmLabel: string;
  resetDescription: string;
}

type PasswordResetProgress = "idle" | "pending";

const EMAIL_PASSWORD_RECOVERY_DESCRIPTION =
  "Get a password reset link by email.";
const PASSWORD_SETUP_DESCRIPTION =
  "Add a password so you can also sign in with your email.";

const PASSWORD_RESET_BUTTON_LABELS = {
  idle: "Send reset link",
  pending: "Sending link...",
} as const satisfies Record<PasswordResetProgress, string>;

const PASSWORD_RESET_CONFIRM_LABELS = {
  idle: "Send reset link",
  pending: "Sending...",
} as const satisfies Record<PasswordResetProgress, string>;

const PASSWORD_SETUP_BUTTON_LABELS = {
  idle: "Set up password",
  pending: "Sending link...",
} as const satisfies Record<PasswordResetProgress, string>;

const PASSWORD_SETUP_CONFIRM_LABELS = {
  idle: "Send setup link",
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
          <p className="font-semibold text-ink text-sm">Email and password</p>
          <p className="mt-0.5 text-slate-muted text-xs leading-relaxed">
            {viewState.description}
          </p>
        </div>
        <PasswordResetAction
          isSendingPasswordResetLink={isSendingPasswordResetLink}
          onSendPasswordResetLink={onSendPasswordResetLink}
          viewState={viewState}
        />
      </div>
    </GroupedMenuItem>
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
    <SettingsActionDialog
      cancelLabel="Not now"
      confirmLabel={viewState.resetConfirmLabel}
      description={viewState.resetDescription}
      details={[
        viewState.hasPassword
          ? "Your current password stays active until you change it."
          : "The secure link lets you choose your first password.",
        "You can ignore the email if you did not mean to request it.",
      ]}
      disabled={viewState.resetButtonDisabled}
      loading={isSendingPasswordResetLink}
      onConfirm={onSendPasswordResetLink}
      title={
        viewState.hasPassword ? "Send a reset link?" : "Set up a password?"
      }
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
  const userHasPassword = hasPassword(currentUser);

  return {
    description: getPasswordRecoveryDescription(currentUser),
    hasPassword: userHasPassword,
    resetButtonDisabled: isPasswordResetDisabled({
      isOnline,
      isSendingPasswordResetLink,
    }),
    resetButtonLabel: userHasPassword
      ? PASSWORD_RESET_BUTTON_LABELS[progress]
      : PASSWORD_SETUP_BUTTON_LABELS[progress],
    resetConfirmLabel: userHasPassword
      ? PASSWORD_RESET_CONFIRM_LABELS[progress]
      : PASSWORD_SETUP_CONFIRM_LABELS[progress],
    resetDescription: getPasswordResetDescription(currentUser),
  };
}

function getPasswordResetProgress(
  isSendingPasswordResetLink: boolean,
): PasswordResetProgress {
  return isSendingPasswordResetLink ? "pending" : "idle";
}

function getPasswordRecoveryDescription(currentUser: User | undefined) {
  return hasPassword(currentUser)
    ? EMAIL_PASSWORD_RECOVERY_DESCRIPTION
    : PASSWORD_SETUP_DESCRIPTION;
}

function hasPassword(currentUser: User | undefined) {
  return getUserSignInMethods(currentUser).password;
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
  const linkPurpose = hasPassword(currentUser)
    ? "password reset"
    : "password setup";

  return `We'll email a secure ${linkPurpose} link to ${currentUser?.email ?? ""}.`;
}
