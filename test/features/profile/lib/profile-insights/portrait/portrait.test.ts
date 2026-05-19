import { describe, expect, it } from "vitest";
import { buildProfilePortrait } from "@/features/profile/lib/profile-insights/portrait";
import { describeLaneForPortrait } from "@/features/profile/lib/profile-insights/portrait/lane-portrait-language";
import {
  buildPortraitConfidenceNote,
  buildPortraitNote,
} from "@/features/profile/lib/profile-insights/portrait/portrait-note";
import {
  createActivityLane,
  createProfileInterest,
  createSocialProfileModel,
} from "../../../../../factories/profile-insights";
import { createUser } from "../../../../../factories/user";

describe("portrait language", () => {
  it("describes lane subjects with trimmed interest names capped at three", () => {
    expect(
      describeLaneForPortrait(
        createActivityLane({
          interests: [
            createProfileInterest("coding", " Coding "),
            createProfileInterest("ai", "AI"),
            createProfileInterest("coffee", "Coffee"),
            createProfileInterest("extra", "Extra"),
          ],
          key: "builder",
        }),
      ),
    ).toBe("rough ideas (Coding, AI and Coffee)");
  });

  it("builds focused and hybrid portrait models from social profile state", () => {
    const focused = buildProfilePortrait(createSocialProfileModel());

    expect(focused.mode).toBe("focused");
    expect(focused.title.length).toBeGreaterThan(0);
    expect(focused.details).toHaveLength(4);

    const hybrid = buildProfilePortrait(
      createSocialProfileModel({
        secondaryCandidate: {
          key: "curiousSpecialist",
          score: 9.5,
          share: 0.4,
          title: "Curious Specialist",
        },
      }),
    );

    expect(hybrid.mode).toBe("hybrid");
    expect(hybrid.lead).toContain("This is a blended read");
  });

  it("does not include non-finite age in the portrait note basis", () => {
    const socialProfile = createSocialProfileModel(
      {},
      {
        user: createUser({ age: Number.NaN, personalityType: "INTJ" }),
      },
    );

    expect(
      buildPortraitNote(socialProfile.context, socialProfile.candidates),
    ).not.toContain("NaN yrs");
  });

  it("uses confidence notes for blended, early, tension, and separated reads", () => {
    expect(
      buildPortraitConfidenceNote(
        createSocialProfileModel({
          secondaryCandidate: {
            key: "curiousSpecialist",
            score: 9.5,
            share: 0.4,
            title: "Curious Specialist",
          },
        }),
      ),
    ).toContain("blended read");

    expect(
      buildPortraitConfidenceNote(
        createSocialProfileModel({ confidence: "early" }),
      ),
    ).toContain("still light");

    expect(
      buildPortraitConfidenceNote(
        createSocialProfileModel(
          { confidence: "medium" },
          { tensions: [{ label: "Mixed cue", value: "Mixed detail" }] },
        ),
      ),
    ).toContain("mixed personality cue");

    expect(
      buildPortraitConfidenceNote(
        createSocialProfileModel({
          candidates: [
            {
              key: "focusedBuilder",
              score: 12,
              share: 0.7,
              title: "Focused Builder",
            },
            {
              key: "curiousSpecialist",
              score: 7,
              share: 0.3,
              title: "Curious Specialist",
            },
          ],
          confidence: "high",
        }),
      ),
    ).toContain("same direction");
  });
});
