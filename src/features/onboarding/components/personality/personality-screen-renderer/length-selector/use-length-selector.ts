import { useEffect, useState } from "react";

import type { TestLength } from "@/features/onboarding/data/ipip-questions";

import {
  type AssessmentSelection,
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
  onBeginDynamic: () => void;
  onSelectionChange?: (length: TestLength) => void;
}

export function useLengthSelector({
  answers,
  initialLength,
  mode,
  onBegin,
  onBeginDynamic,
  onSelectionChange,
}: UseLengthSelectorParams) {
  const [selection, setSelection] = useState<AssessmentSelection>({
    kind: "fixed",
    length: initialLength,
  });
  const selectedProgress =
    selection.kind === "fixed"
      ? getLengthProgress(selection.length, answers)
      : { isComplete: false };

  useEffect(() => {
    if (selection.kind === "fixed") {
      onSelectionChange?.(selection.length);
    }
  }, [selection, onSelectionChange]);

  return {
    actionLabel: getLengthSelectorActionLabel(
      mode,
      selectedProgress.isComplete,
    ),
    content: getLengthSelectorContent(mode),
    handleBegin: () => {
      if (selection.kind === "dynamic") {
        onBeginDynamic();
        return;
      }

      onBegin(selection.length);
    },
    isAdjust: mode === "adjust",
    selection,
    setSelection,
  };
}
