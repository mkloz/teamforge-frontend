import type { AuthSession, User } from "@/shared/schemas";

export interface SecuritySettingsSectionProps {
  currentUser: User | undefined;
  sessions: AuthSession[];
  isOnline: boolean;
  isLoadingSessions: boolean;
  isSendingPasswordResetLink: boolean;
  isRevokingOtherSessions: boolean;
  isDeletingAccount: boolean;
  revokingSessionId: string | null;
  securityError: string | null;
  sessionsError: string | null;
  deleteAccountError: string | null;
  onSendPasswordResetLink: () => Promise<unknown>;
  onRevokeSession: (session: AuthSession) => Promise<void>;
  onRevokeOtherSessions: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
}
