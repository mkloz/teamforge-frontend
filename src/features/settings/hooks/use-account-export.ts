import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { AccountDataCommands } from "@/features/settings/api/account-data-commands";
import { SettingsCache } from "@/features/settings/api/settings-cache";
import { settingsQueries } from "@/features/settings/api/settings-queries";
import { ACCOUNT_DATA_COPY } from "@/features/settings/lib/account-data-copy";
import {
  getAccountDataErrorCode,
  RECENT_AUTH_REQUIRED_CODE,
} from "@/features/settings/lib/account-data-error";
import { useCurrentSessionSignOut } from "@/shared/hooks/use-current-session-sign-out";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getBrowserDocument } from "@/shared/lib/browser-environment";
import { scheduleDelay } from "@/shared/lib/browser-scheduling";

interface UseAccountExportOptions {
  enabled: boolean;
  userId: string | undefined;
}

export function useAccountExport({ enabled, userId }: UseAccountExportOptions) {
  const { signOut, isSigningOut } = useCurrentSessionSignOut();
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [requiresRecentAuth, setRequiresRecentAuth] = useState(false);
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

  function handleError(
    action: "request" | "retry" | "download",
    cause: unknown,
  ) {
    if (getAccountDataErrorCode(cause) === RECENT_AUTH_REQUIRED_CODE) {
      setRequiresRecentAuth(true);
      setError(null);
      return;
    }

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

  return {
    accountExport: query.data?.export ?? null,
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
    isSigningInAgain: isSigningOut,
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
