// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DateInput } from "@/shared/components/ui/date-input";
import { DateTimeInput } from "@/shared/components/ui/datetime-input";

class TestResizeObserver implements ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
}

globalThis.ResizeObserver = TestResizeObserver;

describe("DateInput", () => {
  it("uses calendar semantics and commits only through an explicit action", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: string) => void>();
    render(
      <DateInput
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
      <DateInput
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

  it("keeps calendar selection as a draft until Done", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: string) => void>();
    render(
      <DateInput
        aria-label="Plan date"
        value="2026-08-20"
        onValueChange={onValueChange}
      />,
    );

    const trigger = screen.getByRole("button", {
      name: /Open calendar.*Plan date/i,
    });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Today" }));
    expect(onValueChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith(getLocalTodayValue());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("moves the visible calendar and selection when Today becomes the draft", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: string) => void>();
    render(
      <DateInput
        aria-label="Date of birth"
        value="2000-04-12"
        onValueChange={onValueChange}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /Open calendar.*Date of birth/i }),
    );
    await user.click(screen.getByRole("button", { name: "Today" }));

    expect(
      screen.getByRole("heading", { name: getLocalTodayMonthHeading() }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: /Today, .* selected/i }),
    ).toHaveAttribute("data-selected", "true");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("cancels a calendar draft on Escape and restores the trigger", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: string) => void>();
    render(
      <DateInput
        aria-label="Plan date"
        value="2026-08-20"
        onValueChange={onValueChange}
      />,
    );

    const trigger = screen.getByRole("button", {
      name: /Open calendar.*Plan date/i,
    });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Today" }));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onValueChange).not.toHaveBeenCalled();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("restores the exact date segment that opened the calendar", async () => {
    const user = userEvent.setup();
    render(
      <DateInput
        aria-label="Plan date"
        value="2026-08-20"
        onValueChange={vi.fn<(value: string) => void>()}
      />,
    );

    const daySegment = screen.getByRole("spinbutton", { name: /day/i });
    await user.click(daySegment);
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
    expect(screen.getByRole("dialog")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(daySegment).toHaveFocus());
  });

  it("commits a selected calendar day only after Done", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: string) => void>();
    render(
      <DateInput
        aria-label="Plan date"
        value="2026-08-20"
        onValueChange={onValueChange}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /Open calendar.*Plan date/i }),
    );
    await user.click(screen.getByRole("button", { name: /22.*August.*2026/i }));
    expect(onValueChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith("2026-08-22");
  });

  it("commits complete closed segment edits without emitting out-of-range values", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: string) => void>();
    const view = render(
      <DateInput
        aria-label="Plan date"
        min="2026-08-01"
        value=""
        onValueChange={onValueChange}
      />,
    );

    await enterSegmentedDate(user, {
      day: "15",
      month: "08",
      year: "2026",
    });
    expect(onValueChange).toHaveBeenLastCalledWith("2026-08-15");

    onValueChange.mockClear();
    view.rerender(
      <DateInput
        aria-label="Plan date"
        min="2026-08-01"
        value=""
        onValueChange={onValueChange}
      />,
    );
    await enterSegmentedDate(user, {
      day: "15",
      month: "07",
      year: "2026",
    });
    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalledWith("2026-07-15");
    for (const [emittedValue] of onValueChange.mock.calls) {
      expect(emittedValue >= "2026-08-01").toBe(true);
    }
  });

  it("keeps external values authoritative and disables Today outside the range", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: string) => void>();
    const view = render(
      <DateInput
        aria-label="Plan date"
        min="2999-01-01"
        value="2026-08-20"
        onValueChange={onValueChange}
      />,
    );

    view.rerender(
      <DateInput
        aria-label="Plan date"
        min="2999-01-01"
        value="2027-09-21"
        onValueChange={onValueChange}
      />,
    );
    expect(screen.getByRole("spinbutton", { name: /year/i })).toHaveTextContent(
      "2027",
    );

    await user.click(
      screen.getByRole("button", { name: /Open calendar.*Plan date/i }),
    );
    expect(screen.getByRole("button", { name: "Today" })).toBeDisabled();
  });

  it("preserves naming and form contracts while preventing read-only commits", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: string) => void>();
    const { container } = render(
      <>
        <span id="departure-label">Departure date</span>
        <p id="departure-help">Choose the confirmed departure day.</p>
        <DateInput
          readOnly
          required
          aria-describedby="departure-help"
          aria-labelledby="departure-label"
          clearable={false}
          form="plan-form"
          name="departureDate"
          value="2026-08-20"
          onValueChange={onValueChange}
        />
      </>,
    );

    const trigger = screen.getByRole("button", {
      name: /Open calendar.*Departure date/i,
    });
    expect(trigger).toBeDisabled();
    expect(screen.getByRole("spinbutton", { name: /day/i })).toHaveAttribute(
      "aria-readonly",
      "true",
    );
    expect(screen.getByRole("spinbutton", { name: /day/i })).toHaveAttribute(
      "aria-required",
      "true",
    );
    await user.click(trigger);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onValueChange).not.toHaveBeenCalled();

    const formValue = container.querySelector<HTMLInputElement>(
      'input[type="hidden"][name="departureDate"]',
    );
    expect(formValue).toHaveAttribute("form", "plan-form");
    expect(formValue).toHaveValue("2026-08-20");
  });

  it("forwards disabled, invalid, and description semantics", () => {
    const onValueChange = vi.fn<(value: string) => void>();
    render(
      <>
        <p id="date-error">Choose an available date.</p>
        <DateInput
          disabled
          aria-describedby="date-error"
          aria-invalid="true"
          aria-label="Unavailable date"
          value="2026-08-20"
          onValueChange={onValueChange}
        />
      </>,
    );

    const group = screen.getByRole("group", { name: "Unavailable date" });
    expect(group.getAttribute("aria-describedby")?.split(" ")).toContain(
      "date-error",
    );
    expect(group).toHaveAttribute("data-invalid", "true");
    expect(group).toHaveAttribute("data-disabled", "true");
    expect(
      screen.getByRole("button", {
        name: /Open calendar.*Unavailable date/i,
      }),
    ).toBeDisabled();
  });

  it("never submits an invalid external date through its hidden form value", () => {
    const onValueChange = vi.fn<(value: string) => void>();
    const { container } = render(
      <DateInput
        aria-label="Plan date"
        name="planDate"
        value="2026-02-31"
        onValueChange={onValueChange}
      />,
    );

    expect(
      container.querySelector<HTMLInputElement>(
        'input[type="hidden"][name="planDate"]',
      ),
    ).toHaveValue("");
  });

  it("preserves the time when the date half of a local datetime changes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: string) => void>();
    render(
      <DateTimeInput
        dateAriaLabel="Proposal date"
        timeAriaLabel="Proposal time"
        value="2026-08-20T09:35"
        onValueChange={onValueChange}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /Open calendar.*Proposal date/i }),
    );
    await user.click(screen.getByRole("button", { name: /22.*August.*2026/i }));
    await user.click(screen.getByRole("button", { name: "Done" }));

    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith("2026-08-22T09:35");
  });
});

async function enterSegmentedDate(
  user: ReturnType<typeof userEvent.setup>,
  date: { day: string; month: string; year: string },
) {
  await user.click(screen.getByRole("spinbutton", { name: /day/i }));
  await user.keyboard(date.day);
  await user.click(screen.getByRole("spinbutton", { name: /month/i }));
  await user.keyboard(date.month);
  await user.click(screen.getByRole("spinbutton", { name: /year/i }));
  await user.keyboard(date.year);
}

function getLocalTodayValue() {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getLocalTodayMonthHeading() {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date());
}
