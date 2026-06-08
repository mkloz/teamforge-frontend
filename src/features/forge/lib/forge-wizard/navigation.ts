import type { Step } from "./types";

const FIRST_STEP = 1;
const LAST_STEP = 7;
const stepValues = [1, 2, 3, 4, 5, 6, 7] as const satisfies Step[];

const nextStepByStep = {
  1: 2,
  2: 3,
  3: 4,
  4: 5,
  5: 6,
  6: 7,
  7: 7,
} satisfies Record<Step, Step>;

const previousStepByStep = {
  1: 1,
  2: 1,
  3: 2,
  4: 3,
  5: 5,
  6: 5,
  7: 6,
} satisfies Record<Step, Step>;

export function normalizeStep(
  step: null | number | undefined,
  fallback: Step = FIRST_STEP,
): Step {
  if (isStep(step)) {
    return step;
  }

  if (typeof step === "number" && Number.isFinite(step)) {
    if (step < FIRST_STEP) {
      return FIRST_STEP;
    }

    if (step > LAST_STEP) {
      return LAST_STEP;
    }
  }

  return fallback;
}

export function getNextStep(step: null | number | undefined): Step {
  return nextStepByStep[normalizeStep(step)];
}

export function getPreviousStep(step: null | number | undefined): Step {
  return previousStepByStep[normalizeStep(step)];
}

function isStep(step: unknown): step is Step {
  return stepValues.some((stepValue) => stepValue === step);
}
