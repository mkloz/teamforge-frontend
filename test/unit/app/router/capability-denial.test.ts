import { describe, expect, it } from "vitest";

import {
  getCapabilityDenialCopy,
  getCapabilityDenialNavigation,
} from "@/app/router/route-guards/capability-denial";

describe("capability denial navigation", () => {
  it("preserves a Forge return intent while requiring the full assessment", () => {
    expect(
      getCapabilityDenialNavigation({
        location: {
          pathname: "/forge",
          searchStr: "?open=true&step=3",
        },
        reasonCode: "FULL_ASSESSMENT_REQUIRED",
        safeDestination: "/explore",
      }),
    ).toEqual({
      to: "/onboarding/personality",
      search: {
        mode: "edit",
        returnTo: "/forge",
        returnSearch: "open=true&step=3",
      },
    });
  });

  it("returns to Forge after a required interests step without edit mode", () => {
    expect(
      getCapabilityDenialNavigation({
        location: { pathname: "/forge", searchStr: "" },
        reasonCode: "INTERESTS_REQUIRED",
        safeDestination: "/onboarding/interests",
      }),
    ).toEqual({
      to: "/onboarding/interests",
      search: { returnTo: "/forge" },
    });
  });

  it("does not invent a return intent for a relationship-only denial", () => {
    expect(
      getCapabilityDenialNavigation({
        location: { pathname: "/forge", searchStr: "" },
        reasonCode: "RELATIONSHIP_REQUIRED",
        safeDestination: "/explore",
      }),
    ).toEqual({ to: "/explore" });
  });

  it("explains both the missing requirement and the attempted action", () => {
    expect(
      getCapabilityDenialCopy({
        capability: "START_FORGE",
        reasonCode: "ASSESSMENT_OUTDATED",
      }),
    ).toEqual({
      title: "Refresh your matching assessment before you use Forge",
      description:
        "Your previous result is no longer current enough for matching. We’ll bring you back to what you were doing when it is ready.",
    });
  });

  it("preserves the exact incoming invitation destination through onboarding", () => {
    expect(
      getCapabilityDenialNavigation({
        location: {
          pathname: "/invite",
          searchStr: "?token=invite-token&source=email",
        },
        reasonCode: "PROFILE_BASICS_REQUIRED",
        safeDestination: "/onboarding/profile",
      }),
    ).toEqual({
      to: "/onboarding/profile",
      search: {
        mode: "edit",
        returnTo: "/invite",
        returnSearch: "token=invite-token&source=email",
      },
    });
  });
});
