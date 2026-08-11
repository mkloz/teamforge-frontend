// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  getNotificationReadSuccessMessage,
  NotificationReadFeedbackNotice,
} from "@/features/notifications/components/notifications-drawer/notification-read-feedback";

describe("notification read feedback", () => {
  it("announces a settled read-state change through one atomic polite status", () => {
    const { rerender } = render(
      <NotificationReadFeedbackNotice
        feedback={null}
        isRetrying={false}
        onRetry={vi.fn<() => void>()}
      />,
    );

    const status = document.querySelector('[aria-live="polite"]');
    expect(status).toHaveAttribute("aria-atomic", "true");
    expect(status).toHaveTextContent("");

    rerender(
      <NotificationReadFeedbackNotice
        feedback={{
          kind: "success",
          message: getNotificationReadSuccessMessage(
            "Sunday walk",
            "mark-read",
          ),
        }}
        isRetrying={false}
        onRetry={vi.fn<() => void>()}
      />,
    );

    expect(status).toHaveTextContent("Sunday walk marked read.");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows a rollback alert with a focusable Retry action", () => {
    const onRetry = vi.fn<() => void>();
    render(
      <NotificationReadFeedbackNotice
        feedback={{
          action: "mark-unread",
          kind: "error",
          notificationId: "notification-1",
          title: "Sunday walk",
        }}
        isRetrying={false}
        onRetry={onRetry}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "We couldn't mark Sunday walk as unread. Its previous state was restored.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
