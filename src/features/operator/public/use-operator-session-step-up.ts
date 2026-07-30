import { useMutation, useQuery } from "@tanstack/react-query";
import { HTTPError } from "ky";
import { useState } from "react";

import { operatorQueries } from "@/features/operator/api/operator-queries";
import type { OperatorReauthenticationDialogProps } from "@/features/operator/components/operator-reauthentication-dialog";
import { reauthenticateCurrentSession } from "@/shared/api/auth-session-commands";
import { showAppSuccessToast } from "@/shared/lib/app-toast";

interface UseOperatorSessionStepUpOptions {
  enabled?: boolean;
}

export function useOperatorSessionStepUp({
  enabled = true,
}: UseOperatorSessionStepUpOptions = {}) {
  const sessionQuery = useQuery({
    ...operatorQueries.session(),
    enabled,
  });
  const [reauthenticationOpen, setReauthenticationOpen] = useState(false);
  const reauthenticationMutation = useMutation({
    mutationKey: ["auth", "reauthenticate", "operator"],
    mutationFn: reauthenticateCurrentSession,
    onSuccess: async () => {
      await sessionQuery.refetch();
      setReauthenticationOpen(false);
      showAppSuccessToast("Identity confirmed. Retry the admin action.");
    },
  });

  function setReauthenticationDialogOpen(open: boolean) {
    if (reauthenticationMutation.isPending) return;
    reauthenticationMutation.reset();
    setReauthenticationOpen(open);
  }

  function requestStepUp() {
    reauthenticationMutation.reset();
    setReauthenticationOpen(true);
    void sessionQuery.refetch();
  }

  const reauthenticationDialogProps: OperatorReauthenticationDialogProps = {
    error: getReauthenticationError(reauthenticationMutation.error),
    loading: reauthenticationMutation.isPending,
    onConfirm: (password) => reauthenticationMutation.mutate(password),
    onOpenChange: setReauthenticationDialogOpen,
    open: reauthenticationOpen,
  };

  return {
    reauthenticationDialogProps,
    rejectCurrentStepUp: requestStepUp,
    sessionQuery,
  };
}

function getReauthenticationError(error: unknown) {
  if (!error) return null;

  if (
    error instanceof HTTPError &&
    (error.response.status === 400 || error.response.status === 401)
  ) {
    return "That password didn’t match. Try again.";
  }

  return "Verification could not be completed. Check your connection and try again.";
}

export { OperatorReauthenticationDialog } from "@/features/operator/components/operator-reauthentication-dialog";
