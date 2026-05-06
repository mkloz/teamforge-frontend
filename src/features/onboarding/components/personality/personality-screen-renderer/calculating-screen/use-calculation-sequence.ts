import { useAnimation } from "framer-motion";
import { useEffect, useEffectEvent, useMemo, useState } from "react";

import type { OceanVectorWithMeta } from "@/features/onboarding/utils/score-calculator";
import { captureException } from "@/shared/lib/telemetry";

import {
  CALCULATION_MESSAGES,
  getCalculationProgressRows,
} from "./calculation-progress";

const MESSAGE_INTERVAL_MS = 1500;
const SEQUENCE_START_DELAY_MS = 600;
const RESULT_PAUSE_MS = 1200;

interface UseCalculationSequenceParams {
  onDone: () => void;
  vector: OceanVectorWithMeta;
}

export function useCalculationSequence({
  onDone,
  vector,
}: UseCalculationSequenceParams) {
  const controls = useAnimation();
  const [messageIndex, setMessageIndex] = useState(0);
  const finishCalculation = useEffectEvent(() => {
    onDone();
  });
  const progressRows = useMemo(
    () => getCalculationProgressRows(vector),
    [vector],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(
        (currentIndex) => (currentIndex + 1) % CALCULATION_MESSAGES.length,
      );
    }, MESSAGE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const targetWidths = progressRows.map((row) => row.value);

    async function runSequence() {
      await sleep(SEQUENCE_START_DELAY_MS);

      if (cancelled) {
        return;
      }

      try {
        await controls.start((index: number) => ({
          width: `${targetWidths[index]}%`,
          transition: {
            type: "spring",
            stiffness: 40,
            damping: 12,
            delay: index * 0.25,
          },
        }));

        await sleep(RESULT_PAUSE_MS);

        if (!cancelled) {
          finishCalculation();
        }
      } catch (error) {
        captureException("onboarding.personalityCalculationAnimation", error);
        if (!cancelled) {
          finishCalculation();
        }
      }
    }

    runSequence();

    return () => {
      cancelled = true;
      controls.stop();
    };
  }, [controls, progressRows]);

  return {
    controls,
    message: CALCULATION_MESSAGES[messageIndex],
    progressRows,
  };
}

function sleep(durationMs: number) {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}
