import { apiRoute } from "@test/support/msw/api";
import { server } from "@test/support/msw/server";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { ScenarioController } from "@/dev/scenarios/runtime/scenario-controller";
import { projectScenarioGroupProposal } from "@/dev/scenarios/world/scenario-group-proposal";
import { GroupProposalsApi } from "@/features/group-proposals/api/group-proposals.api";
import { GroupProposalAvailabilityApi } from "@/features/plan-creation/api/group-proposal-availability.api";
import { PlanCreationApi } from "@/features/plan-creation/api/plan-creation.api";
import {
  AUTOMATIC_GROUP_FORMATION_RECOVERY_DISCLOSURE_VERSION,
  AUTOMATIC_GROUP_FORMATION_REQUEST_POLICY_VERSION,
} from "@/features/plan-creation/schemas/automatic-group-formation-request.schema";
import {
  closeFormationOpening,
  deleteCurrentFormationOpeningApplication,
  FORMATION_OPENING_POLICY_VERSION,
  getFormationOpening,
  postFormationOpeningApplication,
  selectFormationOpeningApplication,
} from "@/shared/api/formation-opening-api";

const descriptor = { id: "default", overlays: [], persona: null } as const;
const proposal = projectScenarioGroupProposal(
  new ScenarioController(descriptor).world,
);
const uuid = "00000000-0000-4000-8000-000000000001";
const now = "2099-08-10T18:30:00.000Z";

const decisionCommand = {
  expectedProposalVersion: 1,
  expectedSeatDecisionRevision: 0,
  policyVersion: "group-proposal-decision-v1" as const,
};

const decisionReceipt = {
  formedResources: null,
  proposalId: "proposal-1",
  proposalState: "OPEN" as const,
  proposalVersion: 2,
  viewerDecision: "ACCEPTED" as const,
  viewerDecisionRevision: 1,
  viewerDisposition: "ACTIVE" as const,
};

const opening = {
  expiresAt: now,
  id: "opening-1",
  neededCount: 1 as const,
  policyVersion: FORMATION_OPENING_POLICY_VERSION,
  readyCount: 2,
  state: "OPEN" as const,
  version: 1,
};

const application = {
  appliedAt: now,
  id: "application-1",
  openingId: opening.id,
  resolvedAt: null,
  state: "PENDING" as const,
  version: 1,
};

const organizerOpening = {
  ...opening,
  sourceProposalId: "proposal-1",
  successorProposalId: null,
};

const automaticInput = {
  maximumGroupSize: 5,
  maxDistanceKm: null,
  minimumGroupSize: 3,
  plan: {
    category: "GAMING" as const,
    cost: "FREE" as const,
    costAmount: null,
    costDetails: null,
    coverImage: null,
    dateTime: null,
    description: "Choose a game together.",
    location: null,
    locationLat: null,
    locationLng: null,
    locationMode: "TBD" as const,
    scheduleMode: "TO_BE_DECIDED" as const,
    title: "Board games",
  },
  policyVersion: AUTOMATIC_GROUP_FORMATION_REQUEST_POLICY_VERSION,
  recoveryDisclosureVersion:
    AUTOMATIC_GROUP_FORMATION_RECOVERY_DISCLOSURE_VERSION,
  scope: "ONLINE" as const,
};

const automaticRequest = {
  activity: {
    description: "Choose a game together.",
    id: "activity-1",
    interests: [{ id: "games", name: "Games", slug: "games" }],
    title: "Board games",
  },
  attemptCount: 0,
  canRetryNow: false,
  cancelledAt: null,
  consecutiveFailureCount: 0,
  createdAt: now,
  expiredAt: null,
  freshUntil: now,
  id: "request-1",
  lastAttemptAt: null,
  lastAttemptOutcome: null,
  lifecycle: "SEARCHING" as const,
  manualRetryAvailableAt: null,
  maximumGroupSize: automaticInput.maximumGroupSize,
  maxDistanceKm: automaticInput.maxDistanceKm,
  minimumGroupSize: automaticInput.minimumGroupSize,
  nextAttemptAt: null,
  operationalState: null,
  pauseReason: null,
  pausedAt: null,
  plan: automaticInput.plan,
  policyVersion: automaticInput.policyVersion,
  recoveryDisclosureVersion: automaticInput.recoveryDisclosureVersion,
  requesterId: "user-1",
  resultGroupId: null,
  resultPlanId: null,
  revision: 1,
  scope: automaticInput.scope,
  searchStartedAt: now,
  updatedAt: now,
};

