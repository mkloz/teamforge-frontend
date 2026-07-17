import { useEffect, useState } from "react";

import { hasHomeParticipationDeadlinePassed } from "@/features/home/lib/home-participation-deadline";
import type { HomeGroup } from "@/features/home/schemas/home-group.schema";
import { cancelDelay, scheduleDelay } from "@/shared/lib/browser-scheduling";

const MAX_TIMEOUT_DELAY_MS = 2_147_483_647;

export function useParticipationDeadlineClock(groups: HomeGroup[]) {
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const scheduledAt = Math.max(currentTime, Date.now());
    const nextDeadline = getNextParticipationDeadline(groups, scheduledAt);

    if (nextDeadline === null) {
      return undefined;
    }

    const delay = Math.min(
      Math.max(nextDeadline - scheduledAt + 1, 0),
      MAX_TIMEOUT_DELAY_MS,
    );
    const timeout = scheduleDelay(() => {
      setCurrentTime((previous) => Math.max(Date.now(), previous + 1));
    }, delay);

    return () => cancelDelay(timeout);
  }, [currentTime, groups]);

  return Math.max(currentTime, Date.now());
}

function getNextParticipationDeadline(
  groups: HomeGroup[],
  currentTime: number,
) {
  let nextDeadline: number | null = null;

  for (const group of groups) {
    const deadline = group.pendingParticipationPlan?.responseDeadline ?? null;

    if (
      deadline === null ||
      hasHomeParticipationDeadlinePassed(deadline, currentTime)
    ) {
      continue;
    }

    const deadlineTime = Date.parse(deadline);
    nextDeadline =
      nextDeadline === null
        ? deadlineTime
        : Math.min(nextDeadline, deadlineTime);
  }

  return nextDeadline;
}
