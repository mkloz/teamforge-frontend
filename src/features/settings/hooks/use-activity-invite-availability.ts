import { useMutation, useQuery } from "@tanstack/react-query";
import { type RefObject, useRef, useState } from "react";
import { ActivityInviteAvailabilityApi } from "@/features/settings/api/activity-invite-availability.api";
import {
  ACTIVITY_INVITE_AVAILABILITY_POLICY_VERSION,
  type ActivityInviteAvailability,
  type UpdateActivityInviteAvailability,
} from "@/features/settings/schemas/activity-invite-availability.schema";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";

export type ActivityInviteAvailabilityAction = "pause" | "reconfirm" | "update";

type AvailabilityCommand =
  | { action: "pause"; expectedRevision: number }
  | { action: "reconfirm"; expectedRevision: number }
  | ({ action: "update" } & Omit<
      UpdateActivityInviteAvailability,
      "policyVersion"
    >);

interface PendingOperation {
  fingerprint: string;
  idempotencyKey: string;
}

export interface ActivityInviteAvailabilityState {
  availability: ActivityInviteAvailability | null;
  activeAction: ActivityInviteAvailabilityAction | null;
  error: string | null;
  isLoading: boolean;
  isLoadError: boolean;
  isOnline: boolean;
  isRefreshing: boolean;
  isStateError: boolean;
  onPause: (expectedRevision: number) => Promise<void>;
  onReconfirm: (expectedRevision: number) => Promise<void>;
  onRetry: () => void;
  onUpdate: (
    payload: Omit<UpdateActivityInviteAvailability, "policyVersion">,
  ) => Promise<void>;
}

export function useActivityInviteAvailability({
  enabled,
}: {
  enabled: boolean;
}): ActivityInviteAvailabilityState {
  const [error, setError] = useState<string | null>(null);
  const operationRef = useRef<PendingOperation | null>(null);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const query = useQuery({
    queryKey: APP_QUERY_KEYS.settings.activityInviteAvailability,
    queryFn: () => ActivityInviteAvailabilityApi.get(),
    enabled,
    staleTime: 30_000,
  });
  const mutation = useMutation({
    mutationFn: runAvailabilityCommand,
    onSuccess: (result) => {
      operationRef.current = null;
      appQueryClient.setQueryData(
        APP_QUERY_KEYS.settings.activityInviteAvailability,
        result.data,
      );
      setError(null);
    },
    onError: (mutationError) => {
      setError(
        getApiErrorMessage(
          mutationError,
          "We could not update activity invitations. Refresh and try again.",
          {
            conflictMessage:
              "This setting changed elsewhere. Refresh it before trying again.",
          },
        ),
      );
      void invalidateActivityInviteAvailability();
    },
  });

  async function runCommand(command: AvailabilityCommand) {
    if (
      guardOfflineAction({
        id: "activity-invite-availability-offline",
        description: "Reconnect before changing activity invitations.",
      })
    ) {
      setError("You are offline. Reconnect before changing this setting.");
      return;
    }

    setError(null);
    const fingerprint = JSON.stringify(command);
    const idempotencyKey = getOperationKey(operationRef, fingerprint);

    await mutation
      .mutateAsync({ command, idempotencyKey })
      .catch(() => undefined);
  }

  return {
    availability: query.data ?? null,
    activeAction: mutation.isPending
      ? (mutation.variables?.command.action ?? null)
      : null,
    error:
      error ??
      (query.isError
        ? "We could not load your activity invitation setting."
        : null),
    isLoading: query.isPending,
    isLoadError: query.isError && !query.data,
    isOnline,
    isRefreshing: query.isFetching && Boolean(query.data),
    isStateError: query.isError,
    onPause: (expectedRevision) =>
      runCommand({ action: "pause", expectedRevision }),
    onReconfirm: (expectedRevision) =>
      runCommand({ action: "reconfirm", expectedRevision }),
    onRetry: () => void query.refetch(),
    onUpdate: (payload) => runCommand({ action: "update", ...payload }),
  };
}

function invalidateActivityInviteAvailability() {
  return appQueryClient.invalidateQueries({
    queryKey: APP_QUERY_KEYS.settings.activityInviteAvailability,
  });
}

function getOperationKey(
  operationRef: RefObject<PendingOperation | null>,
  fingerprint: string,
) {
  if (operationRef.current?.fingerprint === fingerprint) {
    return operationRef.current.idempotencyKey;
  }

  const idempotencyKey = crypto.randomUUID();
  operationRef.current = { fingerprint, idempotencyKey };
  return idempotencyKey;
}

async function runAvailabilityCommand({
  command,
  idempotencyKey,
}: {
  command: AvailabilityCommand;
  idempotencyKey: string;
}) {
  const policyVersion = ACTIVITY_INVITE_AVAILABILITY_POLICY_VERSION;

  if (command.action === "pause") {
    return ActivityInviteAvailabilityApi.pause(
      { expectedRevision: command.expectedRevision, policyVersion },
      idempotencyKey,
    );
  }

  if (command.action === "reconfirm") {
    return ActivityInviteAvailabilityApi.reconfirm(
      { expectedRevision: command.expectedRevision, policyVersion },
      idempotencyKey,
    );
  }

  return ActivityInviteAvailabilityApi.update(
    {
      expectedRevision: command.expectedRevision,
      localEnabled: command.localEnabled,
      onlineEnabled: command.onlineEnabled,
      policyVersion,
    },
    idempotencyKey,
  );
}
