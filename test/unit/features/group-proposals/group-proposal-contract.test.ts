import { describe, expect, it } from "vitest";

import { ScenarioController } from "@/dev/scenarios/runtime/scenario-controller";
import { handleScenarioRequest } from "@/dev/scenarios/runtime/scenario-handler";
import {
  currentGroupProposalResponseSchema,
  groupProposalSchema,
} from "@/features/group-proposals/schemas/group-proposal.schema";

const descriptor = {
  id: "group-proposal-current",
  overlays: [],
  persona: null,
} as const;

describe("group proposal producer adapter", () => {
  it("validates both producer size shadows and projects only canonical fields", async () => {
    const controller = new ScenarioController(descriptor);
    const response = await handleScenarioRequest(
      controller,
      new Request(
        "http://127.0.0.1:3000/api/v1/group-proposals/scenario-group-proposal-current",
      ),
    );
    const producerProposal = await response.json();
    const proposal = groupProposalSchema.parse(producerProposal);

    expect(producerProposal).toMatchObject({
      minimumGroupSize: 3,
      requestedMinimumGroupSize: 3,
      selectedGroupSize: 3,
      targetGroupSize: 3,
    });
    expect(proposal).not.toHaveProperty("minimumGroupSize");
    expect(proposal).not.toHaveProperty("targetGroupSize");
    expect(proposal.seats).toHaveLength(3);
  });

  it("serves an OpenAPI-faithful non-null current proposal fixture", async () => {
    const controller = new ScenarioController(descriptor);
    const response = await handleScenarioRequest(
      controller,
      new Request("http://127.0.0.1:3000/api/v1/group-proposals/current"),
    );

    const current = currentGroupProposalResponseSchema.parse(
      await response.json(),
    );

    expect(current.proposal?.id).toBe("scenario-group-proposal-current");
  });

  it("fails closed when either producer shadow disagrees", async () => {
    const controller = new ScenarioController(descriptor);
    const response = await handleScenarioRequest(
      controller,
      new Request(
        "http://127.0.0.1:3000/api/v1/group-proposals/scenario-group-proposal-current",
      ),
    );
    const producerProposal = await response.json();

    expect(
      groupProposalSchema.safeParse({
        ...producerProposal,
        targetGroupSize: 4,
      }).success,
    ).toBe(false);
    expect(
      groupProposalSchema.safeParse({
        ...producerProposal,
        minimumGroupSize: 4,
      }).success,
    ).toBe(false);
  });
});
