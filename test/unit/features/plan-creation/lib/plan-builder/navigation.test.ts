import { describe, expect, it } from "vitest";

import {
  getNextStep,
  getPreviousStep,
  normalizeStep,
  type Step,
} from "@/features/plan-creation/lib/plan-builder";

describe("planCreation wizard navigation", () => {
  it("moves forward through every step and stays capped at invite", () => {
    const transitions: Array<[Step, Step]> = [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 7],
    ];

    for (const [from, to] of transitions) {
      expect(getNextStep(from)).toBe(to);
    }
  });

  it("moves backward through editable steps and intentionally keeps result self-contained", () => {
    const transitions: Array<[Step, Step]> = [
      [1, 1],
      [2, 1],
      [3, 2],
      [4, 3],
      [5, 5],
      [6, 5],
      [7, 6],
    ];

    for (const [from, to] of transitions) {
      expect(getPreviousStep(from)).toBe(to);
    }
  });

  it("normalizes runtime step values into the supported wizard range", () => {
    expect(normalizeStep(1)).toBe(1);
    expect(normalizeStep(7)).toBe(7);
    expect(normalizeStep(0)).toBe(1);
    expect(normalizeStep(8)).toBe(7);
    expect(normalizeStep(3.5)).toBe(1);
    expect(normalizeStep(Number.NaN)).toBe(1);
    expect(normalizeStep(null)).toBe(1);
    expect(normalizeStep(undefined)).toBe(1);
  });

  it("keeps navigation bounded for unsafe runtime values", () => {
    expect(getNextStep(0)).toBe(2);
    expect(getNextStep(8)).toBe(7);
    expect(getNextStep(Number.NaN)).toBe(2);
    expect(getPreviousStep(0)).toBe(1);
    expect(getPreviousStep(8)).toBe(6);
    expect(getPreviousStep(Number.NaN)).toBe(1);
  });
});
