import { useState } from "react";

import type { TestLength } from "@/features/onboarding/data/ipip-questions";

import { canExtendIntermission, getIntermissionContent } from "./constants";

interface UseIntermissionPageParams {
  answeredCount: number;
  milestoneIndex: number;
  onContinue: () => void;
  onExtend: (length: TestLength) => void;
  totalQuestions: number;
}

export function useIntermissionPage({
  answeredCount,
  milestoneIndex,
  onContinue,
  onExtend,
  totalQuestions,
}: UseIntermissionPageParams) {
  const [selectedUpgrade, setSelectedUpgrade] = useState<TestLength | null>(
    null,
  );
  const content = getIntermissionContent(milestoneIndex);
  const isDone = answeredCount >= totalQuestions;
  const shouldShowExtension = isDone && canExtendIntermission(totalQuestions);

  function handleContinue() {
    if (selectedUpgrade) {
      onExtend(selectedUpgrade);
      return;
    }

    onContinue();
  }

  return {
    content,
    handleContinue,
    isDone,
    selectedUpgrade,
    setSelectedUpgrade,
    shouldShowExtension,
  };
}