const availability = {
  availableUntil: now,
  canReceiveLocalProposals: true,
  canReceiveOnlineProposals: true,
  lifecycle: "OPEN" as const,
  liveAutomaticGroupCount: 0,
  localEnabled: true,
  onlineEnabled: true,
  policyVersion: "group-proposal-availability-v1",
  proposalCooldownUntil: null,
  reconfirmedAt: now,
  reservedSeatCount: 0,
  revision: 1,
};

async function body(request: Request): Promise<unknown> {
  return request.json();
}

describe("group formation browser contract", () => {
  it("uses the activity group-formation route and report-target route exactly", async () => {
    const groupFormationInput = {
      groupAvatar: null,
      groupDescription: "A small group for board games.",
      groupName: "Board games",
      groupSize: 4,
      matchingPreferences: { maxDistanceKm: 20 },
      plan: {
        category: "GAMING" as const,
        cost: "FREE" as const,
        costAmount: null,
        costDetails: null,
        coverImage: null,
        dateTime: now,
        description: "Choose a game together.",
        location: null,
        locationMode: "TBD" as const,
        scheduleMode: "TO_BE_DECIDED" as const,
        title: "Board games",
      },
    };
    const groupFormationResult = {
      activityId: "activity-1",
      activityStatus: "MATCHED" as const,
      chat: { id: "chat-1", type: "GROUP" as const },
      group: {
        id: "group-1",
        maxMembers: 4,
        members: [{ role: "ADMIN" as const, userId: "user-1" }],
        name: "Board games",
        status: "ACTIVE" as const,
      },
      plan: {
        category: "GAMING" as const,
        cost: "FREE" as const,
        coverImage: null,
        id: "plan-1",
        locationMode: "TBD" as const,
        scheduleMode: "TO_BE_DECIDED" as const,
        status: "PROPOSED" as const,
        title: "Board games",
      },
    };
    const reportTargets = {
      proposalId: "proposal-1",
      proposalVersion: 2,
      reportableUntil: now,
      targets: [{ avatar: null, displayName: "Alex", seatId: "seat-1" }],
    };
    const calls: Array<{
      body: Record<string, unknown> | null;
      key: string | null;
      method: string;
      pathname: string;
    }> = [];

    server.use(
      http.post(
        apiRoute("activities/:activityId/group-formation"),
        async ({ request }) => {
          calls.push({
            body: await body(request),
            key: request.headers.get("idempotency-key"),
            method: request.method,
            pathname: new URL(request.url).pathname,
          });
          return HttpResponse.json(groupFormationResult);
        },
      ),
      http.get(
        apiRoute("group-proposals/:proposalId/report-targets"),
        ({ request }) => {
          calls.push({
            body: null,
            key: request.headers.get("idempotency-key"),
            method: request.method,
            pathname: new URL(request.url).pathname,
          });
          return HttpResponse.json(reportTargets);
        },
      ),
    );

    await expect(
      PlanCreationApi.groupFormationActivity(
        "activity-1",
        groupFormationInput,
        uuid,
      ),
    ).resolves.toEqual({ data: groupFormationResult, requestId: null });
    await expect(
      GroupProposalsApi.getReportTargets("proposal-1"),
    ).resolves.toEqual(reportTargets);

    expect(calls).toEqual([
      {
        body: groupFormationInput,
        key: uuid,
        method: "POST",
        pathname: "/api/v1/activities/activity-1/group-formation",
      },
      {
        body: null,
        key: null,
        method: "GET",
        pathname: "/api/v1/group-proposals/proposal-1/report-targets",
      },
    ]);
  });

  it("uses the exact group proposal routes, bodies, and idempotency keys", async () => {
    expect(proposal).not.toBeNull();
    const mutations: Array<{
      body: Record<string, unknown>;
      key: string | null;
      pathname: string;
    }> = [];

    server.use(
      http.get(apiRoute("group-proposals/current"), () =>
        HttpResponse.json({ proposal }),
      ),
      http.get(apiRoute("group-proposals/:proposalId"), () =>
        HttpResponse.json(proposal),
      ),
      http.post(
        apiRoute("group-proposals/:proposalId/:action"),
        async ({ params, request }) => {
          mutations.push({
            body: await body(request),
            key: request.headers.get("idempotency-key"),
            pathname: new URL(request.url).pathname,
          });
          if (params.action === "open-recovery-seat") {
            return HttpResponse.json({
              application: null,
              opening: organizerOpening,
              successorProposalId: null,
            });
          }
          return HttpResponse.json(decisionReceipt);
        },
      ),
    );

    await expect(GroupProposalsApi.getCurrent()).resolves.toMatchObject({
      proposal: { id: "scenario-group-proposal-current" },
    });
    await expect(
      GroupProposalsApi.getById("proposal-1"),
    ).resolves.toMatchObject({ id: "scenario-group-proposal-current" });
    await GroupProposalsApi.accept("proposal-1", decisionCommand, uuid);
    await GroupProposalsApi.decline(
      "proposal-1",
      { ...decisionCommand, reason: "NOT_THIS_GROUP" },
      uuid,
    );
    await GroupProposalsApi.withdraw("proposal-1", decisionCommand, uuid);
    await GroupProposalsApi.openRecoverySeat(
      "proposal-1",
      { expectedVersion: 1, policyVersion: FORMATION_OPENING_POLICY_VERSION },
      uuid,
    );

    expect(mutations).toEqual([
      expect.objectContaining({
        body: decisionCommand,
        key: uuid,
        pathname: "/api/v1/group-proposals/proposal-1/accept",
      }),
      expect.objectContaining({
        body: { ...decisionCommand, reason: "NOT_THIS_GROUP" },
        key: uuid,
        pathname: "/api/v1/group-proposals/proposal-1/decline",
      }),
      expect.objectContaining({
        body: decisionCommand,
        key: uuid,
        pathname: "/api/v1/group-proposals/proposal-1/withdraw",
      }),
      expect.objectContaining({
        body: {
          expectedVersion: 1,
          policyVersion: FORMATION_OPENING_POLICY_VERSION,
        },
        key: uuid,
        pathname: "/api/v1/group-proposals/proposal-1/open-recovery-seat",
      }),
    ]);
  });

  it("keeps opening commands on their frozen routes, including the DELETE body", async () => {
    const calls: Array<{
      body: Record<string, unknown>;
      method: string;
      pathname: string;
    }> = [];
    const record = async (request: Request) => {
      calls.push({
        body: await body(request),
        method: request.method,
        pathname: new URL(request.url).pathname,
      });
    };

    server.use(
      http.get(apiRoute("group-proposal-openings/:openingId"), () =>
        HttpResponse.json({
          ...opening,
          viewerApplication: null,
          viewerRole: "APPLICANT",
        }),
      ),
      http.post(
        apiRoute("group-proposal-openings/:openingId/applications"),
        async ({ request }) => {
          await record(request);
          return HttpResponse.json({ application, opening });
        },
      ),
      http.delete(
        apiRoute("group-proposal-openings/:openingId/applications/current"),
        async ({ request }) => {
          await record(request);
          return HttpResponse.json({
            application: { ...application, state: "WITHDRAWN" },
            opening,
          });
        },
      ),
      http.post(
        apiRoute(
          "group-proposal-openings/:openingId/applications/:applicationId/select",
        ),
        async ({ request }) => {
          await record(request);
          return HttpResponse.json({
            application: null,
            opening: organizerOpening,
            successorProposalId: null,
          });
        },
      ),
      http.post(
        apiRoute("group-proposal-openings/:openingId/close"),
        async ({ request }) => {
          await record(request);
          return HttpResponse.json({
            application: null,
            opening: organizerOpening,
            successorProposalId: null,
          });
        },
      ),
    );

    await getFormationOpening(opening.id);
    await postFormationOpeningApplication(opening.id, uuid);
    await deleteCurrentFormationOpeningApplication(opening.id, 1, uuid);
    await selectFormationOpeningApplication(
      opening.id,
      application.id,
      { expectedApplicationVersion: 1, expectedVersion: 1 },
      uuid,
    );
    await closeFormationOpening(opening.id, 1, uuid);

    expect(calls).toEqual([
      expect.objectContaining({
        body: { policyVersion: FORMATION_OPENING_POLICY_VERSION },
        method: "POST",
        pathname: "/api/v1/group-proposal-openings/opening-1/applications",
      }),
      expect.objectContaining({
        body: {
          expectedApplicationVersion: 1,
          policyVersion: FORMATION_OPENING_POLICY_VERSION,
        },
        method: "DELETE",
        pathname:
          "/api/v1/group-proposal-openings/opening-1/applications/current",
      }),
      expect.objectContaining({
        body: {
          expectedApplicationVersion: 1,
          expectedVersion: 1,
          policyVersion: FORMATION_OPENING_POLICY_VERSION,
        },
        method: "POST",
        pathname:
          "/api/v1/group-proposal-openings/opening-1/applications/application-1/select",
      }),
      expect.objectContaining({
        body: {
          expectedVersion: 1,
          policyVersion: FORMATION_OPENING_POLICY_VERSION,
        },
        method: "POST",
        pathname: "/api/v1/group-proposal-openings/opening-1/close",
      }),
    ]);
  });

  it("uses exact automatic-request and availability command contracts", async () => {
    const calls: Array<{
      body: Record<string, unknown>;
      key: string | null;
      method: string;
      pathname: string;
    }> = [];
    const record = async (request: Request) => {
      calls.push({
        body: await body(request),
        key: request.headers.get("idempotency-key"),
        method: request.method,
        pathname: new URL(request.url).pathname,
      });
    };

    server.use(
      http.get(apiRoute("automatic-group-formation-requests/current"), () =>
        HttpResponse.json({ request: automaticRequest }),
      ),
      http.post(
        apiRoute("activities/:activityId/automatic-group-formation-requests"),
        async ({ request }) => {
          await record(request);
          return HttpResponse.json(automaticRequest);
        },
      ),
      http.patch(
        apiRoute("automatic-group-formation-requests/:requestId"),
        async ({ request }) => {
          await record(request);
          return HttpResponse.json(automaticRequest);
        },
      ),
      http.post(
        apiRoute("automatic-group-formation-requests/:requestId/:action"),
        async ({ request }) => {
          await record(request);
          return HttpResponse.json(automaticRequest);
        },
      ),
      http.delete(
        apiRoute("automatic-group-formation-requests/:requestId"),
        async ({ request }) => {
          await record(request);
          return HttpResponse.json(automaticRequest);
        },
      ),
      http.get(apiRoute("group-formation/availability"), () =>
        HttpResponse.json(availability),
      ),
      http.put(
        apiRoute("group-formation/availability"),
        async ({ request }) => {
          await record(request);
          return HttpResponse.json(availability);
        },
      ),
      http.post(
        apiRoute("group-formation/availability/:action"),
        async ({ request }) => {
          await record(request);
          return HttpResponse.json(availability);
        },
      ),
    );

    await PlanCreationApi.getCurrentAutomaticGroupFormationRequest();
    await PlanCreationApi.createAutomaticGroupFormationRequest(
      "activity-1",
      automaticInput,
      uuid,
    );
    await PlanCreationApi.updateAutomaticGroupFormationRequest(
      "request-1",
      { ...automaticInput, expectedRevision: 1 },
      uuid,
    );
    /* eslint-disable no-await-in-loop -- lifecycle commands are intentionally ordered */
    for (const action of ["pause", "resume", "retry", "cancel"] as const) {
      await PlanCreationApi.runAutomaticGroupFormationRequestCommand(
        "request-1",
        action,
        {
          expectedRevision: 1,
          policyVersion: AUTOMATIC_GROUP_FORMATION_REQUEST_POLICY_VERSION,
        },
        uuid,
      );
    }
    /* eslint-enable no-await-in-loop */
    await GroupProposalAvailabilityApi.get();
    await GroupProposalAvailabilityApi.update(
      {
        expectedRevision: 1,
        localEnabled: true,
        onlineEnabled: true,
        policyVersion: availability.policyVersion,
      },
      uuid,
    );
    await GroupProposalAvailabilityApi.pause(
      { expectedRevision: 1, policyVersion: availability.policyVersion },
      uuid,
    );
    await GroupProposalAvailabilityApi.reconfirm(
      { expectedRevision: 1, policyVersion: availability.policyVersion },
      uuid,
    );

    expect(calls).toHaveLength(9);
    expect(calls.every((call) => call.key === uuid)).toBe(true);
    expect(
      calls.map(({ method, pathname }) => `${method} ${pathname}`),
    ).toEqual([
      "POST /api/v1/activities/activity-1/automatic-group-formation-requests",
      "PATCH /api/v1/automatic-group-formation-requests/request-1",
      "POST /api/v1/automatic-group-formation-requests/request-1/pause",
      "POST /api/v1/automatic-group-formation-requests/request-1/resume",
      "POST /api/v1/automatic-group-formation-requests/request-1/retry",
      "DELETE /api/v1/automatic-group-formation-requests/request-1",
      "PUT /api/v1/group-formation/availability",
      "POST /api/v1/group-formation/availability/pause",
      "POST /api/v1/group-formation/availability/reconfirm",
    ]);
    expect(calls[5]?.body).toEqual({
      expectedRevision: 1,
      policyVersion: AUTOMATIC_GROUP_FORMATION_REQUEST_POLICY_VERSION,
    });
    expect(calls[6]?.body).toEqual({
      expectedRevision: 1,
      localEnabled: true,
      onlineEnabled: true,
      policyVersion: availability.policyVersion,
    });
  });
});
