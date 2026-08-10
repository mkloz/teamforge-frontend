import { describe, expect, it } from "vitest";

import { getLocalFormationLocationState } from "@/features/plan-creation/hooks/plan-builder/group-formation-execution-input";

describe("local formation location state", () => {
  it("blocks local formation when neither the plan nor profile has coordinates", () => {
    expect(
      getLocalFormationLocationState({
        groupFormationScope: "LOCAL",
        locationContext: {
          isLoading: false,
          locationLat: null,
          locationLng: null,
        },
        planLocationLat: null,
        planLocationLng: null,
      }),
    ).toBe("required");
  });

  it("keeps a visible checking state while the saved profile location loads", () => {
    expect(
      getLocalFormationLocationState({
        groupFormationScope: "LOCAL",
        locationContext: {
          isLoading: true,
          locationLat: null,
          locationLng: null,
        },
        planLocationLat: null,
        planLocationLng: null,
      }),
    ).toBe("loading");
  });

  it.each([
    {
      label: "plan coordinates",
      locationContext: {
        isLoading: false,
        locationLat: null,
        locationLng: null,
      },
      planLocationLat: 53.959,
      planLocationLng: -1.081,
    },
    {
      label: "saved profile coordinates",
      locationContext: {
        isLoading: false,
        locationLat: 53.959,
        locationLng: -1.081,
      },
      planLocationLat: null,
      planLocationLng: null,
    },
  ])("allows local formation with $label", (input) => {
    expect(
      getLocalFormationLocationState({
        groupFormationScope: "LOCAL",
        ...input,
      }),
    ).toBe("ready");
  });

  it("does not require coordinates for online formation", () => {
    expect(
      getLocalFormationLocationState({
        groupFormationScope: "ONLINE",
        locationContext: {
          isLoading: false,
          locationLat: null,
          locationLng: null,
        },
        planLocationLat: null,
        planLocationLng: null,
      }),
    ).toBe("ready");
  });
});
