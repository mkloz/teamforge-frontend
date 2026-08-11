// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/components/ui/accessible-time-input", () => ({
  AccessibleTimeInput: () => {
    throw new Error("Forced time picker failure");
  },
}));

vi.mock("@/shared/lib/development-warning", () => ({
  warnInDevelopment: vi.fn<(message: string, details?: unknown) => void>(),
}));

import { TimeInput } from "@/shared/components/ui/time-input";

describe("TimeInput failure fallback", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("normalizes controlled values and fail-closes invalid changes", () => {
    const onValueChange = vi.fn<(value: string) => void>();
    const view = render(
      <TimeInput
        aria-label="Plan time"
        min="09:00"
        max="17:00"
        name="planTime"
        value="not-a-time"
        onValueChange={onValueChange}
      />,
    );

    const input = screen.getByLabelText("Plan time");
    expect(input).toHaveValue("");
    expect(input).toHaveAttribute("step", "60");

    fireEvent.change(input, { target: { value: "08:59" } });
    fireEvent.change(input, { target: { value: "17:01" } });
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "09:37" } });
    expect(onValueChange).toHaveBeenLastCalledWith("09:37");

    view.rerender(
      <TimeInput
        aria-label="Plan time"
        min="09:00"
        max="17:00"
        name="planTime"
        value="09:37"
        onValueChange={onValueChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("Plan time"), {
      target: { value: "" },
    });
    expect(onValueChange).toHaveBeenLastCalledWith("");
    expect(view.container.querySelector('input[name="planTime"]')).toHaveValue(
      "09:37",
    );
  });
});
