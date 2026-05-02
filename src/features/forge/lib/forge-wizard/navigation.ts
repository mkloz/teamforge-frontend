import type { Step } from "./types";

export function getNextStep(step: Step): Step {
  if (step === 1) return 2;
  if (step === 2) return 3;
  if (step === 3) return 4;
  if (step === 4) return 5;
  if (step === 5) return 6;
  return step;
}

export function getPreviousStep(step: Step): Step {
  if (step === 2) return 1;
  if (step === 3) return 2;
  if (step === 5) return 4;
  if (step === 6) return 5;
  return step;
}
