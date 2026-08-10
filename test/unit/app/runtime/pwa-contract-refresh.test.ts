import { afterEach, describe, expect, it, vi } from "vitest";

import { refreshPwaResumeQueries } from "@/app/runtime/pwa-authenticated-runtime";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

describe("PWA reconnect and resume refresh", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("deliberately refreshes all active group-formation proposal state", async () => {
    const invalidateQueries = vi
      .spyOn(appQueryClient, "invalidateQueries")
      .mockResolvedValue(undefined);

    await refreshPwaResumeQueries();

    for (const queryKey of [
      APP_QUERY_KEYS.groupFormation.currentProposal,
      APP_QUERY_KEYS.groupFormation.proposalDetails,
      APP_QUERY_KEYS.groupFormation.currentAutoRequest,
      APP_QUERY_KEYS.groupFormation.groupProposalAvailability,
    ]) {
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey,
        refetchType: "active",
      });
    }
  });
});
