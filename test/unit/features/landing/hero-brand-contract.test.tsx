// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", async () => {
  const { forwardRef } = await import("react");

  return {
    Link: forwardRef<HTMLAnchorElement, { children: ReactNode; to?: string }>(
      ({ children, to }, ref) => (
        <a href={to ?? "#"} ref={ref}>
          {children}
        </a>
      ),
    ),
  };
});

vi.mock("@/features/landing/hooks/use-resolved-landing-auth-actions", () => ({
  useResolvedLandingAuthActions: () => ({
    isResolvingAuthAction: false,
    primaryAction: { label: "Start a plan", navigation: { to: "/plans/new" } },
  }),
}));

import { HeroSection } from "@/features/landing/components/hero";

describe("Findafew landing hero", () => {
  it("keeps both plan-first actions and the calm launch boundary visible", () => {
    const { container } = render(<HeroSection />);

    expect(
      screen.getByRole("heading", {
        name: "Small groups for things you want to do.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start a plan/u })).toHaveAttribute(
      "href",
      "/plans/new",
    );
    expect(
      screen.getByRole("link", { name: /Explore plans/u }),
    ).toHaveAttribute("href", "/explore");
    expect(
      screen.getByText(
        "Launching for adults aged 18–28. Built around shared activities, not dating.",
      ),
    ).toBeVisible();

    const decorativeVisual = container.querySelector(
      ".perspective-orb[aria-hidden='true']",
    );
    expect(decorativeVisual).not.toBeNull();
    expect(decorativeVisual).toHaveTextContent("Group proposal");
    expect(screen.queryByText("Strong fit")).not.toBeInTheDocument();
  });
});
