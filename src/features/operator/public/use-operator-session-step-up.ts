import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { operatorQueries } from "@/features/operator/api/operator-queries";
import { useCurrentSessionSignOut } from "@/shared/hooks/use-current-session-sign-out";

interface UseOperatorSessionStepUpOptions {
  enabled?: boolean;
}

export function useOperatorSessionStepUp({
  enabled = true,
}: UseOperatorSessionStepUpOptions = {}) {
  const { isSigningOut, signOut, signOutError } = useCurrentSessionSignOut();
  const sessionQuery = useQuery({
    ...operatorQueries.session(),
    enabled,
  });
  const stepUpAt = sessionQuery.data?.stepUpAt ?? null;
  const stepUpExpiresAt = sessionQuery.data?.stepUpExpiresAt ?? null;
  const stepUpIsCurrent = useCurrentStepUp(stepUpExpiresAt);
  const stepUpKey = `${stepUpAt ?? "not-verified"}:${stepUpExpiresAt ?? "no-expiry"}`;
  const [rejectedStepUpKey, setRejectedStepUpKey] = useState<string | null>(
    null,
  );

  return {
    hasCurrentStepUp:
      sessionQuery.isSuccess &&
      stepUpIsCurrent &&
      rejectedStepUpKey !== stepUpKey,
    isSigningInAgain: isSigningOut,
    signInAgainError: signOutError,
    rejectCurrentStepUp: () => {
      setRejectedStepUpKey(stepUpKey);
      void sessionQuery.refetch();
    },
    sessionQuery,
    signInAgain: signOut,
  };
}

function useCurrentStepUp(expiresAt: string | null) {
  const [checkedAt, setCheckedAt] = useState(() => Date.now());
  const expiresAtMs = expiresAt ? Date.parse(expiresAt) : Number.NaN;

  useEffect(() => {
    if (!Number.isFinite(expiresAtMs) || expiresAtMs <= checkedAt) {
      return undefined;
    }

    const delay = Math.min(Math.max(expiresAtMs - Date.now() + 50, 0), 60_000);
    const timeout = globalThis.setTimeout(
      () => setCheckedAt(Date.now()),
      delay,
    );
    return () => globalThis.clearTimeout(timeout);
  }, [checkedAt, expiresAtMs]);

  return Number.isFinite(expiresAtMs) && expiresAtMs > checkedAt;
}
