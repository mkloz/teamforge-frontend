// @vitest-environment jsdom

import { renderWithQueryClient } from "@test/support/render";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PlanCalendarActions } from "@/features/group-plan-detail/components/content/plan-calendar-actions";
import {
  downloadPlanCalendar,
  getPlanCalendarConflictSummary,
} from "@/shared/api/plan-membership-api";

vi.mock("@/config/config", () => ({
  config: { calendarExportEnabled: false },
}));

vi.mock("@/shared/api/plan-membership-api", () => ({
  downloadPlanCalendar: vi.fn<typeof downloadPlanCalendar>(),
  getPlanCalendarConflictSummary:
    vi.fn<typeof getPlanCalendarConflictSummary>(),
}));

describe("PlanCalendarActions provider gate", () => {
  it("fails closed before interaction when calendar export is not configured", () => {
    renderWithQueryClient(<PlanCalendarActions planId="plan-1" />);

    expect(
      screen.getByText("Calendar download isn’t available yet."),
    ).toBeVisible();
    expect(
      screen.getByText(
        "You can still use the date and time shown in this plan.",
      ),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /add to calendar/iu }),
    ).not.toBeInTheDocument();
    expect(getPlanCalendarConflictSummary).not.toHaveBeenCalled();
    expect(downloadPlanCalendar).not.toHaveBeenCalled();
  });
});
