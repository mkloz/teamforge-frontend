// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useInterestBrowserExpansion } from "@/features/onboarding/hooks/use-interest-browser-expansion";
import type { Interest } from "@/shared/schemas";

const scroll = vi.hoisted(() => ({
  elementIntoView:
    vi.fn<
      (element: Element | null, options: Record<string, unknown>) => void
    >(),
}));

vi.mock("@/shared/lib/browser-scroll", () => ({
  scrollElementIntoView: scroll.elementIntoView,
}));

const CATEGORIES: Interest[] = [
  {
    aliases: [],
    children: [],
    color: null,
    description: null,
    icon: null,
    id: "outdoors",
    isActive: true,
    name: "Outdoors",
    parentId: null,
    slug: "outdoors",
    sortOrder: 1,
  },
  {
    aliases: [],
    children: [],
    color: null,
    description: null,
    icon: null,
    id: "culture",
    isActive: true,
    name: "Culture",
    parentId: null,
    slug: "culture",
    sortOrder: 2,
  },
];

describe("useInterestBrowserExpansion", () => {
  afterEach(() => {
    document.body.replaceChildren();
    scroll.elementIntoView.mockReset();
  });

  it("focuses and locates the category disclosure after a semantic jump", async () => {
    const section = document.createElement("section");
    const trigger = document.createElement("button");
    trigger.textContent = "Culture";
    section.append(trigger);
    document.body.append(section);

    const { result } = renderHook(() =>
      useInterestBrowserExpansion(CATEGORIES),
    );

    act(() => {
      result.current.registerCategoryElement("culture", section);
      result.current.jumpToCategory("culture");
    });

    await waitFor(() => expect(trigger).toHaveFocus());
    expect(scroll.elementIntoView).toHaveBeenCalledWith(section, {
      block: "start",
      intent: "locate",
    });
    expect(result.current.collapsedCategories.has("culture")).toBe(false);
  });
});
