import { describe, expect, it } from "vitest";

import { getTagPillViewState } from "@/features/onboarding/components/interests/interests-browse/tag-pill-model";

describe("interest tag pill model", () => {
  it("does not reserve duplicate space when a separate dismiss button is present", () => {
    const viewState = getTagPillViewState({
      aliases: undefined,
      animated: false,
      disabled: false,
      hasRejectAction: true,
      selected: false,
    });

    expect(viewState.slots.right).toBe("w-0");
  });
});
