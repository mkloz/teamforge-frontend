import { useMemo, useState } from "react";
import { z } from "zod";

import {
  getBrowserSessionStorageItem,
  removeBrowserSessionStorageItem,
  setBrowserSessionStorageItem,
} from "@/shared/lib/browser-environment/session-storage";
import {
  ONBOARDING_PRACTICE_TASKS,
  ONBOARDING_PRACTICE_VERSION,
  type OnboardingPracticeTaskId,
  onboardingPracticeTaskIds,
} from "./practice-model";

interface PracticeProgressSnapshot {
  completedTaskIds: OnboardingPracticeTaskId[];
  version: typeof ONBOARDING_PRACTICE_VERSION;
}

const practiceProgressSchema = z.object({
  completedTaskIds: z.array(z.enum(onboardingPracticeTaskIds)),
  version: z.literal(ONBOARDING_PRACTICE_VERSION),
});

function emptySnapshot(): PracticeProgressSnapshot {
  return {
    completedTaskIds: [],
    version: ONBOARDING_PRACTICE_VERSION,
  };
}

export function readPracticeProgress(storageKey: string) {
  const serialized = getBrowserSessionStorageItem(storageKey);

  if (!serialized) return emptySnapshot();

  try {
    const candidate = practiceProgressSchema.safeParse(JSON.parse(serialized));

    if (!candidate.success) {
      removeBrowserSessionStorageItem(storageKey);
      return emptySnapshot();
    }

    return {
      version: ONBOARDING_PRACTICE_VERSION,
      completedTaskIds: [...new Set(candidate.data.completedTaskIds)],
    };
  } catch {
    removeBrowserSessionStorageItem(storageKey);
    return emptySnapshot();
  }
}

export function useOnboardingPracticeProgress(storageKey: string) {
  const [snapshot, setSnapshot] = useState(() =>
    readPracticeProgress(storageKey),
  );
  const completedSet = useMemo(
    () => new Set(snapshot.completedTaskIds),
    [snapshot.completedTaskIds],
  );
  const firstIncompleteIndex = ONBOARDING_PRACTICE_TASKS.findIndex(
    (task) => !completedSet.has(task.id),
  );
  const [activeTaskId, setActiveTaskId] = useState<OnboardingPracticeTaskId>(
    ONBOARDING_PRACTICE_TASKS[
      firstIncompleteIndex < 0 ? 0 : firstIncompleteIndex
    ].id,
  );

  function completeTask(taskId: OnboardingPracticeTaskId) {
    if (completedSet.has(taskId)) return false;

    const completedTaskIds = [...snapshot.completedTaskIds, taskId];
    const nextSnapshot = {
      version: ONBOARDING_PRACTICE_VERSION,
      completedTaskIds,
    } satisfies PracticeProgressSnapshot;
    setSnapshot(nextSnapshot);
    setBrowserSessionStorageItem(storageKey, JSON.stringify(nextSnapshot));

    return true;
  }

  function reset() {
    removeBrowserSessionStorageItem(storageKey);
    setSnapshot(emptySnapshot());
    setActiveTaskId(ONBOARDING_PRACTICE_TASKS[0].id);
  }

  return {
    activeTaskId,
    completedTaskIds: snapshot.completedTaskIds,
    completeTask,
    isComplete:
      snapshot.completedTaskIds.length === ONBOARDING_PRACTICE_TASKS.length,
    reset,
    setActiveTaskId,
  };
}
