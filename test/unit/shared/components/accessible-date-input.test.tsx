// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AccessibleDateInput } from "@/shared/components/ui/accessible-date-input";

class TestResizeObserver implements ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
}

globalThis.ResizeObserver = TestResizeObserver;

describe("AccessibleDateInput", () => {
  it("uses calendar semantics and commits only through an explicit action", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: string) => void>();
    render(
      <AccessibleDateInput
        aria-label="Date of birth"
        max="2026-08-10"
        value="2000-04-12"
        onValueChange={onValueChange}
      />,
    );

    const trigger = screen.getByRole("button", {
      name: /Open calendar.*Date of birth/i,
    });
    await user.click(trigger);

    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.getByRole("grid")).toBeVisible();
    expect(onValueChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onValueChange).not.toHaveBeenCalled();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("clears through a visible action while preserving the string contract", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: string) => void>();
    render(
      <AccessibleDateInput
        aria-label="Date of birth"
        value="2000-04-12"
        onValueChange={onValueChange}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /Open calendar.*Date of birth/i }),
    );
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onValueChange).toHaveBeenCalledWith("");
  });
});
