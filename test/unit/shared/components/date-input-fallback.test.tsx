// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/components/ui/accessible-date-input", () => ({
  AccessibleDateInput: () => {
    throw new Error("Forced date picker failure");
  },
}));

vi.mock("@/shared/lib/development-warning", () => ({
  warnInDevelopment: vi.fn<(message: string, details?: unknown) => void>(),
}));

import { DateInput } from "@/shared/components/ui/date-input";

describe("DateInput failure fallback", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("normalizes controlled values and fail-closes invalid changes", () => {
    const onValueChange = vi.fn<(value: string) => void>();
    const view = render(
      <DateInput
        aria-label="Plan date"
        min="2026-08-01"
        max="2026-08-31"
        name="planDate"
        value="not-a-date"
        onValueChange={onValueChange}
      />,
    );

    const input = screen.getByLabelText("Plan date");
    expect(input).toHaveValue("");
    expect(input).toHaveAttribute("min", "2026-08-01");
    expect(input).toHaveAttribute("max", "2026-08-31");

    fireEvent.change(input, { target: { value: "2026-07-31" } });
    fireEvent.change(input, { target: { value: "2026-09-01" } });
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "2026-08-20" } });
    expect(onValueChange).toHaveBeenLastCalledWith("2026-08-20");

    view.rerender(
      <DateInput
        aria-label="Plan date"
        min="2026-08-01"
        max="2026-08-31"
        name="planDate"
        value="2026-08-20"
        onValueChange={onValueChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("Plan date"), {
      target: { value: "" },
    });
    expect(onValueChange).toHaveBeenLastCalledWith("");

    const formValue = view.container.querySelector<HTMLInputElement>(
      'input[name="planDate"]',
    );
    expect(formValue).toHaveValue("2026-08-20");
  });
});
