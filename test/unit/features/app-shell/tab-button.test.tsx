// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { TabButton } from "@/features/app-shell/components/app-bottom-nav/tab-button";
import { getAppNavigationItem } from "@/features/app-shell/public/app-navigation";

vi.mock("@tanstack/react-router", () => ({
  Link: forwardRef<
    HTMLAnchorElement,
    ComponentPropsWithoutRef<"a"> & { to?: string }
  >(function MockLink({ children, href, to, ...props }, ref) {
    return (
      <a ref={ref} href={href ?? to} {...props}>
        {children}
      </a>
    );
  }),
}));

describe("bottom navigation TabButton", () => {
  it("keeps icon, label, badge, and link geometry invariant across selection", () => {
    const item = { ...getAppNavigationItem("home"), badge: 12 };
    const { container, rerender } = render(
      <TabButton item={item} pathname="/explore" />,
    );
    const link = screen.getByRole("link", {
      name: "Home, 12 unread notifications",
    });
    const inactiveMarkup = container.innerHTML;

    expect(link).not.toHaveAttribute("aria-current");
    expect(inactiveMarkup).toContain("size-10");
    expect(inactiveMarkup).toContain('width="21"');
    expect(inactiveMarkup).toContain("h-3.5");
    expect(inactiveMarkup).not.toContain("max-h-");
    expect(inactiveMarkup).not.toContain("width,height");

    rerender(<TabButton item={item} pathname="/home" />);
    const activeMarkup = container.innerHTML;

    expect(link).toHaveAttribute("aria-current", "page");
    expect(activeMarkup).toContain("size-10");
    expect(activeMarkup).toContain('width="21"');
    expect(activeMarkup).toContain("h-3.5");
    expect(activeMarkup).not.toContain("max-h-");
    expect(activeMarkup).not.toContain("width,height");
  });

  it("limits press motion to the fixed inner icon plate and supports reduction", () => {
    const { container } = render(
      <TabButton item={getAppNavigationItem("activity")} pathname="/home" />,
    );
    const link = screen.getByRole("link", { name: "Activity" });

    expect(link.className).not.toContain("scale-");
    expect(link.className).toContain("motion-reduce:transition-none");
    expect(container.innerHTML).toContain("group-active:scale-[0.96]");
    expect(container.innerHTML).toContain("motion-reduce:transform-none");
  });
});
