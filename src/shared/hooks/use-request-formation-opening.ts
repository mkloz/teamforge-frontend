import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";

import {
  deleteCurrentFormationOpeningApplication,
  postFormationOpeningApplication,
} from "@/shared/api/formation-opening-api";
import { invalidateFormationOpeningApplicationSurfaces } from "@/shared/api/query-invalidation";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getHttpErrorStatus } from "@/shared/lib/api-error-message";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import type { ExploreFormationOpening } from "@/shared/schemas";

const TERMINAL_OPENING_STATUSES = new Set([403, 404, 409, 410]);

export type FormationOpeningRequestState =
  | "idle"
  | "pending"
  | "requested"
  | "closed"
  | "error";

export function useRequestFormationOpening(opening: ExploreFormationOpening) {
  const applyOperationKeyRef = useRef<string | null>(null);
  const withdrawOperationKeyRef = useRef<string | null>(null);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const applyMutation = useMutation({
    meta: {
      errorToast: false,
      telemetryName: trackedMutationNames.exploreRequestFormationOpening,
    },
    mutationKey: ["formation-opening", opening.id, "request-place"],
    mutationFn: (idempotencyKey: string) =>
      postFormationOpeningApplication(opening.id, idempotencyKey),
    onSuccess: async (result) => {
      trackMutationOutcome(
        trackedMutationNames.exploreRequestFormationOpening,
        "success",
        { openingId: opening.id, requestId: result.requestId },
      );
      await invalidateFormationOpeningApplicationSurfaces();
    },
    onError: async (error) => {
      trackMutationOutcome(
        trackedMutationNames.exploreRequestFormationOpening,
        "error",
        { openingId: opening.id },
      );

      if (isTerminalFormationOpeningError(error)) {
        await invalidateFormationOpeningApplicationSurfaces();
      }
    },
  });
  const application =
    opening.viewerApplication ?? applyMutation.data?.data.application ?? null;
  const withdrawMutation = useMutation({
    meta: {
      errorToast: false,
      telemetryName: trackedMutationNames.exploreWithdrawFormationOpening,
    },
    mutationKey: ["formation-opening", opening.id, "withdraw-request"],
    mutationFn: ({
      idempotencyKey,
      version,
    }: {
      idempotencyKey: string;
      version: number;
    }) =>
      deleteCurrentFormationOpeningApplication(
        opening.id,
        version,
        idempotencyKey,
      ),
    onSuccess: async (result) => {
      trackMutationOutcome(
        trackedMutationNames.exploreWithdrawFormationOpening,
        "success",
        { openingId: opening.id, requestId: result.requestId },
      );
      await invalidateFormationOpeningApplicationSurfaces();
    },
    onError: async (error) => {
      trackMutationOutcome(
        trackedMutationNames.exploreWithdrawFormationOpening,
        "error",
        { openingId: opening.id },
      );

      if (isTerminalFormationOpeningError(error)) {
        await invalidateFormationOpeningApplicationSurfaces();
      }
    },
  });

  function requestPlace() {
    if (
      guardOfflineAction({
        id: `formation-opening-${opening.id}-offline`,
        description: "Reconnect before requesting this place.",
      })
    ) {
      return;
    }

    applyOperationKeyRef.current ??= crypto.randomUUID();
    applyMutation.mutate(applyOperationKeyRef.current);
  }

  function withdrawRequest() {
    if (!application || application.state !== "PENDING") return;

    if (
      guardOfflineAction({
        id: `formation-opening-${opening.id}-withdraw-offline`,
        description: "Reconnect before withdrawing this request.",
      })
    ) {
      return;
    }

    withdrawOperationKeyRef.current ??= crypto.randomUUID();
    withdrawMutation.mutate({
      idempotencyKey: withdrawOperationKeyRef.current,
      version: application.version,
    });
  }

  return {
    applyError: applyMutation.error,
    didWithdraw: withdrawMutation.isSuccess,
    isApplyPending: applyMutation.isPending,
    isOnline,
    isWithdrawPending: withdrawMutation.isPending,
    requestPlace,
    requestState: getFormationOpeningRequestState({
      applyMutation,
      hasPendingApplication: application?.state === "PENDING",
      withdrawMutation,
    }),
    withdrawError: withdrawMutation.error,
    withdrawRequest,
  };
}

function getFormationOpeningRequestState({
  applyMutation,
  hasPendingApplication,
  withdrawMutation,
}: {
  applyMutation: {
    error: unknown;
    isError: boolean;
    isPending: boolean;
  };
  hasPendingApplication: boolean;
  withdrawMutation: {
    error: unknown;
    isError: boolean;
    isSuccess: boolean;
  };
}): FormationOpeningRequestState {
  if (withdrawMutation.isSuccess) return "closed";
  if (
    withdrawMutation.isError &&
    isTerminalFormationOpeningError(withdrawMutation.error)
  ) {
    return "closed";
  }
  if (hasPendingApplication) return "requested";
  if (applyMutation.isPending) return "pending";
  if (
    applyMutation.isError &&
    isTerminalFormationOpeningError(applyMutation.error)
  ) {
    return "closed";
  }
  if (applyMutation.isError) return "error";
  return "idle";
}

function isTerminalFormationOpeningError(error: unknown) {
  const status = getHttpErrorStatus(error);

  return status !== null && TERMINAL_OPENING_STATUSES.has(status);
}
