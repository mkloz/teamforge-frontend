// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { CalendarDays } from "lucide-react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "@/shared/components/ui/empty-state";

describe("EmptyState", () => {
  it("renders the standard copy and optional action", () => {
    render(
      <EmptyState
        action={<button type="button">Explore</button>}
        aria-label="Calendar empty state"
        description="Start a plan or join one to get something moving."
        icon={CalendarDays}
        title="Your calendar is open."
      />,
    );

    const emptyState = screen.getByLabelText("Calendar empty state");
    expect(emptyState).toBeInTheDocument();
    expect(emptyState).toHaveClass(
      "min-h-32",
      "border-dashed",
      "justify-center",
    );
    expect(screen.getByText("Your calendar is open.")).toBeVisible();
    expect(
      screen.getByText("Start a plan or join one to get something moving."),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Explore" })).toBeVisible();
    const iconTile = emptyState.querySelector('[aria-hidden="true"]');
    expect(iconTile).toHaveClass("size-14", "border");
    expect(iconTile?.querySelector("svg")).toHaveClass("size-6");
  });

  it("supports the compact density without changing its content contract", () => {
    const { container } = render(
      <EmptyState
        description="Recent activity will appear here."
        icon={CalendarDays}
        size="compact"
        title="No recent activity yet"
      />,
    );

    expect(container.firstElementChild).toHaveClass(
      "items-start",
      "justify-start",
    );
    expect(container.firstElementChild?.firstElementChild).toHaveClass(
      "rounded-md",
      "px-3",
      "py-3",
    );
    expect(screen.getByText("No recent activity yet")).toBeVisible();
    expect(container.querySelector('[aria-hidden="true"]')).toHaveClass(
      "size-10",
    );
  });
});
