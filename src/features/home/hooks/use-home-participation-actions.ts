import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { HomeCommands } from "@/features/home/api/home-commands";
import { hasHomeParticipationDeadlinePassed } from "@/features/home/lib/home-participation-deadline";
import { invalidateGroupParticipationSurfaces } from "@/shared/api/query-invalidation";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { showAppInfoToast } from "@/shared/lib/app-toast";
import type { GroupParticipationStatus } from "@/shared/schemas";

export interface HomeParticipationAnswer {
  groupId: string;
  planId: string;
  responseDeadline: string | null;
  status: GroupParticipationStatus;
}

export function useHomeParticipationActions() {
  const [actionError, setActionError] = useState<string | null>(null);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const mutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't save your answer right now.",
    },
    mutationKey: ["home", "participation", "record"],
    mutationFn: (answer: HomeParticipationAnswer) =>
      HomeCommands.recordGroupParticipation(answer.groupId, {
        planId: answer.planId,
        status: answer.status,
      }),
  });

  async function answerParticipation(answer: HomeParticipationAnswer) {
    setActionError(null);

    if (hasHomeParticipationDeadlinePassed(answer.responseDeadline)) {
      showAppInfoToast("This check-in has closed.", {
        id: "home-participation-closed",
        description: "We're refreshing your queue.",
      });
      await invalidateGroupParticipationSurfaces(answer.groupId);
      return null;
    }

    if (
      guardOfflineAction({
        id: "home-participation-offline",
        description: "Reconnect before answering this check-in.",
      })
    ) {
      setActionError(
        "You are offline. Reconnect before answering this check-in.",
      );
      return null;
    }

    try {
      return await mutation.mutateAsync(answer);
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "We couldn't save your answer right now."),
      );
      return null;
    }
  }

  return {
    actionError,
    answerParticipation,
    clearActionError: () => setActionError(null),
    isOnline,
    isPending: mutation.isPending,
    pendingAnswer: mutation.variables ?? null,
  };
}
