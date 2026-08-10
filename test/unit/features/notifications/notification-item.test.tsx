// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NotificationItem } from "@/features/notifications/components/notifications-drawer/notification-item";
import { notificationSchema } from "@/shared/schemas/notification";

function createNotification(isRead = false) {
  return notificationSchema.parse({
    avatarUrl: null,
    createdAt: "2026-08-09T10:00:00.000Z",
    entityId: null,
    entityType: null,
    id: "notification-1",
    isRead,
    link: null,
    message: "A group is ready to review.",
    receiverId: "user-1",
    title: "Sunday walk",
    type: "GROUP_PROPOSAL_READY",
  });
}

describe("notification item", () => {
  it("does not toggle after a horizontal touch gesture or suppress the next details click", () => {
    const onSelect =
      vi.fn<(item: ReturnType<typeof createNotification>) => void>();
    const onToggleRead =
      vi.fn<(item: ReturnType<typeof createNotification>) => void>();
    const { container } = render(
      <NotificationItem
        item={createNotification()}
        onSelect={onSelect}
        onToggleRead={onToggleRead}
      />,
    );

    const row = container.firstElementChild;
    expect(row).not.toBeNull();
    if (!row) {
      throw new Error("Expected a notification row.");
    }
    fireEvent.pointerDown(row, {
      clientX: 10,
      clientY: 20,
      pointerId: 1,
      pointerType: "touch",
    });
    fireEvent.pointerUp(row, {
      clientX: 100,
      clientY: 20,
      pointerId: 1,
      pointerType: "touch",
    });

    expect(onToggleRead).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", {
        name: "View notification details: Sunday walk. Status: unread.",
      }),
    );
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("keeps details and read state as separate single-action controls", () => {
    const onSelect =
      vi.fn<(item: ReturnType<typeof createNotification>) => void>();
    const onToggleRead =
      vi.fn<(item: ReturnType<typeof createNotification>) => void>();
    render(
      <NotificationItem
        item={createNotification()}
        onSelect={onSelect}
        onToggleRead={onToggleRead}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Mark as read. Sunday walk" }),
    );
    expect(onToggleRead).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("exposes the direct read action for coarse pointers and explains disabled state", () => {
    render(
      <NotificationItem
        item={createNotification(true)}
        onSelect={vi.fn<
          (item: ReturnType<typeof createNotification>) => void
        >()}
        onToggleRead={vi.fn<
          (item: ReturnType<typeof createNotification>) => void
        >()}
        isReadActionDisabled
      />,
    );

    const action = screen.getByRole("button", {
      name: "Mark as unread. Sunday walk",
    });
    expect(action).toBeDisabled();
    expect(action).toHaveAttribute("title", "Reconnect to mark as unread.");
    expect(action.className).toContain("[@media(pointer:coarse)]:inline-flex");
    expect(action.className).toContain("[@media(pointer:coarse)]:opacity-100");
  });
});
