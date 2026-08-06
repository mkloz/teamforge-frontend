// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OnboardingCoachmarks } from "@/features/onboarding/components/education/onboarding-coachmarks";
import { authSession } from "@/shared/api/auth-session";

const navigateMock = vi.hoisted(() =>
  vi.fn<(options: { to: string }) => void>(),
);

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigateMock,
}));

vi.mock("@/shared/api/onboarding-product-state-query", () => ({
  useOnboardingProductStateQuery: () => ({
    data: {
      stage: "INTRODUCTORY",
      capabilities: {
        USE_ONBOARDING_PRACTICE: { allowed: true },
        START_FORGE: { allowed: false },
        START_INTRODUCTORY_FORGE: { allowed: true },
      },
      presentation: {
        coachmarkOrder: ["EXPLORE", "FORGE", "ACTIVITY"],
      },
    },
  }),
}));

beforeEach(() => {
  navigateMock.mockReset();
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    bottom: 140,
    height: 80,
    left: 20,
    right: 220,
    top: 60,
    width: 200,
    x: 20,
    y: 60,
    toJSON: () => ({}),
  });
});

afterEach(() => {
  sessionStorage.clear();
  authSession.clear();
  vi.restoreAllMocks();
});

describe("main-navigation onboarding tutorial", () => {
  it("anchors each explanation and advances to the next page", async () => {
    authSession.setTokens({ accessToken: accessToken("user-a", "session-a") });
    const user = userEvent.setup();
    render(
      <>
        <div data-onboarding-tour="explore-discovery" />
        <a href="/explore" data-onboarding-tour="nav-explore">
          Explore
        </a>
        <OnboardingCoachmarks pathname="/explore" />
      </>,
    );

    const dialog = screen.getByRole("dialog", {
      name: "Find plans without committing",
    });
    expect(dialog).toHaveAttribute("aria-modal", "false");
    expect(
      screen.getByText(/You can still use the page normally/),
    ).toBeVisible();
    expect(document.querySelector("[aria-hidden='true'].z-110")).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("dialog", { name: "Open Explore" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Next: Forge" }));
    expect(navigateMock).toHaveBeenCalledWith({ to: "/forge" });
  });

  it("remains skippable without making the dialog modal", async () => {
    authSession.setTokens({ accessToken: accessToken("user-a", "session-a") });
    const user = userEvent.setup();
    render(
      <>
        <div data-onboarding-tour="explore-discovery" />
        <OnboardingCoachmarks pathname="/explore" />
      </>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "false");
    expect(screen.getByRole("button", { name: "Exit tutorial" })).toBeVisible();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

function accessToken(subject: string, sessionId: string) {
  return `${encodeJwt({ alg: "none" })}.${encodeJwt({ sub: subject, sessionId })}.signature`;
}

function encodeJwt(value: unknown) {
  return btoa(JSON.stringify(value))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}
