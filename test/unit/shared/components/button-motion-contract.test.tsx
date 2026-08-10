// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/shared/components/ui/button";
import { buttonVariants } from "@/shared/components/ui/button-variants";

describe("Button motion contract", () => {
  it.each([
    "primary",
    "secondary",
    "outline",
    "destructive",
  ] as const)("keeps %s lift and shadow on one explicitly synchronized owner", (variant) => {
    const classes = buttonVariants({ variant });

    expect(classes).toContain(
      "transition-[background-color,border-color,box-shadow,color,transform]",
    );
    expect(classes).not.toContain("transition-all");
    expect(classes).toContain(
      "hover:[@media(hover:hover)_and_(pointer:fine)]:-translate-y-1",
    );
    expect(classes).toContain("after:-bottom-1");
    expect(classes).toContain("motion-reduce:transform-none");
    expect(classes).toContain("motion-reduce:transition-none");
  });

  it("keeps the action name and focus while loading blocks duplicate activation", () => {
    const onClick = vi.fn<() => void>();
    const { rerender } = render(
      <Button onClick={onClick}>Save profile</Button>,
    );
    const button = screen.getByRole("button", { name: "Save profile" });
    button.focus();

    rerender(
      <Button loading onClick={onClick}>
        Save profile
      </Button>,
    );

    expect(button).toHaveAccessibleName("Save profile");
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();
    expect(button).toHaveFocus();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("prevents unavailable slotted links from navigating by pointer or keyboard", () => {
    const onClick = vi.fn<() => void>();
    render(
      <Button asChild disabled>
        <a href="/blocked" onClick={onClick}>
          Continue
        </a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Continue" });

    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
    expect(fireEvent.click(link)).toBe(false);
    fireEvent.keyDown(link, { key: "Enter" });
    expect(onClick).not.toHaveBeenCalled();
  });
});
