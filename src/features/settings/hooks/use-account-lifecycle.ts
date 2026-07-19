import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";

import { AccountDataCommands } from "@/features/settings/api/account-data-commands";
import { SettingsCache } from "@/features/settings/api/settings-cache";
import { SettingsCommands } from "@/features/settings/api/settings-commands";
import { settingsQueries } from "@/features/settings/api/settings-queries";
import { ACCOUNT_DATA_COPY } from "@/features/settings/lib/account-data-copy";
import { buildSettingsLoginNavigation } from "@/features/settings/lib/settings-auth-navigation";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";

interface UseAccountLifecycleOptions {
  enabled: boolean;
  userId: string | undefined;
}

export function useAccountLifecycle({
  enabled,
  userId,
}: UseAccountLifecycleOptions) {
  const navigate = useNavigate();
  const currentLocation = useRouterState({ select: (state) => state.location });
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const [error, setError] = useState<string | null>(null);
  const query = useQuery({
    ...settingsQueries.accountLifecycle(userId ?? "unknown"),
    enabled: enabled && Boolean(userId),
  });
  const deactivateMutation = useMutation({
    mutationFn: () => AccountDataCommands.deactivateAccount(),
    meta: { errorToast: false },
    onSuccess: async () => {
      SettingsCache.removeAccountData();
      SettingsCommands.clearAuthState();
      await navigate(buildSettingsLoginNavigation(currentLocation));
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () => AccountDataCommands.deleteAccount(),
    meta: { errorToast: false },
    onSuccess: async () => {
      SettingsCache.removeAccountData();
      SettingsCommands.clearAuthState();
      await navigate({ to: "/auth/login" });
    },
  });

  async function runAction(
    action: "deactivate" | "delete",
    mutate: () => Promise<unknown>,
  ) {
    const description =
      action === "deactivate"
        ? "Reconnect before deactivating your account."
        : "Reconnect before deleting your account.";

    if (
      guardOfflineAction({
        id: `settings-account-${action}-offline`,
        description,
      })
    ) {
      setError(`You are offline. ${description}`);
      return;
    }

    setError(null);

    try {
      await mutate();
    } catch {
      setError(
        action === "deactivate"
          ? ACCOUNT_DATA_COPY.lifecycle.deactivateError
          : ACCOUNT_DATA_COPY.lifecycle.deleteError,
      );
    }
  }

  return {
    accountLifecycle: query.data ?? null,
    deactivateAccount: () =>
      runAction("deactivate", () => deactivateMutation.mutateAsync()),
    deleteAccount: () =>
      runAction("delete", () => deleteMutation.mutateAsync()),
    error:
      error ??
      (query.isError
        ? "We couldn't load your account status. Please try again."
        : null),
    isDeleting: deleteMutation.isPending,
    isDeactivating: deactivateMutation.isPending,
    isError: query.isError,
    isLoading: query.isLoading,
    isOnline,
    refetch: query.refetch,
  };
}
