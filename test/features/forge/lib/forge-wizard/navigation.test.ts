import { describe, expect, it } from "vitest";

import {
  getNextStep,
  getPreviousStep,
  type Step,
} from "@/features/forge/lib/forge-wizard";

describe("forge wizard navigation", () => {
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
});
