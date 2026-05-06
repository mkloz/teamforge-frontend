import { useEffect, useState } from "react";

import type { TestLength } from "@/features/onboarding/data/ipip-questions";

import {
  getLengthProgress,
  getLengthSelectorActionLabel,
  getLengthSelectorContent,
  type LengthSelectorMode,
} from "./length-selector-options";

interface UseLengthSelectorParams {
  answers: Record<number, number>;
  initialLength: TestLength;
  mode: LengthSelectorMode;
  onBegin: (length: TestLength) => void;
  onSelectionChange?: (length: TestLength) => void;
}

export function useLengthSelector({
  answers,
  initialLength,
  mode,
  onBegin,
  onSelectionChange,
}: UseLengthSelectorParams) {
  const [selectedLength, setSelectedLength] =
    useState<TestLength>(initialLength);
  const selectedProgress = getLengthProgress(selectedLength, answers);

  useEffect(() => {
    onSelectionChange?.(selectedLength);
  }, [selectedLength, onSelectionChange]);

  return {
    actionLabel: getLengthSelectorActionLabel(
      mode,
      selectedProgress.isComplete,
    ),
    content: getLengthSelectorContent(mode),
    handleBegin: () => onBegin(selectedLength),
    isAdjust: mode === "adjust",
    selectedLength,
    setSelectedLength,
  };
}
