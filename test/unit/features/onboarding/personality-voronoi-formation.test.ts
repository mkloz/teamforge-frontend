import { describe, expect, it } from "vitest";

import type { IpipQuestion } from "@/features/onboarding/data/ipip-questions";
import {
  getDynamicPageItems,
  initializeDynamicAssessment,
} from "@/features/onboarding/lib/dynamic-personality-engine";
import { getPersonalityVoronoiFormation } from "@/features/onboarding/lib/personality-voronoi-formation";

const QUESTIONS: IpipQuestion[] = [
  { dimension: "O", id: 1, keyed: "+", text: "Open" },
  { dimension: "C", id: 2, keyed: "+", text: "Prepared" },
  { dimension: "E", id: 3, keyed: "+", text: "Social" },
  { dimension: "A", id: 4, keyed: "+", text: "Warm" },
];

describe("personality Voronoi formation", () => {
  it("resolves only the MBTI letters supported by answers so far", () => {
    expect(
      getPersonalityVoronoiFormation({
        answers: { 1: 5 },
        dynamicState: null,
        pendingDynamicAnswers: {},
        questions: QUESTIONS,
        result: null,
      }),
    ).toMatchObject({
      kind: "text",
      value: "?N??",
      accentCharacterIndices: [],
    });
  });

  it("marks a resolved letter amber when its score sits in the intersection range", () => {
    expect(
      getPersonalityVoronoiFormation({
        answers: { 1: 3 },
        dynamicState: null,
        pendingDynamicAnswers: {},
        questions: QUESTIONS,
        result: null,
      }),
    ).toMatchObject({
      kind: "text",
      value: "?S??",
      accentCharacterIndices: [1],
    });
  });

  it("changes the target when the user's answers change", () => {
    const introverted = getPersonalityVoronoiFormation({
      answers: { 1: 5, 2: 5, 3: 1, 4: 5 },
      dynamicState: null,
      pendingDynamicAnswers: {},
      questions: QUESTIONS,
      result: null,
    });
    const extraverted = getPersonalityVoronoiFormation({
      answers: { 1: 5, 2: 5, 3: 5, 4: 5 },
      dynamicState: null,
      pendingDynamicAnswers: {},
      questions: QUESTIONS,
      result: null,
    });

    expect(introverted).toMatchObject({ kind: "text", value: "INFJ" });
    expect(extraverted).toMatchObject({ kind: "text", value: "ENFJ" });
  });

  it("starts with a human prompt until an answer provides a signal", () => {
    expect(
      getPersonalityVoronoiFormation({
        answers: {},
        dynamicState: null,
        pendingDynamicAnswers: {},
        questions: QUESTIONS,
        result: null,
      }),
    ).toEqual({ kind: "text", value: "YOU" });
  });

  it("uses pending dynamic answers before the current page is committed", () => {
    const dynamicState = initializeDynamicAssessment("formation-test-seed");
    const personalityItem = getDynamicPageItems(dynamicState.currentPage).find(
      (item) => item.dimension !== "N",
    );

    expect(personalityItem).toBeDefined();
    if (!personalityItem) return;

    const formation = getPersonalityVoronoiFormation({
      answers: {},
      dynamicState,
      pendingDynamicAnswers: { [personalityItem.itemVersionId]: 5 },
      questions: QUESTIONS,
      result: null,
    });

    expect(formation.kind).toBe("text");
    if (formation.kind !== "text") return;
    expect(formation.value.match(/\?/g)).toHaveLength(3);
  });

  it("uses the saved result as the final authoritative formation", () => {
    expect(
      getPersonalityVoronoiFormation({
        answers: {},
        dynamicState: null,
        pendingDynamicAnswers: {},
        questions: QUESTIONS,
        result: {
          assessmentId: "assessment-1",
          displayVersion: "display-1",
          instrumentVersion: "instrument-1",
          ocean: {
            agreeableness: 78,
            conscientiousness: 64,
            extraversion: 34,
            neuroticism: 42,
            openness: 82,
          },
          personalityType: "INFJ",
          scoringVersion: "scoring-1",
        },
      }),
    ).toMatchObject({
      kind: "text",
      value: "INFJ",
      accentCharacterIndices: [],
    });
  });

  it("uses amber for every final MBTI axis inside the shared boundary", () => {
    expect(
      getPersonalityVoronoiFormation({
        answers: {},
        dynamicState: null,
        pendingDynamicAnswers: {},
        questions: QUESTIONS,
        result: {
          assessmentId: "assessment-borderline",
          displayVersion: "display-1",
          instrumentVersion: "instrument-1",
          ocean: {
            agreeableness: 74,
            conscientiousness: 69,
            extraversion: 47,
            neuroticism: 42,
            openness: 56,
          },
          personalityType: "INFJ",
          scoringVersion: "scoring-1",
        },
      }),
    ).toMatchObject({
      kind: "text",
      value: "INFJ",
      accentCharacterIndices: [0, 1],
    });
  });
});
