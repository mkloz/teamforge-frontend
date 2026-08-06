import { useMutation, useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { AccountDataCommands } from "@/features/settings/api/account-data-commands";
import { SettingsCache } from "@/features/settings/api/settings-cache";
import { settingsQueries } from "@/features/settings/api/settings-queries";
import { ACCOUNT_DATA_COPY } from "@/features/settings/lib/account-data-copy";
import {
  getAccountDataErrorCode,
  RECENT_AUTH_REQUIRED_CODE,
} from "@/features/settings/lib/account-data-error";
import { reauthenticateCurrentSession } from "@/shared/api/auth-session-commands";
import { useCurrentSessionSignOut } from "@/shared/hooks/use-current-session-sign-out";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getBrowserDocument } from "@/shared/lib/browser-environment";
import { scheduleDelay } from "@/shared/lib/browser-scheduling";

interface UseAccountExportOptions {
  canReauthenticateWithPassword: boolean;
  enabled: boolean;
  userId: string | undefined;
}

type RecentAuthenticationAction = "request" | "retry" | "download";

export function useAccountExport({
  canReauthenticateWithPassword,
  enabled,
  userId,
}: UseAccountExportOptions) {
  const { signOut, isSigningOut } = useCurrentSessionSignOut();
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [requiresRecentAuth, setRequiresRecentAuth] = useState(false);
  const [reauthenticationError, setReauthenticationError] = useState<
    string | null
  >(null);
  const pendingRecentAuthenticationActionRef =
    useRef<RecentAuthenticationAction | null>(null);
  const query = useQuery({
    ...settingsQueries.accountExport(userId ?? "unknown"),
    enabled: enabled && Boolean(userId),
  });
  const requestMutation = useMutation({
    mutationFn: () =>
      AccountDataCommands.requestAccountExport(crypto.randomUUID()),
    meta: { errorToast: false },
  });
  const retryMutation = useMutation({
    mutationFn: () =>
      AccountDataCommands.retryAccountExport(crypto.randomUUID()),
    meta: { errorToast: false },
  });
  const reauthenticationMutation = useMutation({
    mutationFn: reauthenticateCurrentSession,
    meta: { errorToast: false },
  });

  function handleError(action: RecentAuthenticationAction, cause: unknown) {
    if (getAccountDataErrorCode(cause) === RECENT_AUTH_REQUIRED_CODE) {
      pendingRecentAuthenticationActionRef.current = action;
      setRequiresRecentAuth(true);
      setReauthenticationError(null);
      setError(null);
      return;
    }

    pendingRecentAuthenticationActionRef.current = null;
    setError(ACCOUNT_DATA_COPY.export[`${action}Error`]);
  }

  async function runExportCommand(action: "request" | "retry") {
    setError(null);
    setRequiresRecentAuth(false);

    if (
      guardOfflineAction({
        id: `settings-account-export-${action}-offline`,
        description: "Reconnect before creating your data export.",
      })
    ) {
      setError("You are offline. Reconnect before creating your data export.");
      return;
    }

    try {
      const result = await (action === "request"
        ? requestMutation.mutateAsync()
        : retryMutation.mutateAsync());

      if (userId) {
        SettingsCache.setAccountExport(userId, result.data);
      }
    } catch (cause) {
      handleError(action, cause);
    }
  }

  async function downloadExport() {
    setError(null);
    setRequiresRecentAuth(false);

    if (
      guardOfflineAction({
        id: "settings-account-export-download-offline",
        description: "Reconnect before downloading your data export.",
      })
    ) {
      setError(
        "You are offline. Reconnect before downloading your data export.",
      );
      return;
    }

    setIsDownloading(true);

    try {
      const result = await AccountDataCommands.downloadAccountExport();
      const objectUrl = URL.createObjectURL(result.blob);

      triggerDownload(objectUrl, result.fileName);
      scheduleDelay(() => URL.revokeObjectURL(objectUrl), 1_000);

      if (userId) {
        SettingsCache.markAccountExportConsumed(userId);
        void SettingsCache.invalidateAccountExport(userId);
      }
    } catch (cause) {
      handleError("download", cause);
    } finally {
      setIsDownloading(false);
    }
  }

  async function confirmRecentAuthentication(password: string) {
    setReauthenticationError(null);

    try {
      await reauthenticationMutation.mutateAsync(password);
    } catch {
      setReauthenticationError(
        "That password did not confirm your sign-in. Check it and try again.",
      );
      return false;
    }

    const pendingAction = pendingRecentAuthenticationActionRef.current;

    pendingRecentAuthenticationActionRef.current = null;
    setRequiresRecentAuth(false);

    if (pendingAction === "download") {
      await downloadExport();
    } else if (pendingAction) {
      await runExportCommand(pendingAction);
    }

    return true;
  }

  return {
    accountExport: query.data?.export ?? null,
    canReauthenticateWithPassword,
    clearReauthenticationError: () => setReauthenticationError(null),
    confirmRecentAuthentication,
    createExport: () => runExportCommand("request"),
    downloadExport,
    error:
      error ??
      (query.isError
        ? "We couldn't load your latest data export. Please try again."
        : null),
    hasLoadError: query.isError,
    isCreating: requestMutation.isPending,
    isDownloading,
    isLoading: query.isLoading,
    isOnline,
    isRetrying: retryMutation.isPending,
    isSigningInAgain: canReauthenticateWithPassword
      ? reauthenticationMutation.isPending
      : isSigningOut,
    reauthenticationError,
    refetch: query.refetch,
    requiresRecentAuth,
    retryExport: () => runExportCommand("retry"),
    signInAgain: signOut,
  };
}

function triggerDownload(url: string, fileName: string) {
  const browserDocument = getBrowserDocument();

  if (!browserDocument) {
    return;
  }

  const link = browserDocument.createElement("a");

  link.href = url;
  link.download = fileName;
  link.rel = "noopener noreferrer";
  browserDocument.body.append(link);
  link.click();
  link.remove();
}
