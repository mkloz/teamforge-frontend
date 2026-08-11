// @vitest-environment jsdom

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DateTimeInput } from "@/shared/components/ui/datetime-input";
import { TimeInput } from "@/shared/components/ui/time-input";

class TestResizeObserver implements ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
}

globalThis.ResizeObserver = TestResizeObserver;

describe("TimeInput", () => {
  it("uses 24-hour time segments and preserves direct off-step edits", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: string) => void>();
    render(
      <TimeInput
        aria-label="Plan time"
        intervalMinutes={5}
        value="09:37"
        onValueChange={onValueChange}
      />,
    );

    expect(screen.queryByText(/AM|PM/u)).not.toBeInTheDocument();
    const minute = screen.getByRole("spinbutton", { name: /minute/i });
    await user.click(minute);
    await user.keyboard("38");

    expect(onValueChange).toHaveBeenCalledWith("09:38");
    expect(onValueChange).not.toHaveBeenCalledWith("09:40");
  });

  it("keeps overlay changes as a draft and snaps only on Done", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: string) => void>();
    render(
      <TimeInput
        aria-label="Plan time"
        intervalMinutes={5}
        value="09:37"
        onValueChange={onValueChange}
      />,
    );

    const trigger = screen.getByRole("button", {
      name: /Open time picker.*Plan time/i,
    });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Choose time" });
    expect(
      within(dialog).getByText(
        "Will save as 09:35 to match 5-minute intervals.",
      ),
    ).toBeVisible();
    expect(onValueChange).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole("button", { name: "Done" }));
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith("09:35");
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("cancels drafts, commits Clear, and restores the exact opener", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: string) => void>();
    render(
      <TimeInput
        aria-label="Proposal time"
        value="13:22"
        onValueChange={onValueChange}
      />,
    );

    const minute = screen.getByRole("spinbutton", { name: /minute/i });
    await user.click(minute);
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
    expect(screen.getByRole("dialog", { name: "Choose time" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onValueChange).not.toHaveBeenCalled();
    await waitFor(() => expect(minute).toHaveFocus());

    await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onValueChange).toHaveBeenCalledWith("");
    await waitFor(() => expect(minute).toHaveFocus());
  });

  it("preserves form, naming, read-only, required, invalid, and range semantics", () => {
    const { container } = render(
      <>
        <span id="time-label">Departure time</span>
        <p id="time-help">Choose a time between nine and five.</p>
        <TimeInput
          readOnly
          required
          aria-describedby="time-help"
          aria-invalid="true"
          aria-labelledby="time-label"
          form="plan-form"
          min="09:00"
          max="17:00"
          name="departureTime"
          value="09:37"
          onValueChange={vi.fn<(value: string) => void>()}
        />
      </>,
    );

    const group = screen.getByRole("group", { name: "Departure time" });
    expect(group.getAttribute("aria-describedby")?.split(" ")).toContain(
      "time-help",
    );
    expect(group).toHaveAttribute("data-invalid", "true");
    expect(screen.getByRole("spinbutton", { name: /hour/i })).toHaveAttribute(
      "aria-readonly",
      "true",
    );
    expect(screen.getByRole("spinbutton", { name: /hour/i })).toHaveAttribute(
      "aria-required",
      "true",
    );
    expect(
      screen.getByRole("button", {
        name: /Open time picker.*Departure time/i,
      }),
    ).toBeDisabled();
    expect(
      container.querySelector<HTMLInputElement>(
        'input[type="time"][name="departureTime"]',
      ),
    ).toHaveValue("09:37");
  });

  it("associates native required validation with an external form", () => {
    const view = render(
      <>
        <form id="plan-form" data-testid="plan-form" />
        <TimeInput
          required
          aria-label="Plan time"
          form="plan-form"
          name="planTime"
          value=""
          onValueChange={vi.fn<(value: string) => void>()}
        />
      </>,
    );

    const form = screen.getByTestId<HTMLFormElement>("plan-form");
    expect(form.checkValidity()).toBe(false);
    expect(form.reportValidity()).toBe(false);
    expect(
      screen.getByRole("spinbutton", { name: /hour.*Plan time/i }),
    ).toHaveFocus();

    view.rerender(
      <>
        <form id="plan-form" data-testid="plan-form" />
        <TimeInput
          required
          aria-label="Plan time"
          form="plan-form"
          name="planTime"
          value="09:30"
          onValueChange={vi.fn<(value: string) => void>()}
        />
      </>,
    );
    expect(form.checkValidity()).toBe(true);

    view.rerender(
      <>
        <form id="plan-form" data-testid="plan-form" />
        <TimeInput
          readOnly
          required
          aria-label="Plan time"
          form="plan-form"
          name="planTime"
          value=""
          onValueChange={vi.fn<(value: string) => void>()}
        />
      </>,
    );
    expect(form.checkValidity()).toBe(true);
  });

  it("keeps range adjustment truthful and disables Done without a grid step", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: string) => void>();
    render(
      <TimeInput
        aria-describedby="range-help"
        aria-label="Narrow time"
        intervalMinutes={5}
        min="09:01"
        max="09:03"
        value="09:02"
        onValueChange={onValueChange}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: /Open time picker.*Narrow time/i,
      }),
    );
    const dialog = screen.getByRole("dialog", { name: "Choose time" });
    expect(
      within(dialog).getByText(
        "No 5-minute interval is available within this time range.",
      ),
    ).toBeVisible();
    expect(within(dialog).getByRole("button", { name: "Done" })).toBeDisabled();
    expect(
      within(dialog)
        .getByRole("group", { name: "Time selection" })
        .getAttribute("aria-describedby")
        ?.split(" "),
    ).toContain("range-help");
  });

  it("explains an unavailable interval grid when a blank picker opens", async () => {
    const user = userEvent.setup();
    render(
      <TimeInput
        aria-label="Narrow time"
        intervalMinutes={5}
        min="09:01"
        max="09:03"
        value=""
        onValueChange={vi.fn<(value: string) => void>()}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: /Open time picker.*Narrow time/i,
      }),
    );
    const dialog = screen.getByRole("dialog", { name: "Choose time" });
    expect(
      within(dialog).getByText(
        "No 5-minute interval is available within this time range.",
      ),
    ).toBeVisible();
    expect(within(dialog).getByRole("button", { name: "Done" })).toBeDisabled();
  });

  it("keeps time unavailable until DateTimeInput has a date", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: string) => void>();
    const view = render(
      <DateTimeInput
        dateAriaLabel="Proposal date"
        timeAriaLabel="Proposal time"
        value=""
        onValueChange={onValueChange}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: /Open time picker.*Proposal time/i,
      }),
    ).toBeDisabled();

    view.rerender(
      <DateTimeInput
        dateAriaLabel="Proposal date"
        timeAriaLabel="Proposal time"
        value="2026-08-20T12:00"
        onValueChange={onValueChange}
      />,
    );
    expect(
      screen.getByRole("button", {
        name: /Open time picker.*Proposal time/i,
      }),
    ).toBeEnabled();

    await user.click(
      screen.getByRole("button", {
        name: /Open time picker.*Proposal time/i,
      }),
    );
    expect(
      screen.queryByRole("button", { name: "Clear" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    const minute = screen.getByRole("spinbutton", {
      name: /minute.*Proposal time/i,
    });
    await user.click(minute);
    await user.keyboard("37");
    expect(onValueChange).toHaveBeenCalledWith("2026-08-20T12:37");

    await user.click(
      screen.getByRole("button", { name: /Open calendar.*Proposal date/i }),
    );
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onValueChange).toHaveBeenLastCalledWith("");
  });

  it("never submits or emits invalid external and out-of-range times", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: string) => void>();
    const view = render(
      <TimeInput
        aria-label="Office time"
        min="09:00"
        max="17:00"
        name="officeTime"
        value="25:00"
        onValueChange={onValueChange}
      />,
    );
    const { container } = view;

    expect(
      container.querySelector<HTMLInputElement>(
        'input[type="hidden"][name="officeTime"]',
      ),
    ).toHaveValue("");

    const hour = screen.getByRole("spinbutton", { name: /hour.*Office time/i });
    await user.click(hour);
    await user.keyboard("08");
    const minute = screen.getByRole("spinbutton", {
      name: /minute.*Office time/i,
    });
    await user.click(minute);
    await user.keyboard("59");
    expect(onValueChange).not.toHaveBeenCalledWith("08:59");

    view.rerender(
      <TimeInput
        aria-label="Office time"
        min="09:00"
        max="17:00"
        name="officeTime"
        value="08:00"
        onValueChange={onValueChange}
      />,
    );
    expect(
      container.querySelector<HTMLInputElement>(
        'input[type="hidden"][name="officeTime"]',
      ),
    ).toHaveValue("");
  });
});
