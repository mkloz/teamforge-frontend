import { describe, expect, it } from "vitest";
import { resolveNotificationDestination } from "@/features/notifications/lib/destination";
import { notificationSchema } from "@/shared/schemas/notification";

function createNotification(
  overrides: Partial<Parameters<typeof notificationSchema.parse>[0]> = {},
) {
  return notificationSchema.parse({
    avatarUrl: null,
    createdAt: "2026-08-09T10:00:00.000Z",
    entityId: null,
    entityType: null,
    id: "notification-1",
    isRead: false,
    link: null,
    message: "A group is ready to review.",
    receiverId: "user-1",
    title: "Sunday walk",
    type: "GROUP_PROPOSAL_READY",
    ...overrides,
  });
}

describe("Findafew notification destinations", () => {
  it("resolves the exact group-proposal route from a relative link", async () => {
    const destination = await resolveNotificationDestination(
      createNotification({ link: "/group-proposals/proposal-1" }),
    );

    expect(destination).toEqual({
      params: { proposalId: "proposal-1" },
      to: "/group-proposals/$proposalId",
    });
  });

  it("falls back to the GROUP_PROPOSAL entity and rejects absolute links", async () => {
    const destination = await resolveNotificationDestination(
      createNotification({
        entityId: "proposal-2",
        entityType: "GROUP_PROPOSAL",
        link: "https://findafew.today/group-proposals/wrong-proposal",
      }),
    );

    expect(destination).toEqual({
      params: { proposalId: "proposal-2" },
      to: "/group-proposals/$proposalId",
    });
  });
});
