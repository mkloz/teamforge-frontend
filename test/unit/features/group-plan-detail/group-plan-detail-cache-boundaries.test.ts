import { afterEach, describe, expect, it, vi } from "vitest";
import { GroupPlanDetailApi } from "@/features/group-plan-detail/api/group-plan-detail.api";
import { GroupPlanDetailCommands } from "@/features/group-plan-detail/api/group-plan-detail-commands";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

describe("group-plan detail cache boundaries", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    appQueryClient.clear();
  });

  it("removes rich detail immediately after an active member leaves", async () => {
    vi.spyOn(GroupPlanDetailApi, "leaveGroup").mockResolvedValue({
      data: { message: "Left group" },
      requestId: "request-1",
    });
    const removeQueries = vi.spyOn(appQueryClient, "removeQueries");

    await GroupPlanDetailCommands.leaveGroup("group-1");

    expect(removeQueries).toHaveBeenCalledWith({
      queryKey: APP_QUERY_KEYS.groupPlanDetail.detailAllScopes("group-1"),
    });
  });

  it("removes invitation-derived detail after the invitation is declined", async () => {
    vi.spyOn(GroupPlanDetailApi, "declineInvite").mockResolvedValue({
      data: { inviteId: "invite-1", status: "DECLINED" },
      requestId: "request-2",
    });
    const removeQueries = vi.spyOn(appQueryClient, "removeQueries");

    await GroupPlanDetailCommands.declineInvite("group-1", "invite-1");

    expect(removeQueries).toHaveBeenCalledWith({
      queryKey: APP_QUERY_KEYS.groupPlanDetail.detailAllScopes("group-1"),
    });
  });
});
