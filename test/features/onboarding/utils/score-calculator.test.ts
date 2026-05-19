import { describe, expect, it } from "vitest";

import type {
  Dimension,
  IpipQuestion,
} from "@/features/onboarding/data/ipip-questions";
import {
  calculateVector,
  type RawAnswers,
  toDisplayPercent,
} from "@/features/onboarding/utils/score-calculator";

function question(
  id: number,
  dimension: Dimension,
  keyed: IpipQuestion["keyed"] = "+",
): IpipQuestion {
  return {
    id,
    dimension,
    keyed,
    text: `${dimension}-${id}`,
  };
}

describe("calculateVector", () => {
  it("scores keyed and reverse-keyed answers onto the -1..1 OCEAN range", () => {
    const vector = calculateVector(
      [
        question(1, "O", "+"),
        question(2, "O", "-"),
        question(3, "C", "+"),
        question(4, "C", "-"),
        question(5, "E", "+"),
      ],
      {
        1: 5,
        2: 1,
        3: 1,
        4: 5,
        5: 3,
      },
    );

    expect(vector.O).toBe(1);
    expect(vector.C).toBe(-1);
    expect(vector.E).toBe(0);
    expect(vector.softBoundary).toEqual(["E", "A", "N"]);
  });

  it("normalizes partial answers using only answered questions", () => {
    const vector = calculateVector(
      [question(1, "A", "+"), question(2, "A", "+"), question(3, "N", "-")],
      {
        1: 4,
        3: 5,
      },
    );

    expect(vector.A).toBe(0.5);
    expect(vector.N).toBe(-1);
  });

  it("ignores invalid runtime answer values instead of skewing scores", () => {
    const answers: RawAnswers = { 1: 5 };

    Reflect.set(answers, 2, 9);
    Reflect.set(answers, 3, Number.NaN);

    const vector = calculateVector(
      [question(1, "O", "+"), question(2, "O", "+"), question(3, "C", "-")],
      answers,
    );

    expect(vector.O).toBe(1);
    expect(vector.C).toBe(0);
  });
});

describe("toDisplayPercent", () => {
  it("maps normalized trait vectors to 0..100 display percentages", () => {
    expect(toDisplayPercent({ O: -1, C: 0, E: 1, A: 0.5, N: -1 }, "O")).toBe(0);
    expect(toDisplayPercent({ O: -1, C: 0, E: 1, A: 0.5, N: -1 }, "C")).toBe(
      50,
    );
    expect(toDisplayPercent({ O: -1, C: 0, E: 1, A: 0.5, N: -1 }, "E")).toBe(
      100,
    );
    expect(toDisplayPercent({ O: -1, C: 0, E: 1, A: 0.5, N: -1 }, "A")).toBe(
      75,
    );
  });

  it("inverts neuroticism for stability display", () => {
    expect(toDisplayPercent({ O: 0, C: 0, E: 0, A: 0, N: -1 }, "N")).toBe(100);
    expect(toDisplayPercent({ O: 0, C: 0, E: 0, A: 0, N: 1 }, "N")).toBe(0);
  });

  it("clamps non-normalized runtime values for display safety", () => {
    expect(toDisplayPercent({ O: 2, C: 0, E: 0, A: 0, N: 0 }, "O")).toBe(100);
    expect(toDisplayPercent({ O: 0, C: -2, E: 0, A: 0, N: 0 }, "C")).toBe(0);
    expect(
      toDisplayPercent({ O: Number.NaN, C: 0, E: 0, A: 0, N: 0 }, "O"),
    ).toBe(50);
  });
});
