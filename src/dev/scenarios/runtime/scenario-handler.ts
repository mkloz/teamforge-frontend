import {
  projectActivityChat,
  projectActivityChats,
  projectActivityGroup,
  projectActivityGroups,
  projectExploreFeed,
  projectExploreGroups,
  projectGroupDetail,
  projectHomeGroups,
  projectIntroductoryExploreFeed,
  projectIntroductoryExploreGroups,
  projectViewerProfile,
} from "@/dev/scenarios/projectors/scenario-projectors";
import type { ScenarioController } from "@/dev/scenarios/runtime/scenario-controller";
import {
  scenarioJson,
  scenarioPage,
} from "@/dev/scenarios/runtime/scenario-response";
import {
  projectScenarioGroupProposal,
  SCENARIO_GROUP_PROPOSAL_ID,
} from "@/dev/scenarios/world/scenario-group-proposal";
import {
  scenarioInterestLeavesById,
  scenarioInterestTree,
} from "@/dev/scenarios/world/scenario-interest-catalog";
import type { ScenarioWorld } from "@/dev/scenarios/world/scenario-world";
import {
  type CurrentUser,
  chatApiSchema,
  fullUserResponseSchema,
  inviteSchema,
  messageApiSchema,
} from "@/shared/schemas";
import {
  onboardingProductStateSchema,
  productCapabilityValues,
} from "@/shared/schemas/onboarding-product-state";
import {
  personalityAssessmentCapabilitiesSchema,
  personalityAssessmentStateSchema,
} from "@/shared/schemas/personality-assessment";
import type { PlanParticipantPlace } from "@/shared/schemas/plan-operational-state";

const API_VERSION_MARKER = "/api/v1/";

function isIntroductoryScenario(scenarioId: string) {
  return (
    scenarioId === "onboarding-introductory" ||
    scenarioId === "onboarding-practice" ||
    scenarioId.startsWith("onboarding-intent-")
  );
}

export async function handleScenarioRequest(
  controller: ScenarioController,
  request: Request,
): Promise<Response> {
  const url = new URL(request.url);
  const pathname = getApiPathname(url.pathname);
  const fault = controller.world.faults.find((candidate) =>
    matchesFault(candidate, request, pathname, url),
  );

  if (fault) {
    consumeFiniteFault(controller, fault);
  }

  if (fault?.hold) {
    controller.recordRequest({
      method: request.method,
      pathname,
      status: 102,
    });
    await controller.waitForFaultRelease({
      method: request.method,
      pathname,
    });
    controller.clearPendingRequest({ method: request.method, pathname });
  }

  if (fault?.delayMs) {
    await delay(fault.delayMs);
  }

  if (fault?.networkError) {
    controller.recordRequest({
      method: request.method,
      pathname,
      status: 0,
    });
    throw new TypeError("Scenario Mode simulated a network failure.");
  }

  if (fault?.status) {
    return record(
      controller,
      request,
      pathname,
      scenarioJson(
        {
          error: `SCENARIO_${fault.status}`,
          message: `Scenario Mode returned ${fault.status} for this request.`,
          requestId: "scenario-fault",
        },
        { status: fault.status },
      ),
    );
  }

  const response = await projectResponse(controller, request, pathname, url);

  return record(controller, request, pathname, response);
}

function matchesFault(
  fault: ScenarioController["world"]["faults"][number],
  request: Request,
  pathname: string,
  url: URL,
) {
  if (fault.remainingMatches !== undefined && fault.remainingMatches <= 0) {
    return false;
  }

  if (fault.method && fault.method !== request.method) {
    return false;
  }

  if (fault.pathname && fault.pathname !== pathname) {
    return false;
  }

  return Object.entries(fault.searchParams ?? {}).every(
    ([key, value]) => url.searchParams.get(key) === value,
  );
}

function consumeFiniteFault(
  controller: ScenarioController,
  fault: ScenarioController["world"]["faults"][number],
) {
  if (fault.remainingMatches === undefined) {
    return;
  }

  fault.remainingMatches -= 1;
  if (fault.remainingMatches > 0) {
    return;
  }

  const index = controller.world.faults.indexOf(fault);
  if (index >= 0) {
    controller.world.faults.splice(index, 1);
  }
}

async function projectResponse(
  controller: ScenarioController,
  request: Request,
  pathname: string,
  url: URL,
): Promise<Response> {
  const { world } = controller;
  const viewer = world.viewerId ? world.entities.users[world.viewerId] : null;

  if (pathname === "users/me" && request.method === "GET") {
    return viewer
      ? scenarioJson(viewer)
      : scenarioJson(
          { error: "UNAUTHENTICATED", message: "Sign in required." },
          { status: 401 },
        );
  }

  if (pathname === "onboarding/product-state" && request.method === "GET") {
    return viewer
      ? scenarioJson(
          projectOnboardingProductState(
            viewer,
            controller.descriptor.id,
            world.onboarding.intentStepComplete,
          ),
        )
      : scenarioJson(
          { error: "UNAUTHENTICATED", message: "Sign in required." },
          { status: 401 },
        );
  }

  if (
    (pathname === "onboarding/events" || pathname === "onboarding/exposures") &&
    request.method === "POST"
  ) {
    return scenarioJson({ accepted: 1 }, { status: 201 });
  }

  if (pathname === "users/me/reputation-evidence" && request.method === "GET") {
    const firstPlan = Object.values(world.entities.plans).at(0);

    return scenarioJson(
      firstPlan
        ? [
            {
              evidenceType: "FOLLOW_THROUGH",
              id: `scenario-reputation-evidence-${firstPlan.id}`,
              occurredAt: firstPlan.dateTime ?? world.clock,
              planId: firstPlan.id,
              planTitle: firstPlan.title,
              status: "VALID",
            },
          ]
        : [],
    );
  }

  if (pathname === "users/me/reputation-disputes" && request.method === "GET") {
    return scenarioJson([]);
  }

  if (
    pathname === "users/me/reputation-disputes" &&
    request.method === "POST" &&
    viewer
  ) {
    const legacyScore = Math.round(
      viewer.trustScore > 0 && viewer.trustScore <= 1
        ? viewer.trustScore * 100
        : viewer.trustScore,
    );
    viewer.reputationSummary = {
      calculationVersion:
        viewer.reputationSummary?.calculationVersion ?? "legacy-baseline-v1",
      displayScore: viewer.reputationSummary?.displayScore ?? legacyScore,
      distinctCounterpartyCount:
        viewer.reputationSummary?.distinctCounterpartyCount ?? 0,
      eligiblePlanCount: viewer.reputationSummary?.eligiblePlanCount ?? 0,
      evidenceState: viewer.reputationSummary?.evidenceState ?? "LIMITED",
      evidenceThrough: viewer.reputationSummary?.evidenceThrough ?? world.clock,
      hasOpenCorrection: true,
      updatedAt: viewer.reputationSummary?.updatedAt ?? world.clock,
    };
    return scenarioJson({
      createdAt: world.clock,
      id: `scenario-reputation-dispute-${viewer.id}`,
      inputId: null,
      status: "OPEN",
    });
  }

  if (
    pathname === "users/me/personality-assessment" &&
    request.method === "GET"
  ) {
    return scenarioJson(projectPersonalityAssessmentState(viewer));
  }

  if (
    pathname === "users/me/personality-assessment/capabilities" &&
    request.method === "GET"
  ) {
    return scenarioJson(projectPersonalityAssessmentCapabilities());
  }

  if (pathname === "users/me" && request.method === "PATCH" && viewer) {
    const payload = await readJsonObject(request);
    if (Object.hasOwn(payload, "onboardingIntent")) {
      world.onboarding.intentStepComplete = true;
    }
    const updatedViewer = fullUserResponseSchema.parse({
      ...viewer,
      ...payload,
      updatedAt: world.clock,
    });
    world.entities.users[viewer.id] = updatedViewer;
    return scenarioJson(updatedViewer);
  }

  if (pathname === "auth/refresh" && request.method === "POST" && viewer) {
    return scenarioJson({
      accessToken: "scenario-access-token",
      currentUser: viewer,
      refreshToken: "scenario-refresh-token",
    });
  }

  if (pathname === "admin/moderation/session" && request.method === "GET") {
    if (viewer?.role !== "ADMIN") {
      return scenarioJson(
        { error: "FORBIDDEN", message: "Administrator access required." },
        { status: 403 },
      );
    }

    return scenarioJson({
      breakGlass: false,
      capabilities: {
        decideCases: true,
        manageAccountRights: true,
        manageConfiguration: true,
        manageWorkers: true,
        revealEvidence: true,
        reverseActions: true,
        viewAuditLog: !world.traits.includes("audit-restricted"),
        viewQueueHealth: !world.traits.includes("queue-health-restricted"),
        viewCases: true,
      },
      displayName: viewer.name,
      operatorAccountId: "scenario-operator-account",
      role: "ADMIN",
      stepUpExpiresAt: world.admin.recentVerification
        ? "2026-08-01T10:00:00.000Z"
        : null,
      userId: viewer.id,
    });
  }

  if (pathname === "operator/moderation/session" && request.method === "GET") {
    if (viewer?.role !== "ADMIN") {
      return scenarioJson(
        { error: "FORBIDDEN", message: "Operator access required." },
        { status: 403 },
      );
    }

    return scenarioJson({
      accountId: "scenario-operator-account",
      breakGlass: false,
      displayName: viewer.name,
      roles: ["OWNER_ADMIN", "MODERATOR"],
      stepUpAt: world.admin.recentVerification
        ? "2026-08-01T09:00:00.000Z"
        : null,
      stepUpExpiresAt: world.admin.recentVerification
        ? "2026-08-01T10:00:00.000Z"
        : null,
    });
  }

  if (
    pathname === "admin/moderation/lifecycle-queue" &&
    request.method === "GET"
  ) {
    const plan = world.entities.plans["scenario-plan-basketball"];
    const group = plan ? world.entities.groups[plan.groupId] : null;
    const items =
      world.traits.includes("worker-degraded") &&
      !world.traits.includes("lifecycle-reconciled") &&
      plan &&
      group
        ? [
            {
              detectedAt: world.clock,
              groupId: group.id,
              id: `scenario-stuck-offer-${plan.id}`,
              planId: plan.id,
              reason: "Expired offer still active",
              suggestedAction: "RUN_SEAT_RECONCILIATION",
              type: "SEAT_OFFER_STUCK",
            },
          ]
        : [];
    return scenarioJson({ generatedAt: world.clock, items });
  }

  if (
    pathname === "admin/moderation/lifecycle-queue/reconcile" &&
    request.method === "POST"
  ) {
    const payload = await readJsonObject(request);
    const action = String(payload.action ?? "");
    const resourceId = String(payload.resourceId ?? "");
    if (!action || !resourceId) {
      return scenarioJson(
        { code: "INVALID_RECONCILIATION", message: "Action is required." },
        { status: 422 },
      );
    }
    world.traits.push("lifecycle-reconciled");
    return scenarioJson({
      action,
      affected: 1,
      resourceId,
      status: "RECONCILED",
    });
  }

  if (
    pathname === "operator/moderation/queue-summary" &&
    request.method === "GET"
  ) {
    const count = world.traits.includes("admin-empty") ? 0 : 1;
    return scenarioJson({
      counts: [
        "CRITICAL_NOW",
        "HUMAN_REQUIRED",
        "APPEALS",
        "CONTAINMENT_REVIEW",
        "ROUTINE",
        "CAMPAIGNS_TRENDS",
      ].map((queue) => ({ count, queue })),
      definitionVersion: "moderation-operations-v1",
      generatedAt: world.clock,
    });
  }

  if (
    pathname === "operator/moderation/queue-health" &&
    request.method === "GET"
  ) {
    if (world.traits.includes("queue-health-restricted")) {
      return scenarioJson(
        { error: "FORBIDDEN", message: "Queue health is restricted." },
        { status: 403 },
      );
    }
    if (world.traits.includes("queue-health-error")) {
      return scenarioJson(
        { error: "UNAVAILABLE", message: "Queue health is unavailable." },
        { status: 503 },
      );
    }
    return scenarioJson(scenarioQueueHealth(world));
  }

  if (pathname === "operator/audit-events" && request.method === "GET") {
    if (world.traits.includes("audit-restricted")) {
      return scenarioJson(
        { error: "FORBIDDEN", message: "Audit history is restricted." },
        { status: 403 },
      );
    }
    const allEvents = world.traits.includes("admin-empty")
      ? []
      : scenarioAuditEvents();
    const filtered = filterScenarioAuditEvents(allEvents, url);
    const offset = url.searchParams.has("cursor") ? 25 : 0;
    const limit = Number(url.searchParams.get("limit") ?? 25);
    const items = filtered.slice(offset, offset + limit);
    return scenarioJson({
      generatedAt: world.clock,
      items,
      nextCursor: offset + limit < filtered.length ? "scenario-next" : null,
    });
  }

  const auditEventMatch = pathname.match(/^operator\/audit-events\/([^/]+)$/u);
  if (auditEventMatch && request.method === "GET") {
    const event = scenarioAuditEvents().find(
      (item) => item.id === decodeURIComponent(auditEventMatch[1]),
    );
    if (!event) {
      return scenarioJson(
        { error: "NOT_FOUND", message: "Audit event not found." },
        { status: 404 },
      );
    }
    return scenarioJson({
      ...event,
      metadata: {
        policyVersion: "policy-2026-08",
        requestedItems: ["caseId", "outcome"],
      },
    });
  }

  if (pathname === "operator/moderation/cases" && request.method === "GET") {
    const queue = url.searchParams.get("queue") ?? "HUMAN_REQUIRED";
    const candidates = world.traits.includes("admin-empty")
      ? []
      : [scenarioModerationCase(world.clock)];
    const data = filterScenarioModerationCases(candidates, url, world.clock);
    return scenarioJson({
      data,
      limit: Number(url.searchParams.get("limit") ?? 25),
      page: Number(url.searchParams.get("page") ?? 1),
      queue,
      summary: scenarioCaseSummary(data, world.clock),
      total: data.length,
    });
  }

  if (pathname === "operator/moderation/intake" && request.method === "GET") {
    const candidates = world.traits.includes("admin-empty")
      ? []
      : [scenarioModerationCase(world.clock)];
    const data = filterScenarioModerationCases(candidates, url, world.clock);
    return scenarioJson({
      data,
      limit: Number(url.searchParams.get("limit") ?? 25),
      page: Number(url.searchParams.get("page") ?? 1),
      summary: scenarioCaseSummary(data, world.clock),
      total: data.length,
    });
  }

  if (
    /^operator\/moderation\/cases\/[^/]+$/u.test(pathname) &&
    request.method === "GET"
  ) {
    return scenarioJson({
      ...scenarioModerationCase(world.clock),
      appeals: [],
      breakGlassReviewRequired: false,
      decisions: [],
      enforcementActions: [],
      operatorAssignments: [],
      outcomeReviewRequests: [],
      protectiveContainments: [],
      reports: [],
    });
  }

  if (
    /^operator\/moderation\/cases\/[^/]+\/evidence$/u.test(pathname) &&
    request.method === "GET"
  ) {
    return scenarioJson([]);
  }

  if (
    /^operator\/moderation\/cases\/[^/]+\/assessments$/u.test(pathname) &&
    request.method === "GET"
  ) {
    return scenarioJson({
      assessments: [],
      state: "NOT_REQUESTED",
      stateReasonCode: null,
    });
  }

  if (pathname === "operator/moderation/workers" && request.method === "GET") {
    const isDegraded = world.traits.includes("worker-degraded");
    return scenarioJson({
      assistanceMode: isDegraded ? "PAUSED" : "SHADOW",
      automaticActionsEnabled: false,
      generatedAt: world.clock,
      workers: [
        scenarioWorker(
          "MODERATION_ASSISTANCE",
          "Moderation assistance",
          isDegraded,
        ),
        scenarioWorker("EVIDENCE_PRESERVATION", "Evidence preservation", false),
        scenarioWorker("DOMAIN_EVENT_OUTBOX", "Domain event outbox", false),
      ],
    });
  }

  const workerJobsMatch = pathname.match(
    /^operator\/moderation\/workers\/([^/]+)\/jobs$/u,
  );
  if (workerJobsMatch && request.method === "GET") {
    const workerKind = decodeURIComponent(workerJobsMatch[1]);
    const data = world.traits.includes("worker-degraded")
      ? [
          {
            attempts: 3,
            caseReference: "CASE-SCENARIO-001",
            createdAt: "2026-07-31T23:00:00.000Z",
            id: "scenario-worker-job-1",
            kind: workerKind,
            lastErrorCode: "SCENARIO_PROVIDER_TIMEOUT",
            lifetimeAttempts: 3,
            maxAttempts: 5,
            nextRetryAt: "2026-08-01T09:40:00.000Z",
            status: "FAILED",
            updatedAt: world.clock,
            version: 1,
          },
        ]
      : [];
    return scenarioJson({
      data,
      limit: Number(url.searchParams.get("limit") ?? 25),
      page: Number(url.searchParams.get("page") ?? 1),
      total: data.length,
      workerKind,
    });
  }

  if (
    pathname === "operator/pilot/operations/readiness" &&
    request.method === "GET"
  ) {
    return scenarioJson(scenarioOperationsReadiness(world));
  }

  if (pathname === "admin/pilot/status" && request.method === "GET") {
    return scenarioJson(scenarioPilotStatus(world));
  }

  if (
    pathname === "admin/account-rights/adult-eligibility-corrections" &&
    request.method === "GET"
  ) {
    return scenarioJson([]);
  }

  if (
    pathname === "operator/moderation/control/configurations" &&
    request.method === "GET"
  ) {
    return scenarioJson([]);
  }

  if (
    pathname === "operator/moderation/control/configurations/state" &&
    request.method === "GET"
  ) {
    return scenarioJson({
      activeConfigurationId: null,
      activeConfigurationRowVersion: null,
      stateKey: "primary",
      stateRowVersion: 1,
    });
  }

  if (
    pathname === "operator/moderation/control/configurations/draft-template" &&
    request.method === "GET"
  ) {
    return scenarioJson(scenarioModerationConfigurationTemplate());
  }

  if (pathname === "auth/logout" && request.method === "POST") {
    world.account.authenticated = false;
    world.viewerId = null;
    return new Response(null, { status: 204 });
  }

  if (pathname === "settings/me" && request.method === "GET") {
    return scenarioJson(world.settings);
  }

  if (pathname === "settings/me" && request.method === "PATCH") {
    const payload = await readJsonObject(request);
    world.settings = { ...world.settings, ...payload };
    return scenarioJson(world.settings);
  }

  if (pathname === "users/me/activity-history" && request.method === "GET") {
    const completedPlans = Object.values(world.entities.plans)
      .filter((plan) => plan.status === "COMPLETED")
      .sort((left, right) => right.id.localeCompare(left.id));
    const items = completedPlans.flatMap((plan) => {
      const group = world.entities.groups[plan.groupId];
      const activity = group
        ? world.entities.activities[group.activityId]
        : null;
      if (!group || !activity || !world.viewerId) return [];
      return [
        {
          activityTitle: activity.title,
          attendance: "ATTENDED" as const,
          completedAt: plan.dateTime ?? world.clock,
          coverImage: plan.coverImage,
          groupId: group.id,
          groupName: group.name,
          id: `scenario-history-${plan.id}`,
          participantScope: group.memberIds.includes(world.viewerId)
            ? ("MEMBER" as const)
            : ("GUEST" as const),
          planCategory: plan.category,
          planTitle: plan.title,
          repeatSourcePlanId:
            group.status === "ARCHIVED" || group.status === "DISBANDED"
              ? null
              : plan.id,
          verificationState: "ORGANIZER_REPORTED" as const,
        },
      ];
    });
    return scenarioJson({ items, nextCursor: null });
  }

  if (pathname === "auth/sessions" && request.method === "GET") {
    const sessionCount = world.traits.includes("many-sessions") ? 8 : 1;
    return scenarioJson({
      items: viewer
        ? Array.from({ length: sessionCount }, (_, index) => ({
            createdAt: `2026-07-${String(30 - index).padStart(2, "0")}T08:00:00.000Z`,
            expiresAt: "2026-08-30T08:00:00.000Z",
            id:
              index === 0
                ? "scenario-session-current"
                : `scenario-session-${index + 1}`,
            ipAddress: index === 0 ? "127.0.0.1" : `192.0.2.${index + 10}`,
            isCurrent: index === 0,
            userAgent:
              index === 0
                ? "Scenario Browser"
                : index % 2 === 0
                  ? "Chrome on Android"
                  : "Safari on macOS",
          }))
        : [],
    });
  }

  if (
    pathname.match(/^auth\/sessions\/[^/]+\/revoke$/u) &&
    request.method === "POST"
  ) {
    return new Response(null, {
      headers: { "x-request-id": "scenario-request" },
      status: 204,
    });
  }

  if (pathname === "auth/sessions/revoke-others" && request.method === "POST") {
    return new Response(null, {
      headers: { "x-request-id": "scenario-request" },
      status: 204,
    });
  }

  if (pathname === "users/me/account-lifecycle" && request.method === "GET") {
    return scenarioJson({
      canDeactivate: true,
      canDelete: true,
      deactivatedAt: null,
      deletedAt: null,
      lifecycle: "ACTIVE",
      retainedRecordNotice: "SHARED_HISTORY_AND_SAFETY",
    });
  }

  if (
    pathname === "users/me/adult-eligibility/correction" &&
    request.method === "GET"
  ) {
    return scenarioJson({ request: null });
  }

  if (pathname === "users/me/account-export" && request.method === "GET") {
    const waiting = world.traits.includes("export-waiting");
    return scenarioJson({
      export: waiting
        ? {
            canDownload: false,
            canRequest: false,
            canRetry: false,
            consumedAt: null,
            expiresAt: null,
            failedAt: null,
            failureCode: null,
            id: "scenario-account-export",
            processingAt: world.clock,
            readyAt: null,
            requestedAt: world.clock,
            state: "PROCESSING",
            storageDeletedAt: null,
          }
        : null,
    });
  }

  if (pathname === "activity-invite-availability" && request.method === "GET") {
    return scenarioJson({
      availableUntil: null,
      canAppearInLocalSuggestions: false,
      canAppearInOnlineSuggestions: false,
      lifecycle: null,
      localEnabled: false,
      onlineEnabled: false,
      policyVersion: "activity-invite-availability-v1",
      reconfirmedAt: null,
      revision: 0,
    });
  }

  if (pathname === "group-formation/availability" && request.method === "GET") {
    return scenarioJson({
      availableUntil: null,
      canReceiveLocalProposals: false,
      canReceiveOnlineProposals: false,
      lifecycle: null,
      liveAutomaticGroupCount: 0,
      localEnabled: false,
      onlineEnabled: false,
      policyVersion: "group-proposal-availability-v1",
      proposalCooldownUntil: null,
      reconfirmedAt: null,
      reservedSeatCount: 0,
      revision: 0,
    });
  }

  if (
    pathname === "automatic-group-formation-requests/current" &&
    request.method === "GET"
  ) {
    return scenarioJson({ request: null });
  }

  if (pathname === "group-proposals/current" && request.method === "GET") {
    const proposal = world.traits.includes("group-proposal-current")
      ? projectScenarioGroupProposal(world)
      : null;
    return scenarioJson({ proposal });
  }

  const groupProposalDetailMatch = pathname.match(
    /^group-proposals\/([^/]+)$/u,
  );
  if (groupProposalDetailMatch && request.method === "GET") {
    const proposal = projectScenarioGroupProposal(world);
    return groupProposalDetailMatch[1] === SCENARIO_GROUP_PROPOSAL_ID &&
      proposal
      ? scenarioJson(proposal)
      : notFound(pathname);
  }

  if (pathname === "chats/activity-feed" && request.method === "GET") {
    return scenarioJson(
      scenarioPage(
        projectActivityChats(world),
        Number(url.searchParams.get("limit") ?? 50),
      ),
    );
  }

  if (pathname === "groups/activity-feed" && request.method === "GET") {
    return scenarioJson(
      scenarioPage(
        projectActivityGroups(world),
        Number(url.searchParams.get("limit") ?? 50),
      ),
    );
  }

  if (pathname === "chats/saved-messages" && request.method === "GET") {
    return scenarioJson(
      scenarioPage([], Number(url.searchParams.get("limit") ?? 50)),
    );
  }

  const chatMessagesMatch = pathname.match(/^chats\/([^/]+)\/messages$/u);
  if (chatMessagesMatch && request.method === "GET") {
    const chatId = decodeURIComponent(chatMessagesMatch[1]);
    if (!projectActivityChat(world, chatId)) {
      return notFound(pathname);
    }
    const messages = Object.values(world.entities.messages)
      .map((message) => messageApiSchema.safeParse(message))
      .filter((result) => result.success && result.data.chatId === chatId)
      .map((result) => result.data);
    return scenarioJson(
      scenarioPage(messages, Number(url.searchParams.get("limit") ?? 50)),
    );
  }

  if (chatMessagesMatch && request.method === "POST") {
    const chatId = decodeURIComponent(chatMessagesMatch[1]);
    const chat = projectActivityChat(world, chatId);
    if (!chat || !viewer) {
      return notFound(pathname);
    }
    const payload = await readJsonObject(request);
    const message = createScenarioMessage({
      chatId,
      clock: world.clock,
      index: Object.keys(world.entities.messages).length + 1,
      payload,
      viewer,
    });
    world.entities.messages[message.id] = message;
    world.entities.chats[chatId] = chatApiSchema.parse({
      ...chat,
      hasUnread: false,
      lastMessage: message,
      unreadCount: 0,
    });
    return scenarioJson(message);
  }

  const chatReadMatch = pathname.match(/^chats\/([^/]+)\/read$/u);
  if (chatReadMatch && request.method === "POST") {
    const chatId = decodeURIComponent(chatReadMatch[1]);
    const chat = projectActivityChat(world, chatId);
    if (!chat) {
      return notFound(pathname);
    }
    const updatedChat = chatApiSchema.parse({
      ...chat,
      hasUnread: false,
      unreadCount: 0,
    });
    world.entities.chats[chatId] = updatedChat;
    return scenarioJson(updatedChat);
  }

  const chatMatch = pathname.match(/^chats\/([^/]+)$/u);
  if (chatMatch && request.method === "GET") {
    const chat = projectActivityChat(world, decodeURIComponent(chatMatch[1]));
    return chat ? scenarioJson(chat) : notFound(pathname);
  }

  if (pathname === "activities" && request.method === "GET") {
    const recentActivities = world.traits.includes("empty-recent")
      ? []
      : Object.values(world.entities.groups).map((group) => {
          const activity = world.entities.activities[group.activityId];
          const planId = group.planIds.at(0);
          const plan = planId ? world.entities.plans[planId] : null;
          return {
            createdAt: group.createdAt,
            description: group.description,
            groupFormationMode: "MANUAL",
            group: {
              avatar: group.avatar,
              description: group.description,
              maxMembers: group.maxMembers,
              name: group.name,
              plan: plan
                ? {
                    category: plan.category,
                    cost: plan.cost,
                    costAmount: plan.costAmount,
                    costDetails: plan.costDetails,
                    coverImage: plan.coverImage,
                    description: plan.description,
                    location: plan.location,
                    locationLat: plan.locationLat,
                    locationLng: plan.locationLng,
                    locationMode: plan.locationMode,
                    scheduleMode: plan.scheduleMode,
                    title: plan.title,
                  }
                : null,
            },
            id: activity.id,
            interests: activity.interestIds.map(
              (id) => world.entities.interests[id],
            ),
            title: activity.title,
            visibility: activity.visibility,
          };
        });
    return scenarioJson(
      scenarioPage(
        recentActivities,
        Number(url.searchParams.get("limit") ?? 50),
      ),
    );
  }

  if (pathname === "notifications/unread-count" && request.method === "GET") {
    return scenarioJson({
      unreadCount: Object.values(world.entities.notifications).filter(
        (notification) => !notification.isRead,
      ).length,
    });
  }

  if (
    pathname === "notifications/web-push/public-key" &&
    request.method === "GET"
  ) {
    return scenarioJson({ enabled: false, publicKey: "" });
  }

  if (
    pathname === "notifications/web-push/subscriptions" &&
    request.method === "GET"
  ) {
    return scenarioJson([]);
  }

  if (pathname === "reports" && request.method === "GET") {
    return scenarioJson(
      scenarioPage(
        Object.values(world.entities.reports),
        Number(url.searchParams.get("limit") ?? 50),
      ),
    );
  }

  const reportDetailMatch = pathname.match(/^reports\/([^/]+)$/u);
  if (reportDetailMatch && request.method === "GET") {
    const reportId = decodeURIComponent(reportDetailMatch[1]);
    const report = world.entities.reports[reportId];
    return report ? scenarioJson(report) : notFound(pathname);
  }

  const reportReviewsMatch = pathname.match(
    /^reports\/([^/]+)\/outcome-review-requests$/u,
  );
  if (reportReviewsMatch && request.method === "GET") {
    const reportId = decodeURIComponent(reportReviewsMatch[1]);
    const report = world.entities.reports[reportId];
    if (!report) return notFound(pathname);

    return scenarioJson(
      report.outcomeReviewStatus
        ? [
            {
              id: `scenario-outcome-review-${reportId}`,
              resolvedAt: null,
              result: null,
              status: report.outcomeReviewStatus,
              submittedAt: world.clock,
            },
          ]
        : [],
    );
  }

  if (reportReviewsMatch && request.method === "POST") {
    const reportId = decodeURIComponent(reportReviewsMatch[1]);
    const report = world.entities.reports[reportId];
    if (!report) return notFound(pathname);

    report.outcomeReviewStatus = "RECEIVED";
    report.outcomeReviewEligibility = {
      canRequest: false,
      deadline: report.outcomeReviewEligibility.deadline,
      reasonCode: "REVIEW_ALREADY_OPEN",
    };
    return scenarioJson(
      {
        id: `scenario-outcome-review-${reportId}`,
        resolvedAt: null,
        result: null,
        status: "RECEIVED",
        submittedAt: world.clock,
      },
      { status: 201 },
    );
  }

  const informationResponseMatch = pathname.match(
    /^reports\/([^/]+)\/information-responses$/u,
  );
  if (informationResponseMatch && request.method === "POST") {
    const reportId = decodeURIComponent(informationResponseMatch[1]);
    const report = world.entities.reports[reportId];
    if (!report) return notFound(pathname);
    const payload = await readJsonObject(request);
    const requestId = String(payload.requestId ?? "");
    if (!requestId) {
      return scenarioJson(
        { message: "An information request is required." },
        { status: 422 },
      );
    }
    report.informationRequest = null;
    return scenarioJson(
      {
        id: `scenario-information-response-${reportId}`,
        requestId,
        submittedAt: world.clock,
      },
      { status: 201 },
    );
  }

  if (pathname === "friends/blocked" && request.method === "GET") {
    return scenarioJson(
      scenarioPage([], Number(url.searchParams.get("limit") ?? 50)),
    );
  }

  if (pathname === "safety/enforcement-notices" && request.method === "GET") {
    return scenarioJson(
      scenarioPage(
        Object.values(world.safety.enforcementNotices),
        Number(url.searchParams.get("limit") ?? 50),
      ),
    );
  }

  const enforcementNoticeMatch = pathname.match(
    /^safety\/enforcement-notices\/([^/]+)$/u,
  );
  if (enforcementNoticeMatch && request.method === "GET") {
    const noticeId = decodeURIComponent(enforcementNoticeMatch[1]);
    const notice = world.safety.enforcementNotices[noticeId];
    return notice ? scenarioJson(notice) : notFound(pathname);
  }

  const enforcementAppealMatch = pathname.match(
    /^safety\/enforcement-notices\/([^/]+)\/appeals$/u,
  );
  if (enforcementAppealMatch && request.method === "POST") {
    const noticeId = decodeURIComponent(enforcementAppealMatch[1]);
    const notice = world.safety.enforcementNotices[noticeId];
    if (!notice) return notFound(pathname);
    const appeal = {
      decidedAt: null,
      id: `scenario-appeal-${noticeId}`,
      status: "RECEIVED" as const,
      submittedAt: world.clock,
    };
    notice.appeal = appeal;
    notice.canAppeal = false;
    return scenarioJson(appeal, { status: 201 });
  }

  if (pathname === "safety/containments" && request.method === "GET") {
    return scenarioJson(
      scenarioPage(
        Object.values(world.safety.containments),
        Number(url.searchParams.get("limit") ?? 50),
      ),
    );
  }

  const containmentMatch = pathname.match(/^safety\/containments\/([^/]+)$/u);
  if (containmentMatch && request.method === "GET") {
    const containmentId = decodeURIComponent(containmentMatch[1]);
    const containment = world.safety.containments[containmentId];
    return containment ? scenarioJson(containment) : notFound(pathname);
  }

  const containmentContestMatch = pathname.match(
    /^safety\/containments\/([^/]+)\/contests$/u,
  );
  if (containmentContestMatch && request.method === "POST") {
    const containmentId = decodeURIComponent(containmentContestMatch[1]);
    const containment = world.safety.containments[containmentId];
    if (!containment) return notFound(pathname);
    const contest = {
      decidedAt: null,
      id: `scenario-contest-${containmentId}`,
      status: "RECEIVED" as const,
      submittedAt: world.clock,
    };
    containment.contest = contest;
    containment.canContest = false;
    return scenarioJson(contest, { status: 201 });
  }

  if (pathname === "notifications" && request.method === "GET") {
    const page = scenarioPage(
      Object.values(world.entities.notifications),
      Number(url.searchParams.get("limit") ?? 50),
    );
    return scenarioJson(page);
  }

  if (pathname === "notifications/read-all" && request.method === "POST") {
    for (const notification of Object.values(world.entities.notifications)) {
      notification.isRead = true;
    }
    return scenarioJson({ unreadCount: 0 });
  }

  const notificationMatch = pathname.match(
    /^notifications\/([^/]+)\/(read|unread)$/u,
  );
  if (notificationMatch && request.method === "POST") {
    const notification = world.entities.notifications[notificationMatch[1]];
    if (!notification) {
      return notFound(pathname);
    }
    notification.isRead = notificationMatch[2] === "read";
    return scenarioJson(notification);
  }

  if (pathname === "groups/home-summary" && request.method === "GET") {
    return scenarioJson(
      scenarioPage(
        projectHomeGroups(world),
        Number(url.searchParams.get("limit") ?? 50),
      ),
    );
  }

  const removeGroupMemberMatch = pathname.match(
    /^groups\/([^/]+)\/remove-member$/u,
  );
  if (removeGroupMemberMatch && request.method === "POST") {
    const groupId = decodeURIComponent(removeGroupMemberMatch[1]);
    const group = world.entities.groups[groupId];
    if (!group) {
      return notFound(pathname);
    }

    const payload = await readJsonObject(request);
    const memberId =
      typeof payload.memberId === "string" ? payload.memberId : null;
    if (!memberId) {
      return scenarioJson(
        { message: "A member is required." },
        { status: 422 },
      );
    }

    group.memberIds = group.memberIds.filter((id) => id !== memberId);
    const projectedGroup = projectActivityGroup(world, groupId);
    return projectedGroup ? scenarioJson(projectedGroup) : notFound(pathname);
  }

  const activityGroupMatch = pathname.match(/^groups\/([^/]+)$/u);
  if (activityGroupMatch && request.method === "GET") {
    const group = projectActivityGroup(
      world,
      decodeURIComponent(activityGroupMatch[1]),
    );
    return group ? scenarioJson(group) : notFound(pathname);
  }

  const planProposalsMatch = pathname.match(/^plans\/([^/]+)\/proposals$/u);
  if (planProposalsMatch && request.method === "GET") {
    const planId = decodeURIComponent(planProposalsMatch[1]);
    return world.entities.plans[planId] ? scenarioJson([]) : notFound(pathname);
  }

  if (
    ["invites/received", "invites/sent"].includes(pathname) &&
    request.method === "GET"
  ) {
    const invitations = Object.values(world.entities.invitations).filter(
      (invitation) => {
        const isReceived = invitation.inviteeId === world.viewerId;
        const matchesDirection =
          pathname === "invites/received" ? isReceived : !isReceived;
        const status = url.searchParams.get("status");
        const groupId = url.searchParams.get("groupId");

        return (
          matchesDirection &&
          (!status || invitation.status === status) &&
          (!groupId || invitation.groupId === groupId)
        );
      },
    );

    return scenarioJson(
      scenarioPage(invitations, Number(url.searchParams.get("limit") ?? 50)),
    );
  }

  if (pathname === "invites" && request.method === "POST" && viewer) {
    const payload = await readJsonObject(request);
    const groupId = typeof payload.groupId === "string" ? payload.groupId : "";
    const inviteeId =
      typeof payload.inviteeId === "string" ? payload.inviteeId : "";
    const group = world.entities.groups[groupId];
    const invitee = world.entities.users[inviteeId];

    if (!group || !invitee) {
      return notFound(pathname);
    }

    const invitationId = `scenario-invite-${groupId}-${inviteeId}`;
    const invitation = inviteSchema.parse({
      createdAt: world.clock,
      expiresAt: new Date(
        new Date(world.clock).getTime() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      group: {
        activeMembersCount: group.memberIds.length,
        avatar: group.avatar,
        id: group.id,
        maxMembers: group.maxMembers,
        name: group.name,
        status: group.status,
      },
      groupId,
      id: invitationId,
      invitee: toScenarioInviteUser(invitee),
      inviteeId,
      inviter: toScenarioInviteUser(viewer),
      inviterId: viewer.id,
      message: typeof payload.message === "string" ? payload.message : null,
      respondedAt: null,
      status: "PENDING",
      type: "FRIEND_INVITE",
      updatedAt: world.clock,
    });

    world.entities.invitations[invitationId] = invitation;
    if (!group.pendingInvitationIds.includes(invitationId)) {
      group.pendingInvitationIds.push(invitationId);
    }

    return scenarioJson(invitation);
  }

  if (pathname === "explore/feed" && request.method === "GET") {
    const introductory = isIntroductoryScenario(controller.descriptor.id);
    return scenarioJson({
      ...scenarioPage(
        introductory
          ? projectIntroductoryExploreFeed(world)
          : projectExploreFeed(world),
        Number(url.searchParams.get("limit") ?? 24),
        Number(url.searchParams.get("page") ?? 1),
      ),
      insight: {
        bullets: [
          "Several groups meet near your saved area.",
          "Your strongest overlaps are community, learning, and sport.",
        ],
        summary: introductory
          ? "These previews use only your selected interests and practical plan settings."
          : "A varied set of groups fits the profile in this scenario.",
      },
    });
  }

  if (pathname === "explore/groups" && request.method === "GET") {
    const introductory = isIntroductoryScenario(controller.descriptor.id);
    return scenarioJson({
      ...scenarioPage(
        introductory
          ? projectIntroductoryExploreGroups(world)
          : projectExploreGroups(world),
        Number(url.searchParams.get("limit") ?? 24),
        Number(url.searchParams.get("page") ?? 1),
      ),
      insight: {
        bullets: [
          "Several groups meet near your saved area.",
          "Your strongest overlaps are community, learning, and sport.",
        ],
        summary: introductory
          ? "These previews use only your selected interests and practical plan settings."
          : "A varied set of groups fits the profile in this scenario.",
      },
    });
  }

  const groupDetailMatch = pathname.match(/^groups\/([^/]+)\/detail$/u);
  if (groupDetailMatch && request.method === "GET") {
    const detail = projectGroupDetail(world, groupDetailMatch[1]);
    return detail ? scenarioJson(detail) : notFound(pathname);
  }

  const groupLifecycleMatch = pathname.match(
    /^groups\/([^/]+)\/(lifecycle|archive|restore)$/u,
  );
  if (groupLifecycleMatch && world.viewerId) {
    const group = world.entities.groups[groupLifecycleMatch[1]];
    if (!group) return notFound(pathname);
    const action = groupLifecycleMatch[2];
    if (action === "archive" && request.method === "POST") {
      group.status = "ARCHIVED";
      group.archivedAt = world.clock;
      group.revision = (group.revision ?? 1) + 1;
    } else if (action === "restore" && request.method === "POST") {
      group.status = "ACTIVE";
      group.archivedAt = null;
      group.revision = (group.revision ?? 1) + 1;
    } else if (!(action === "lifecycle" && request.method === "GET")) {
      return notFound(pathname);
    }
    const isArchived = group.status === "ARCHIVED";
    const isOwner = group.memberIds[0] === world.viewerId;
    const activePlanBlocksArchive = group.planIds.some((planId) =>
      ["CONFIRMED", "IN_PROGRESS"].includes(
        world.entities.plans[planId]?.status ?? "",
      ),
    );
    return scenarioJson({
      activePlanBlocksArchive,
      archiveReason: null,
      archivedAt: group.archivedAt ?? null,
      capabilities: {
        canArchive: isOwner && !isArchived && !activePlanBlocksArchive,
        canRestore: isOwner && isArchived,
        canTransferOwnership: isOwner && !isArchived,
      },
      groupId: group.id,
      isDormant: world.traits.includes("dormant-group") && !isArchived,
      isReadOnly: isArchived,
      lastMeaningfulActivityAt: group.updatedAt,
      revision: group.revision ?? 1,
      status: group.status,
    });
  }

  const ownershipTransferMatch = pathname.match(
    /^groups\/([^/]+)\/ownership-transfer$/u,
  );
  if (ownershipTransferMatch && request.method === "GET") {
    const group = world.entities.groups[ownershipTransferMatch[1]];
    return group
      ? scenarioJson(world.participation.ownershipTransfers[group.id] ?? null)
      : notFound(pathname);
  }

  if (ownershipTransferMatch && request.method === "POST" && world.viewerId) {
    const group = world.entities.groups[ownershipTransferMatch[1]];
    if (!group) return notFound(pathname);
    const payload = await readJsonObject(request);
    const recipientId = String(payload.recipientId ?? "");
    if (!group.memberIds.includes(recipientId)) {
      return scenarioJson(
        { error: "INVALID_RECIPIENT", message: "Choose a current member." },
        { status: 422 },
      );
    }
    const transfer = {
      createdAt: world.clock,
      expiresAt: new Date(
        new Date(world.clock).getTime() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      groupId: group.id,
      id: `scenario-ownership-transfer-${group.id}`,
      initiatorId: world.viewerId,
      recipientId,
      respondedAt: null,
      status: "PENDING" as const,
    };
    world.participation.ownershipTransfers[group.id] = transfer;
    return scenarioJson(transfer);
  }

  const planGuestsMatch = pathname.match(/^plans\/([^/]+)\/guests$/u);
  if (planGuestsMatch && request.method === "GET") {
    const plan = world.entities.plans[planGuestsMatch[1]];
    const group = plan ? world.entities.groups[plan.groupId] : null;
    if (!plan || !group) return notFound(pathname);
    const guest = Object.values(world.entities.users).find(
      ({ id }) => !group.memberIds.includes(id),
    );
    return scenarioJson(
      guest
        ? [
            {
              acceptedAt: world.clock,
              avatar: guest.avatar,
              id: `scenario-plan-guest-${guest.id}`,
              name: guest.name,
              userId: guest.id,
            },
          ]
        : [],
    );
  }

  const guestProposalsMatch = pathname.match(
    /^groups\/([^/]+)\/guest-membership-proposals$/u,
  );
  if (guestProposalsMatch && request.method === "GET") {
    const group = world.entities.groups[guestProposalsMatch[1]];
    return group
      ? scenarioJson(
          world.participation.guestMembershipProposals[group.id] ?? [],
        )
      : notFound(pathname);
  }

  if (guestProposalsMatch && request.method === "POST" && world.viewerId) {
    const group = world.entities.groups[guestProposalsMatch[1]];
    if (!group) return notFound(pathname);
    const payload = await readJsonObject(request);
    const planGuestId = String(payload.planGuestId ?? "");
    const userId = planGuestId.replace("scenario-plan-guest-", "");
    const guest = world.entities.users[userId];
    const planId = group.planIds.at(0);
    if (!guest || !planId) return notFound(pathname);
    const proposal = {
      approvalCount: 0,
      expiresAt: new Date(
        new Date(world.clock).getTime() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      groupId: group.id,
      guest: {
        avatar: guest.avatar,
        id: planGuestId,
        name: guest.name,
        planId,
        userId: guest.id,
      },
      guestAcceptedAt: null,
      id: `scenario-membership-proposal-${group.id}`,
      proposerId: world.viewerId,
      rejectionCount: 0,
      requiredApprovals: group.memberIds.length,
      resolvedAt: null,
      status: "PENDING_GUEST" as const,
      viewerVote: null,
    };
    world.participation.guestMembershipProposals[group.id] = [proposal];
    return scenarioJson(proposal);
  }

  const externalInvitesMatch = pathname.match(
    /^plans\/([^/]+)\/external-invites$/u,
  );
  if (externalInvitesMatch && request.method === "GET") {
    const plan = world.entities.plans[externalInvitesMatch[1]];
    return plan
      ? scenarioJson(world.participation.externalInvites[plan.id] ?? [])
      : notFound(pathname);
  }

  if (externalInvitesMatch && request.method === "POST") {
    const plan = world.entities.plans[externalInvitesMatch[1]];
    if (!plan) return notFound(pathname);
    const expiresAt = new Date(
      new Date(world.clock).getTime() + 72 * 60 * 60 * 1000,
    ).toISOString();
    const invite = {
      claimCount: 0,
      createdAt: world.clock,
      expiresAt,
      id: `scenario-external-invite-${plan.id}`,
      planId: plan.id,
      status: "ACTIVE" as const,
      useCap: 1,
    };
    world.participation.externalInvites[plan.id] = [invite];
    const referringOrigin = getReferringOrigin(request, url.origin);
    return scenarioJson({
      expiresAt,
      id: invite.id,
      planId: plan.id,
      shareUrl: `${referringOrigin}/invite?token=scenario-${plan.id}`,
    });
  }

  const revokeExternalInviteMatch = pathname.match(
    /^external-invites\/([^/]+)\/revoke$/u,
  );
  if (revokeExternalInviteMatch && request.method === "POST") {
    for (const invites of Object.values(world.participation.externalInvites)) {
      const invite = invites.find(
        ({ id }) => id === revokeExternalInviteMatch[1],
      );
      if (invite) invite.status = "REVOKED";
    }
    return new Response(null, { status: 204 });
  }

  const seatRecoveryMatch = pathname.match(/^plans\/([^/]+)\/seat-recovery$/u);
  if (seatRecoveryMatch && request.method === "GET" && world.viewerId) {
    const plan = world.entities.plans[seatRecoveryMatch[1]];
    const group = plan ? world.entities.groups[plan.groupId] : null;
    if (!plan || !group) return notFound(pathname);
    return scenarioJson({
      assignmentStatus: group.memberIds.includes(world.viewerId)
        ? "OCCUPIED"
        : null,
      consequenceVersion: "scenario-v1",
      materialRevision: plan.materialRevision,
      offer: world.participation.seatOffers[plan.id] ?? null,
      participantScope: group.memberIds.includes(world.viewerId)
        ? "GROUP_MEMBER"
        : "NONE",
      seatCounts: {
        HELD: 0,
        OCCUPIED: group.memberIds.length,
        OPEN: Math.max(0, group.maxMembers - group.memberIds.length),
      },
    });
  }

  const operationalStateMatch = pathname.match(
    /^plans\/([^/]+)\/operational-state$/u,
  );
  if (operationalStateMatch && request.method === "GET" && world.viewerId) {
    const plan = world.entities.plans[operationalStateMatch[1]];
    const group = plan ? world.entities.groups[plan.groupId] : null;
    if (!plan || !group) return notFound(pathname);
    return scenarioJson(projectPlanOperationalState(world, plan, group));
  }

  if (
    pathname === "plans/operational-state/query" &&
    request.method === "POST" &&
    world.viewerId
  ) {
    const body = await readJsonObject(request);
    const planIds = Array.isArray(body.planIds)
      ? body.planIds.filter((id): id is string => typeof id === "string")
      : [];
    return scenarioJson(
      planIds.flatMap((planId) => {
        const plan = world.entities.plans[planId];
        const group = plan ? world.entities.groups[plan.groupId] : null;
        return plan && group
          ? [projectPlanOperationalState(world, plan, group)]
          : [];
      }),
    );
  }

  const seatWaitlistMatch = pathname.match(
    /^plans\/([^/]+)\/seat-recovery\/waitlist$/u,
  );
  if (seatWaitlistMatch && request.method === "POST" && world.viewerId) {
    const plan = world.entities.plans[seatWaitlistMatch[1]];
    if (!plan) return notFound(pathname);
    const offer = {
      candidateId: world.viewerId,
      consequenceVersion: "scenario-v1",
      expiresAt: null,
      id: `scenario-seat-offer-${plan.id}`,
      materialRevision: plan.materialRevision,
      planId: plan.id,
      status: "WAITING" as const,
    };
    world.participation.seatOffers[plan.id] = offer;
    return scenarioJson(offer);
  }

  const seatOfferMatch = pathname.match(
    /^plans\/([^/]+)\/seat-offers\/([^/]+)\/(accept|decline)$/u,
  );
  if (seatOfferMatch && request.method === "POST") {
    const plan = world.entities.plans[seatOfferMatch[1]];
    const offer = plan ? world.participation.seatOffers[plan.id] : null;
    if (!plan || !offer || offer.id !== seatOfferMatch[2]) {
      return notFound(pathname);
    }
    offer.status = seatOfferMatch[3] === "accept" ? "ACCEPTED" : "DECLINED";
    return scenarioJson(offer);
  }

  const guestAccessMatch = pathname.match(/^plans\/([^/]+)\/guest-access$/u);
  if (guestAccessMatch && request.method === "GET" && world.viewerId) {
    const plan = world.entities.plans[guestAccessMatch[1]];
    const group = plan ? world.entities.groups[plan.groupId] : null;
    if (!plan || !group) return notFound(pathname);
    const withdrawn = world.participation.withdrawnGuestPlanIds.includes(
      plan.id,
    );
    return scenarioJson({
      accessFacts: [],
      canUseGroupSpaces: group.memberIds.includes(world.viewerId),
      groupId: group.id,
      groupName: group.name,
      guestStatus: group.memberIds.includes(world.viewerId)
        ? null
        : withdrawn
          ? "WITHDRAWN"
          : "ACTIVE",
      offer: null,
      participantScope: group.memberIds.includes(world.viewerId)
        ? "GROUP_MEMBER"
        : withdrawn
          ? "NONE"
          : "PLAN_GUEST",
      plan: {
        category: plan.category,
        dateTime: plan.dateTime,
        description: plan.description,
        durationMinutes: plan.dateTime ? 90 : null,
        endAt: plan.dateTime
          ? new Date(
              new Date(plan.dateTime).getTime() + 90 * 60_000,
            ).toISOString()
          : null,
        id: plan.id,
        location: plan.location,
        locationMode: plan.locationMode,
        materialRevision: plan.materialRevision,
        status: plan.status,
        title: plan.title,
      },
      seat: withdrawn
        ? null
        : {
            assignmentStatus: "OCCUPIED",
            ordinal: 1,
          },
    });
  }

  const withdrawGuestMatch = pathname.match(
    /^plans\/([^/]+)\/guest-access\/withdraw$/u,
  );
  if (withdrawGuestMatch && request.method === "POST") {
    const plan = world.entities.plans[withdrawGuestMatch[1]];
    if (!plan) return notFound(pathname);
    if (!world.participation.withdrawnGuestPlanIds.includes(plan.id)) {
      world.participation.withdrawnGuestPlanIds.push(plan.id);
    }
    return new Response(null, { status: 204 });
  }

  const proposalForPlanMatch = pathname.match(
    /^groups\/guest-membership-proposals\/for-plan\/([^/]+)$/u,
  );
  if (proposalForPlanMatch && request.method === "GET") {
    const plan = world.entities.plans[proposalForPlanMatch[1]];
    const proposals = plan
      ? world.participation.guestMembershipProposals[plan.groupId]
      : null;
    return plan ? scenarioJson(proposals?.at(0) ?? null) : notFound(pathname);
  }

  const respondGuestProposalMatch = pathname.match(
    /^groups\/guest-membership-proposals\/([^/]+)\/(respond|vote)$/u,
  );
  if (respondGuestProposalMatch && request.method === "POST") {
    const proposal = Object.values(world.participation.guestMembershipProposals)
      .flat()
      .find(({ id }) => id === respondGuestProposalMatch[1]);
    if (!proposal) return notFound(pathname);
    const payload = await readJsonObject(request);
    if (respondGuestProposalMatch[2] === "respond") {
      const accept = payload.accept === true;
      proposal.guestAcceptedAt = accept ? world.clock : null;
      proposal.status = accept ? "PENDING_VOTE" : "DECLINED";
      proposal.resolvedAt = accept ? null : world.clock;
    } else {
      const approve = payload.approve === true;
      proposal.viewerVote = approve ? "APPROVE" : "REJECT";
      proposal.approvalCount = approve ? 1 : 0;
      proposal.rejectionCount = approve ? 0 : 1;
    }
    return scenarioJson(proposal);
  }

  const respondOwnershipMatch = pathname.match(
    /^groups\/ownership-transfers\/([^/]+)\/(accept|decline|cancel)$/u,
  );
  if (respondOwnershipMatch && request.method === "POST") {
    const transfer = Object.values(world.participation.ownershipTransfers).find(
      (candidate) => candidate?.id === respondOwnershipMatch[1],
    );
    if (!transfer) return notFound(pathname);
    const response = respondOwnershipMatch[2];
    transfer.status =
      response === "accept"
        ? "ACCEPTED"
        : response === "decline"
          ? "DECLINED"
          : "CANCELLED";
    transfer.respondedAt = world.clock;
    return scenarioJson(transfer);
  }

  if (pathname === "external-invites/preview" && request.method === "GET") {
    const plan = Object.values(world.entities.plans).at(0);
    const group = plan ? world.entities.groups[plan.groupId] : null;
    if (!plan || !group) return notFound(pathname);
    return scenarioJson({
      category: plan.category,
      dateTime: plan.dateTime,
      expiresAt: new Date(
        new Date(world.clock).getTime() + 72 * 60 * 60 * 1000,
      ).toISOString(),
      groupName: group.name,
      locationMode: plan.locationMode,
      planTitle: plan.title,
      requiresAuthentication: true,
    });
  }

  if (pathname === "external-invites/exchange" && request.method === "POST") {
    const plan = Object.values(world.entities.plans).at(0);
    const group = plan ? world.entities.groups[plan.groupId] : null;
    if (!plan || !group) return notFound(pathname);
    return scenarioJson({
      category: plan.category,
      dateTime: plan.dateTime,
      expiresAt: new Date(
        new Date(world.clock).getTime() + 72 * 60 * 60 * 1000,
      ).toISOString(),
      groupName: group.name,
      locationMode: plan.locationMode,
      planTitle: plan.title,
      requiresAuthentication: true,
    });
  }

  if (pathname === "external-invites/claim" && request.method === "POST") {
    const plan = Object.values(world.entities.plans).at(0);
    if (!plan) return notFound(pathname);
    return scenarioJson({
      claimId: `scenario-claim-${plan.id}`,
      groupId: plan.groupId,
      participantScope: "PLAN_GUEST",
      planId: plan.id,
      redirectPath: `/plans/${plan.id}/guest`,
    });
  }

  if (pathname === "external-invites/suppress" && request.method === "POST") {
    return new Response(null, { status: 204 });
  }

  const planReadinessMatch = pathname.match(/^plans\/([^/]+)\/readiness$/u);
  if (planReadinessMatch && request.method === "GET" && world.viewerId) {
    const plan = world.entities.plans[planReadinessMatch[1]];
    const group = plan ? world.entities.groups[plan.groupId] : null;
    if (!plan || !group?.memberIds.includes(world.viewerId)) {
      return notFound(pathname);
    }

    return scenarioJson(
      projectPlanCommitmentReadiness(plan, group.memberIds, world.viewerId),
    );
  }

  const planCalendarConflictsMatch = pathname.match(
    /^plans\/([^/]+)\/calendar-conflicts$/u,
  );
  if (
    planCalendarConflictsMatch &&
    request.method === "GET" &&
    world.viewerId
  ) {
    const plan = world.entities.plans[planCalendarConflictsMatch[1]];
    const group = plan ? world.entities.groups[plan.groupId] : null;
    if (!plan || !group?.memberIds.includes(world.viewerId)) {
      return notFound(pathname);
    }

    return scenarioJson({ conflictCount: 0, hasConflict: false });
  }

  const planCalendarMatch = pathname.match(/^plans\/([^/]+)\/calendar\.ics$/u);
  if (planCalendarMatch && request.method === "GET" && world.viewerId) {
    const plan = world.entities.plans[planCalendarMatch[1]];
    const group = plan ? world.entities.groups[plan.groupId] : null;
    if (!plan || !group?.memberIds.includes(world.viewerId)) {
      return notFound(pathname);
    }

    return new Response(
      "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Findafew//Scenario//EN\r\nEND:VCALENDAR\r\n",
      {
        headers: {
          "content-type": "text/calendar; charset=utf-8",
          "x-request-id": "scenario-request",
        },
      },
    );
  }

  const planCommitmentMatch = pathname.match(/^plans\/([^/]+)\/commitment$/u);
  if (planCommitmentMatch && request.method === "PUT" && world.viewerId) {
    const plan = world.entities.plans[planCommitmentMatch[1]];
    const group = plan ? world.entities.groups[plan.groupId] : null;
    if (!plan || !group?.memberIds.includes(world.viewerId)) {
      return notFound(pathname);
    }

    const body = await request.json();
    if (
      !isScenarioCommitmentBody(body) ||
      body.expectedMaterialRevision !== plan.materialRevision ||
      !body.response
    ) {
      return scenarioJson(
        {
          error: "PLAN_MATERIAL_REVISION_STALE",
          message: "Review the latest plan.",
        },
        { status: 409 },
      );
    }

    plan.commitments ??= {};
    const previous = plan.commitments[world.viewerId];
    const commitment = {
      acknowledgedMaterialRevision: plan.materialRevision,
      response: body.response,
      rowVersion: (previous?.rowVersion ?? 0) + 1,
      updatedAt: world.clock,
    };
    plan.commitments[world.viewerId] = commitment;

    return scenarioJson({
      ...commitment,
      effectiveStatus: commitment.response,
      planId: plan.id,
      userId: world.viewerId,
    });
  }

  const inviteSuggestionsMatch = pathname.match(
    /^groups\/([^/]+)\/invite-suggestions$/u,
  );
  if (inviteSuggestionsMatch && request.method === "GET") {
    const group = world.entities.groups[inviteSuggestionsMatch[1]];
    const planId = group?.planIds.at(0);
    if (!group || !planId) {
      return notFound(pathname);
    }

    const candidates = Object.values(world.entities.users)
      .filter((user) => !group.memberIds.includes(user.id))
      .slice(0, 4)
      .map((user) => ({
        avatar: user.avatar,
        avatarMedia: null,
        name: user.name,
        reason: {
          code: "SHARED_INTEREST",
          interest:
            world.entities.interests[
              world.entities.activities[group.activityId].interestIds[0]
            ],
          label: "Shares an interest with this group",
        },
        suggestionId: `scenario-suggestion-${group.id}-${user.id}`,
      }));

    return scenarioJson({ groupId: group.id, items: candidates, planId });
  }

  const joinMatch = pathname.match(/^explore\/groups\/([^/]+)\/join$/u);
  if (joinMatch && request.method === "POST" && world.viewerId) {
    const group = world.entities.groups[joinMatch[1]];
    if (!group) {
      return notFound(pathname);
    }

    const joined = group.access === "OPEN";
    if (joined && !group.memberIds.includes(world.viewerId)) {
      group.memberIds.push(world.viewerId);
    }

    return scenarioJson({
      chatId: joined ? `scenario-chat-${group.id}` : null,
      groupId: group.id,
      message: joined
        ? "You joined the group."
        : "Your request was sent to the group.",
      status: joined ? "JOINED" : "REQUESTED",
    });
  }

  const inviteActionMatch = pathname.match(
    /^invites\/([^/]+)\/(accept|decline)$/u,
  );
  if (inviteActionMatch && request.method === "POST") {
    const invitation = world.entities.invitations[inviteActionMatch[1]];
    if (!invitation) {
      return notFound(pathname);
    }

    invitation.status =
      inviteActionMatch[2] === "accept" ? "ACCEPTED" : "DECLINED";
    invitation.respondedAt = world.clock;
    invitation.updatedAt = world.clock;
    if (invitation.status === "ACCEPTED") {
      const group = world.entities.groups[invitation.groupId];
      if (group && !group.memberIds.includes(invitation.inviteeId)) {
        group.memberIds.push(invitation.inviteeId);
      }
    }
    return scenarioJson(invitation);
  }

  if (pathname === "interests" && request.method === "GET") {
    return scenarioJson(scenarioInterestTree);
  }

  if (
    pathname === "users/me/interests" &&
    request.method === "POST" &&
    viewer
  ) {
    const payload = await readJsonObject(request);
    const interestIds = Array.isArray(payload.interestIds)
      ? payload.interestIds.filter((id): id is string => typeof id === "string")
      : [];
    viewer.interests = interestIds.flatMap((id) => {
      const interest = scenarioInterestLeavesById[id];
      return interest ? [interest] : [];
    });
    return scenarioJson({ interests: viewer.interests });
  }

  if (pathname === "friends" && request.method === "GET") {
    const accepted = Object.values(world.entities.friendships).filter(
      (friendship) => friendship.status === "ACCEPTED",
    );
    return scenarioJson(
      scenarioPage(accepted, Number(url.searchParams.get("limit") ?? 50)),
    );
  }

  if (
    pathname === "friends/compatibility-preview" &&
    request.method === "POST"
  ) {
    const payload = await readJsonObject(request);
    const candidateIds = Array.isArray(payload.candidateIds)
      ? payload.candidateIds.filter(
          (candidateId): candidateId is string =>
            typeof candidateId === "string",
        )
      : [];
    const groupMemberIds = Array.isArray(payload.groupMemberIds)
      ? payload.groupMemberIds.filter(
          (memberId): memberId is string => typeof memberId === "string",
        )
      : [];
    const acceptedFriendIds = new Set(
      Object.values(world.entities.friendships)
        .filter((friendship) => friendship.status === "ACCEPTED")
        .map((friendship) => friendship.counterpart.id),
    );

    return scenarioJson({
      items: candidateIds
        .filter((candidateId) => acceptedFriendIds.has(candidateId))
        .map((candidateId) => {
          const personalFit = scenarioCompatibilityScore(candidateId);
          const groupPenalty = Math.min(18, new Set(groupMemberIds).size * 3);

          return {
            groupFit: Math.max(36, personalFit - groupPenalty),
            personalFit,
            userId: candidateId,
          };
        }),
    });
  }

  if (pathname.startsWith("friends/common/") && request.method === "GET") {
    const accepted = Object.values(world.entities.friendships)
      .filter((friendship) => friendship.status === "ACCEPTED")
      .slice(0, 2);
    return scenarioJson(
      scenarioPage(accepted, Number(url.searchParams.get("limit") ?? 50)),
    );
  }

  if (pathname.startsWith("friends/public/") && request.method === "GET") {
    const targetUserId = pathname.slice("friends/public/".length);
    const publicFriends = Object.values(world.entities.users)
      .filter((user) => user.id !== world.viewerId && user.id !== targetUserId)
      .slice(0, 4)
      .map((user) => ({
        avatar: user.avatar,
        city: user.city,
        id: user.id,
        name: user.name,
      }));
    return scenarioJson(
      scenarioPage(publicFriends, Number(url.searchParams.get("limit") ?? 50)),
    );
  }

  if (
    ["friends/requests/incoming", "friends/requests/outgoing"].includes(
      pathname,
    ) &&
    request.method === "GET"
  ) {
    const incoming = pathname.endsWith("incoming");
    const friendships = Object.values(world.entities.friendships).filter(
      (friendship) =>
        friendship.status === "PENDING" &&
        (incoming
          ? friendship.receiverId === world.viewerId
          : friendship.requesterId === world.viewerId),
    );
    return scenarioJson(
      scenarioPage(friendships, Number(url.searchParams.get("limit") ?? 50)),
    );
  }

  const userProfileMatch = pathname.match(/^users\/([^/]+)$/u);
  if (userProfileMatch && request.method === "GET") {
    const profile = projectViewerProfile(world, userProfileMatch[1]);
    return profile ? scenarioJson(profile) : notFound(pathname);
  }

  return scenarioJson(
    {
      error: "SCENARIO_UNMATCHED_REQUEST",
      message: `Scenario Mode has no handler for ${request.method} ${pathname}.`,
      requestId: "scenario-unmatched-request",
    },
    { status: 501 },
  );
}

function isScenarioCommitmentBody(value: unknown): value is {
  expectedMaterialRevision: number;
  response: "CANNOT_ATTEND" | "GOING" | "UNSURE";
} {
  if (typeof value !== "object" || value === null) return false;
  return (
    "expectedMaterialRevision" in value &&
    typeof value.expectedMaterialRevision === "number" &&
    "response" in value &&
    typeof value.response === "string" &&
    ["CANNOT_ATTEND", "GOING", "UNSURE"].includes(value.response)
  );
}

function projectPlanCommitmentReadiness(
  plan: import("@/dev/scenarios/world/scenario-world").ScenarioPlanEntity,
  eligibleUserIds: string[],
  viewerId: string,
) {
  const commitments = Object.entries(plan.commitments ?? {}).filter(
    ([userId]) => eligibleUserIds.includes(userId),
  );
  const projected = commitments.map(([userId, commitment]) => ({
    ...commitment,
    effectiveStatus:
      commitment.acknowledgedMaterialRevision < plan.materialRevision
        ? "NEEDS_RECONFIRMATION"
        : commitment.response,
    planId: plan.id,
    userId,
  }));
  const count = (status: string) =>
    projected.filter((commitment) => commitment.effectiveStatus === status)
      .length;
  const required =
    eligibleUserIds.length <= 1
      ? eligibleUserIds.length
      : Math.min(
          eligibleUserIds.length,
          Math.max(2, Math.ceil(eligibleUserIds.length * 0.6)),
        );
  const goingCount = count("GOING");

  return {
    cannotAttendCount: count("CANNOT_ATTEND"),
    committedQuorum: {
      current: goingCount,
      met: goingCount >= required,
      required,
    },
    currentUserCommitment:
      projected.find((commitment) => commitment.userId === viewerId) ?? null,
    eligibleMemberCount: eligibleUserIds.length,
    eligibleParticipantCount: eligibleUserIds.length,
    goingCount,
    materialRevision: plan.materialRevision,
    needsReconfirmationCount: count("NEEDS_RECONFIRMATION"),
    notRespondedCount: Math.max(0, eligibleUserIds.length - commitments.length),
    planId: plan.id,
    unsureCount: count("UNSURE"),
  };
}

function projectPlanOperationalState(
  world: ScenarioWorld,
  plan: import("@/dev/scenarios/world/scenario-world").ScenarioPlanEntity,
  group: import("@/dev/scenarios/world/scenario-world").ScenarioGroupEntity,
) {
  const viewerId = world.viewerId ?? "";
  const memberIndex = group.memberIds.indexOf(viewerId);
  const offer = world.participation.seatOffers[plan.id] ?? null;
  const withdrawn = world.participation.withdrawnGuestPlanIds.includes(plan.id);
  const participantScope =
    memberIndex === 0
      ? "OWNER"
      : memberIndex > 0
        ? "MEMBER"
        : offer && ["WAITING", "OFFERED"].includes(offer.status)
          ? "INVITEE"
          : withdrawn
            ? "NONE"
            : "GUEST";
  const commitment = plan.commitments?.[viewerId];
  const commitmentIsCurrent = Boolean(
    commitment &&
      commitment.acknowledgedMaterialRevision >= plan.materialRevision,
  );
  const hasSchedule = Boolean(plan.dateTime);
  const hasLocation = plan.locationMode === "ONLINE" || Boolean(plan.location);
  const requiredAction =
    offer?.status === "OFFERED"
      ? "RESPOND_TO_SEAT_OFFER"
      : !hasSchedule
        ? "SET_SCHEDULE"
        : !hasLocation
          ? "SET_LOCATION"
          : !commitment || !commitmentIsCurrent
            ? commitment
              ? "RECONFIRM_COMMITMENT"
              : "SET_COMMITMENT"
            : null;
  const places = group.memberIds.map<PlanParticipantPlace>((userId, index) => ({
    assignmentStatus: "OCCUPIED",
    capabilities: {},
    id: `scenario-place-${plan.id}-${index + 1}`,
    offerExpiresAt: null,
    offerId: null,
    ordinal: index + 1,
    participantId: userId,
    participantName: world.entities.users[userId]?.name ?? "Group member",
    participantScope: index === 0 ? "OWNER" : "MEMBER",
    state: "OCCUPIED",
  }));
  for (let index = places.length; index < group.maxMembers; index += 1) {
    places.push({
      assignmentStatus: null,
      capabilities: {},
      id: `scenario-place-${plan.id}-${index + 1}`,
      offerExpiresAt: null,
      offerId: null,
      ordinal: index + 1,
      participantId: null,
      participantName: null,
      participantScope: null,
      state: "OPEN",
    });
  }
  if (offer && ["WAITING", "OFFERED"].includes(offer.status)) {
    places.push({
      assignmentStatus: offer.status === "OFFERED" ? "HELD" : null,
      capabilities: { respondToOffer: offer.candidateId === viewerId },
      id: `scenario-offer-place-${offer.id}`,
      offerExpiresAt: offer.expiresAt,
      offerId: offer.candidateId === viewerId ? offer.id : null,
      ordinal: null,
      participantId: offer.candidateId === viewerId ? viewerId : null,
      participantName: null,
      participantScope: "INVITEE",
      state: offer.status === "OFFERED" ? "HELD" : "WAITLISTED",
    });
  }
  const activeParticipant = ["OWNER", "MEMBER", "GUEST"].includes(
    participantScope,
  );
  const closed = ["CANCELLED", "COMPLETED"].includes(plan.status);

  return {
    attendance: {
      detail: null,
      label:
        plan.status === "COMPLETED"
          ? "Attendance can be recorded"
          : "Attendance opens after the plan",
      requiredAction: null,
      state: plan.status === "COMPLETED" ? "OPEN" : "NOT_OPEN",
    },
    capacity: {
      detail: `${group.memberIds.length} occupied, ${Math.max(0, group.maxMembers - group.memberIds.length)} available`,
      label:
        group.memberIds.length < group.maxMembers
          ? "Places available"
          : "All places accounted for",
      requiredAction: null,
      state: group.memberIds.length < group.maxMembers ? "AVAILABLE" : "FULL",
    },
    commitment: {
      detail: commitmentIsCurrent
        ? "Your response matches the latest plan details"
        : "A current response is needed",
      label: commitment?.response ?? "Waiting for your response",
      requiredAction:
        commitment && !commitmentIsCurrent
          ? "RECONFIRM_COMMITMENT"
          : commitment
            ? null
            : "SET_COMMITMENT",
      state: commitmentIsCurrent
        ? "CURRENT"
        : commitment
          ? "STALE"
          : "NOT_RESPONDED",
    },
    location: {
      detail: activeParticipant
        ? plan.locationMode === "ONLINE"
          ? "Online"
          : plan.location
        : "Shared after you have a place",
      label: hasLocation ? "Location agreed" : "Location still being decided",
      requiredAction: hasLocation ? null : "SET_LOCATION",
      state: hasLocation
        ? activeParticipant
          ? "RESOLVED"
          : "REDACTED"
        : "PENDING",
    },
    logistics: {
      detail: "Scenario logistics",
      label: "Logistics recorded",
      requiredAction: null,
      state: "RESOLVED",
    },
    materialRevision: plan.materialRevision,
    overall:
      plan.status === "COMPLETED"
        ? "COMPLETE"
        : plan.status === "CANCELLED"
          ? "BLOCKED"
          : requiredAction
            ? "ACTION_REQUIRED"
            : "READY",
    places,
    planId: plan.id,
    planRevision: plan.revision,
    recovery: {
      detail: offer
        ? "Your current place recovery status"
        : "Released places can be offered safely",
      label:
        offer?.status === "OFFERED"
          ? "Place offered"
          : offer?.status === "WAITING"
            ? "On the waitlist"
            : "Seat recovery available",
      requiredAction:
        offer?.status === "OFFERED" ? "RESPOND_TO_SEAT_OFFER" : null,
      state: offer?.status ?? "AVAILABLE",
    },
    schedule: {
      detail: plan.dateTime,
      label: hasSchedule ? "Schedule agreed" : "Schedule still being decided",
      requiredAction: hasSchedule ? null : "SET_SCHEDULE",
      state: hasSchedule ? "RESOLVED" : "PENDING",
    },
    stateVersion: `scenario-${plan.revision}-${plan.materialRevision}-${commitment?.rowVersion ?? 0}-${offer?.status ?? "none"}`,
    viewer: {
      capabilities: {
        acceptSeatOffer: offer?.status === "OFFERED",
        createExternalInvite: participantScope === "OWNER" && !closed,
        declineSeatOffer: Boolean(
          offer && ["WAITING", "OFFERED"].includes(offer.status),
        ),
        joinWaitlist: participantScope === "INVITEE" && !offer && !closed,
        manageParticipants: participantScope === "OWNER",
        managePlan: participantScope === "OWNER" && !closed,
        recordAttendance: plan.status === "COMPLETED" && activeParticipant,
        requestAttendanceCorrection:
          plan.status === "COMPLETED" && activeParticipant,
        setCommitment: activeParticipant && !closed,
        viewChat: ["OWNER", "MEMBER"].includes(participantScope),
        viewExactLocation: activeParticipant,
        viewRoster: ["OWNER", "MEMBER"].includes(participantScope),
        withdrawGuest: participantScope === "GUEST" && !closed,
      },
      commitmentIsCurrent,
      commitmentState: commitment?.response ?? null,
      participantScope,
      requiredAction,
      seatState: activeParticipant ? "OCCUPIED" : null,
    },
  };
}

function getApiPathname(pathname: string) {
  const markerIndex = pathname.indexOf(API_VERSION_MARKER);
  return (
    markerIndex >= 0
      ? pathname.slice(markerIndex + API_VERSION_MARKER.length)
      : pathname.replace(/^\/+/, "")
  ).replace(/\/+$/, "");
}

function record(
  controller: ScenarioController,
  request: Request,
  pathname: string,
  response: Response,
) {
  controller.recordRequest({
    method: request.method,
    pathname,
    status: response.status,
  });
  return response;
}

function notFound(pathname: string) {
  return scenarioJson(
    {
      error: "NOT_FOUND",
      message: `No scenario entity exists for ${pathname}.`,
    },
    { status: 404 },
  );
}

async function readJsonObject(request: Request) {
  const payload: unknown = await request.clone().json();

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  return Object.fromEntries(Object.entries(payload));
}

function createScenarioMessage({
  chatId,
  clock,
  index,
  payload,
  viewer,
}: {
  chatId: string;
  clock: string;
  index: number;
  payload: Record<string, unknown>;
  viewer: CurrentUser;
}) {
  return messageApiSchema.parse({
    attachments: [],
    chatId,
    content: typeof payload.content === "string" ? payload.content : "",
    createdAt: clock,
    deletedAt: null,
    editedAt: null,
    id: `scenario-message-${index}`,
    isEdited: false,
    isPinned: false,
    reactions: [],
    replyToId: typeof payload.replyToId === "string" ? payload.replyToId : null,
    sender: {
      avatar: viewer.avatar,
      id: viewer.id,
      name: viewer.name,
    },
    senderId: viewer.id,
    status: "SENT",
    type: typeof payload.type === "string" ? payload.type : "TEXT",
  });
}

function delay(durationMs: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}

function scenarioCompatibilityScore(userId: string) {
  const hash = Array.from(userId).reduce(
    (value, character) => (value * 31 + character.charCodeAt(0)) % 37,
    0,
  );

  return 58 + hash;
}

function scenarioModerationCase(clock: string) {
  return {
    closedAt: null,
    createdAt: "2026-07-31T08:45:00.000Z",
    dueAt: "2026-08-01T12:00:00.000Z",
    evidenceCompleteness: "PARTIAL",
    id: "scenario-moderation-case-1",
    mandatoryHumanReasons: ["CONFLICTING_OR_INCOMPLETE_EVIDENCE"],
    policyLabels: ["HARASSMENT_REVIEW"],
    reference: "CASE-SCENARIO-001",
    reportCount: 2,
    severity: "P2",
    status: "AWAITING_HUMAN_DECISION",
    uncertainty: "MEDIUM",
    updatedAt: clock,
    version: 1,
  };
}

type ScenarioModerationCase = ReturnType<typeof scenarioModerationCase>;

function scenarioAuditEvents() {
  return Array.from({ length: 28 }, (_, index) => {
    const sequence = 28 - index;
    const createdAt = new Date(
      Date.UTC(2026, 7, 1, 9, 30) - index * 15 * 60_000,
    ).toISOString();
    const outcome = index % 7 === 0 ? "DENIED" : "SUCCEEDED";
    return {
      actor: {
        accountId: "scenario-operator-account",
        displayName: "Quinn Hart",
        reference: "OPERATOR-ACCOUNT",
      },
      caseId: "scenario-moderation-case-1",
      caseReference: "CASE-N-CASE-1",
      createdAt,
      eventType:
        index % 3 === 0
          ? "OPERATOR_CASE_OPENED"
          : index % 3 === 1
            ? "OPERATOR_CASE_ASSIGNED"
            : "OPERATOR_AUDIT_LOG_LIST_VIEWED",
      id: `scenario-audit-${String(sequence).padStart(2, "0")}`,
      outcome,
      reasonCode: outcome === "DENIED" ? "ROLE_NOT_PERMITTED" : "CASE_REVIEW",
      targetId: "scenario-moderation-case-1",
      targetType: "MODERATION_CASE",
    };
  });
}

type ScenarioAuditEvent = ReturnType<typeof scenarioAuditEvents>[number];

function filterScenarioAuditEvents(events: ScenarioAuditEvent[], url: URL) {
  const exactFilters: Array<[keyof ScenarioAuditEvent, string]> = [
    ["caseId", "caseId"],
    ["eventType", "eventType"],
    ["outcome", "outcome"],
    ["targetId", "targetId"],
    ["targetType", "targetType"],
  ];
  const filtered = events.filter((event) => {
    const scalarMatch = exactFilters.every(([field, parameter]) => {
      const expected = url.searchParams.get(parameter);
      return !expected || event[field] === expected;
    });
    const actor = url.searchParams.get("actorAccountId");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const time = new Date(event.createdAt).getTime();
    return (
      scalarMatch &&
      (!actor || event.actor.accountId === actor) &&
      (!from || time >= new Date(from).getTime()) &&
      (!to || time <= new Date(to).getTime())
    );
  });
  return url.searchParams.get("sort") === "OLDEST"
    ? [...filtered].reverse()
    : filtered;
}

function filterScenarioModerationCases(
  cases: ScenarioModerationCase[],
  url: URL,
  clock: string,
) {
  const generatedAt = new Date(clock).getTime();
  return cases.filter((item) => {
    const matchesScalar = [
      ["status", item.status],
      ["severity", item.severity],
      ["evidenceCompleteness", item.evidenceCompleteness],
      ["uncertainty", item.uncertainty],
    ].every(([key, value]) => {
      const requested = url.searchParams.get(key);
      return !requested || requested === value;
    });
    if (!matchesScalar) return false;

    const dueAt = item.dueAt ? new Date(item.dueAt).getTime() : null;
    const sla = url.searchParams.get("sla");
    if (sla === "OVERDUE" && (!dueAt || dueAt > generatedAt)) return false;
    if (
      sla === "DUE_SOON" &&
      (!dueAt || dueAt <= generatedAt || dueAt > generatedAt + 86_400_000)
    ) {
      return false;
    }
    if (sla === "MISSING_DEADLINE" && dueAt !== null) return false;
    return (
      matchesScenarioDateRange(item.createdAt, url, "created") &&
      matchesScenarioDateRange(item.dueAt, url, "due")
    );
  });
}

function matchesScenarioDateRange(
  value: string | null,
  url: URL,
  prefix: "created" | "due",
) {
  const from = url.searchParams.get(`${prefix}From`);
  const to = url.searchParams.get(`${prefix}To`);
  if (!from && !to) return true;
  if (!value) return false;
  const time = new Date(value).getTime();
  return (
    (!from || time >= new Date(from).getTime()) &&
    (!to || time <= new Date(to).getTime())
  );
}

function scenarioCaseSummary(cases: ScenarioModerationCase[], clock: string) {
  const generatedAt = new Date(clock).getTime();
  const unresolved = cases.filter(
    (item) => item.status !== "RESOLVED" && item.status !== "CLOSED",
  );
  return {
    definitionVersion: "moderation-operations-v1",
    dueSoon: unresolved.filter((item) => {
      const dueAt = item.dueAt ? new Date(item.dueAt).getTime() : null;
      return dueAt && dueAt > generatedAt && dueAt <= generatedAt + 86_400_000;
    }).length,
    generatedAt: clock,
    highSeverity: cases.filter(
      (item) => item.severity === "P0" || item.severity === "P1",
    ).length,
    missingDeadline: unresolved.filter((item) => !item.dueAt).length,
    oldestCreatedAt:
      cases
        .map((item) => item.createdAt)
        .sort((left, right) => left.localeCompare(right))[0] ?? null,
    overdue: unresolved.filter(
      (item) => item.dueAt && new Date(item.dueAt).getTime() <= generatedAt,
    ).length,
    total: cases.length,
  };
}

function scenarioQueueHealth(world: ScenarioController["world"]) {
  const empty = world.traits.includes("admin-empty");
  const generatedAt = world.traits.includes("queue-health-stale")
    ? "2026-07-31T10:30:00.000Z"
    : new Date().toISOString();
  const counts = empty
    ? {
        backlog: 0,
        dueSoon: 0,
        missingDeadline: 0,
        oldestCaseAgeSeconds: null,
        overdue: 0,
        unassigned: 0,
      }
    : {
        backlog: 27,
        dueSoon: 5,
        missingDeadline: 3,
        oldestCaseAgeSeconds: 9 * 86_400,
        overdue: 6,
        unassigned: 8,
      };
  const queueRows = [
    ["CRITICAL_NOW", 8, 6, 1, 1, 3, 9 * 86_400],
    ["HUMAN_REQUIRED", 14, 4, 3, 3, 5, 9 * 86_400],
    ["APPEALS", 4, 1, 1, 0, 1, 4 * 86_400],
    ["CONTAINMENT_REVIEW", 3, 2, 0, 0, 1, 3 * 86_400],
    ["ROUTINE", 9, 0, 4, 0, 2, 2 * 86_400],
    ["CAMPAIGNS_TRENDS", 2, 0, 0, 1, 1, 7 * 86_400],
  ] as const;

  return {
    ageBands: [
      {
        code: "AGE_LT_24H",
        count: empty ? 0 : 6,
        maximumHours: 24,
        minimumHours: 0,
      },
      {
        code: "AGE_24_TO_72H",
        count: empty ? 0 : 9,
        maximumHours: 72,
        minimumHours: 24,
      },
      {
        code: "AGE_72H_TO_7D",
        count: empty ? 0 : 8,
        maximumHours: 168,
        minimumHours: 72,
      },
      {
        code: "AGE_7D_PLUS",
        count: empty ? 0 : 4,
        maximumHours: null,
        minimumHours: 168,
      },
    ],
    ...counts,
    bandDefinitionVersion: "moderation-queue-health-bands-v1",
    dataQuality: world.traits.includes("queue-health-partial")
      ? "PARTIAL"
      : "COMPLETE",
    definitionVersion: "moderation-operations-v1",
    generatedAt,
    queues: queueRows.map(
      ([
        queue,
        backlog,
        overdue,
        dueSoon,
        missingDeadline,
        unassigned,
        oldestCaseAgeSeconds,
      ]) => ({
        backlog: empty ? 0 : backlog,
        dueSoon: empty ? 0 : dueSoon,
        missingDeadline: empty ? 0 : missingDeadline,
        oldestCaseAgeSeconds: empty ? null : oldestCaseAgeSeconds,
        overdue: empty ? 0 : overdue,
        queue,
        unassigned: empty ? 0 : unassigned,
      }),
    ),
    severityDistribution: [
      { count: empty ? 0 : 2, severity: "P0" },
      { count: empty ? 0 : 5, severity: "P1" },
      { count: empty ? 0 : 8, severity: "P2" },
      { count: empty ? 0 : 7, severity: "P3" },
      { count: empty ? 0 : 3, severity: "P4" },
      { count: empty ? 0 : 2, severity: "UNSET" },
    ],
  };
}

function scenarioWorker(
  kind:
    | "DOMAIN_EVENT_OUTBOX"
    | "EVIDENCE_PRESERVATION"
    | "MODERATION_ASSISTANCE",
  displayName: string,
  degraded: boolean,
) {
  return {
    activeLeases: degraded ? 0 : 1,
    deadJobs: degraded ? 1 : 0,
    displayName,
    failedJobs: degraded ? 3 : 0,
    kind,
    lastHeartbeatAt: degraded ? null : "2026-08-01T09:29:30.000Z",
    lastSuccessAt: degraded
      ? "2026-07-31T22:00:00.000Z"
      : "2026-08-01T09:29:10.000Z",
    mode: kind === "MODERATION_ASSISTANCE" ? "SHADOW" : "ENFORCING",
    oldestQueuedAt: degraded ? "2026-07-31T23:00:00.000Z" : null,
    pauseReasonCode: degraded ? "SCENARIO_WORKER_DEGRADED" : null,
    pausedAt: degraded ? "2026-08-01T08:30:00.000Z" : null,
    queueDepth: degraded ? 7 : 0,
    state: degraded ? "PAUSED" : "HEALTHY",
    version: 1,
  };
}

function scenarioPilotStatus(world: ScenarioController["world"]) {
  return {
    activeCohort: {
      code: "SCENARIO_COHORT",
      endsAt: "2026-08-15T23:59:59.000Z",
      memberCap: 25,
      memberCount: 12,
      outcomeWindowEndsAt: "2026-09-15T23:59:59.000Z",
      startsAt: "2026-07-01T00:00:00.000Z",
    },
    evaluatedAt: world.clock,
    gates: {
      aiTriage: true,
      autoRequestIntake: true,
      candidateAvailability: true,
      deterministicModerationAutomation: false,
      firstGroupChat: true,
      globalSafetyPause: false,
      onlineGroups: true,
      proposalAllocation: true,
      proposalMaterialization: true,
      strangerMedia: false,
    },
    readiness: {
      cohortConfigured: true,
      cohortWithinCap: true,
      cohortWithinWindow: true,
      materializationAllowed: true,
      minimumCohortSizeMet: true,
      newProposalExposureAllowed: true,
    },
  };
}

function scenarioOperationsReadiness(world: ScenarioController["world"]) {
  const degraded = world.traits.includes("worker-degraded");
  const blockedReasons = degraded
    ? ["MODERATION_ASSISTANCE_WORKER_PAUSED"]
    : [];
  const action = {
    allowed: !degraded,
    reasonCodes: blockedReasons,
  };

  return {
    actions: {
      firstStrangerChat: action,
      newProposalExposure: action,
      proposalMaterialization: action,
    },
    evaluatedAt: world.clock,
    moderation: {
      activeConfigurationPresent: true,
      evaluationApprovalCurrent: true,
      preservationFailures: 0,
      preservationOrphans: 0,
    },
    pilot: {
      cohortConfigured: true,
      cohortWithinCap: true,
      cohortWithinWindow: true,
      gates: {
        candidateAvailability: true,
        firstStrangerChat: true,
        globalSafetyPause: false,
        proposalAllocation: true,
        proposalMaterialization: true,
        strangerMedia: false,
      },
      minimumCohortSizeMet: true,
    },
    policyVersion: "pilot-operations-readiness-policy.v1",
    reasonCodes: blockedReasons,
    safetyQueues: {
      expiredOpenAppeals: 0,
      expiredOpenContainmentContests: 0,
      expiredOpenOutcomeReviews: 0,
      overdueUrgentCases: degraded ? 1 : 0,
      unassignedCriticalCases: 0,
    },
    schemaVersion: "pilot-operations-readiness.v1",
    status: degraded ? "BLOCKED" : "READY",
    workers: [
      scenarioReadinessWorker("MODERATION_ASSISTANCE", degraded),
      scenarioReadinessWorker("EVIDENCE_PRESERVATION", false),
      scenarioReadinessWorker("EVIDENCE_SCAN", false),
      scenarioReadinessWorker("DOMAIN_EVENT_OUTBOX", false),
    ],
  };
}

function scenarioReadinessWorker(
  kind:
    | "DOMAIN_EVENT_OUTBOX"
    | "EVIDENCE_PRESERVATION"
    | "EVIDENCE_SCAN"
    | "MODERATION_ASSISTANCE",
  degraded: boolean,
) {
  return {
    deadJobs: degraded ? 1 : 0,
    enabled: true,
    failedJobs: degraded ? 3 : 0,
    heartbeatAt: degraded ? null : "2026-08-01T09:29:30.000Z",
    kind,
    oldestPendingAt: degraded ? "2026-07-31T23:00:00.000Z" : null,
    paused: degraded,
    queueDepth: degraded ? 7 : 0,
    state: degraded ? "PAUSED" : "HEALTHY",
  };
}

function scenarioModerationConfigurationTemplate() {
  return {
    assessmentModel: "unconfigured",
    authorityRules: { rules: [] },
    failurePolicy: {
      invalidOutput: "ESCALATE",
      maxRetries: 2,
      preservationFailure: "ESCALATE",
      providerUnavailable: "RETRY_THEN_ESCALATE",
    },
    moderationModel: "omni-moderation-latest",
    moderationThresholds: { categoryScores: {} },
    policyVersion: "unconfigured",
    promptVersion: "unconfigured",
    rolloutMode: "SHADOW",
    schemaVersion: "unconfigured",
    thresholdVersion: "unconfigured",
    workerSettings: {
      assessmentTimeoutMs: 30_000,
      heartbeatIntervalMs: 30_000,
      pollIntervalMs: 5_000,
    },
  };
}

function projectPersonalityAssessmentState(viewer: CurrentUser | null) {
  const hasAssessment = Boolean(
    viewer?.personalitySetupComplete && viewer.personalityType,
  );
  const assessment =
    hasAssessment && viewer?.personalityType
      ? {
          assessmentId: "scenario-assessment-current",
          compatibilityEligible: true,
          completedAt: "2026-06-18T14:30:00.000Z",
          displayVersion: "scenario-display-v1",
          formVersion: "IPIP_50_V1",
          instrumentVersion: "ipip-v1",
          lifecycle: "CURRENT" as const,
          measurement: {
            mode: "FIXED" as const,
            questionCount: 50,
            stopReason: "FIXED_LENGTH" as const,
            uncertainty: null,
          },
          ocean: {
            agreeableness: viewer.oceanA ?? 50,
            conscientiousness: viewer.oceanC ?? 50,
            extraversion: viewer.oceanE ?? 50,
            neuroticism: viewer.oceanN ?? 50,
            openness: viewer.oceanO ?? 50,
          },
          personalityType: viewer.personalityType,
          provenance: "ASSESSMENT_DERIVED" as const,
          quality: "COMPLETE" as const,
          scoringVersion: "scenario-scoring-v1",
          source: "ONBOARDING" as const,
        }
      : null;
  const disclosure = {
    assessmentDisplayVersion: "scenario-display-v1",
    authorizedAudiences: ["AUTHENTICATED_USERS", "GROUP_MATCHING"],
    compatibilitySchemaVersion: "scenario-compatibility-v1",
    methodologyVersion: "scenario-methodology-v1",
    policyVersion: "scenario-personality-policy-v1",
    publicFields: ["personalityType", "ocean"],
    purposeVersion: "scenario-group-formation-v1",
  };
  const publicProfile = assessment
    ? {
        assessmentId: assessment.assessmentId,
        displayVersion: assessment.displayVersion,
        instrumentVersion: assessment.instrumentVersion,
        ocean: assessment.ocean,
        personalityType: assessment.personalityType,
        scoringVersion: assessment.scoringVersion,
      }
    : null;

  return personalityAssessmentStateSchema.parse({
    assessmentGeneration: assessment ? 1 : 0,
    current: assessment,
    disclosure,
    draft: null,
    publicProfile,
    publication: {
      decision: assessment ? "GRANTED" : null,
      sequence: assessment ? 1 : 0,
    },
  });
}

function toScenarioInviteUser(user: CurrentUser) {
  return {
    avatar: user.avatar,
    id: user.id,
    name: user.name,
    personalityType: user.personalityType ?? null,
    trustScore: user.trustScore ?? undefined,
  };
}

function getReferringOrigin(request: Request, fallback: string) {
  const referer = request.headers.get("referer");
  if (!referer) return fallback;
  try {
    return new URL(referer).origin;
  } catch {
    return fallback;
  }
}

function projectPersonalityAssessmentCapabilities() {
  return personalityAssessmentCapabilitiesSchema.parse({
    availableFixedForms: ["IPIP_30_V1", "IPIP_50_V1"],
    dynamic: {
      compatibilityUse: "DISABLED_PENDING_LINK",
      displayUse: "ENABLED",
      manifestHash: "scenario-dynamic-manifest-v1",
      maximumPages: 10,
      maximumQuestions: 50,
      minimumPages: 6,
      minimumQuestions: 30,
      onboardingUse: "ENABLED",
      packageId: "scenario-dynamic-package-v1",
      pageSize: 5,
      policyVersion: "scenario-dynamic-policy-v1",
      publicationUse: "ENABLED",
      resumePolicy: "NOT_SUPPORTED_V1",
      startPolicy: "AVAILABLE",
    },
    retiredForms: ["IPIP_150_V1"],
  });
}

function projectOnboardingProductState(
  viewer: CurrentUser,
  scenarioId: string,
  intentStepComplete = true,
) {
  const introductoryEnabled = isIntroductoryScenario(scenarioId);
  const educationEnabled = introductoryEnabled;
  const intent =
    viewer.onboardingIntent ??
    (scenarioId.includes("intent-create")
      ? "BRING_A_PLAN"
      : scenarioId.includes("intent-explore")
        ? "EXPLORE_AND_JOIN"
        : null);
  const basicsComplete = Boolean(
    viewer.age !== null && viewer.gender && viewer.city?.trim(),
  );
  const interestsComplete = (viewer.interests?.length ?? 0) >= 10;
  const fullAssessmentAccepted = Boolean(
    viewer.personalitySetupComplete &&
      viewer.personalityType &&
      viewer.oceanO !== null &&
      viewer.oceanC !== null &&
      viewer.oceanE !== null &&
      viewer.oceanA !== null &&
      viewer.oceanN !== null,
  );
  const matchingReady =
    basicsComplete && interestsComplete && fullAssessmentAccepted;
  const safeDefaultDestination = !basicsComplete
    ? "ONBOARDING_PROFILE"
    : !intentStepComplete
      ? "ONBOARDING_INTENT"
      : !interestsComplete
        ? "ONBOARDING_INTERESTS"
        : !matchingReady
          ? introductoryEnabled
            ? "EXPLORE"
            : "ONBOARDING_PERSONALITY"
          : "HOME";
  const deniedReason = !basicsComplete
    ? "PROFILE_BASICS_REQUIRED"
    : !interestsComplete
      ? "INTERESTS_REQUIRED"
      : "FULL_ASSESSMENT_REQUIRED";
  const matchingDecision = matchingReady
    ? { allowed: true as const, policyVersion: "onboarding-authorization-v1" }
    : {
        allowed: false as const,
        policyVersion: "onboarding-authorization-v1",
        reasonCode: deniedReason,
      };
  const capabilities = Object.fromEntries(
    productCapabilityValues.map((capability) => [
      capability,
      capability === "EDIT_OWN_PROFILE"
        ? {
            allowed: true as const,
            policyVersion: "onboarding-authorization-v1",
          }
        : capability === "BROWSE_PUBLIC_CONTENT" ||
            capability === "VIEW_PUBLIC_GROUP_PLAN" ||
            capability === "VIEW_PUBLIC_PROFILE"
          ? interestsComplete
            ? {
                allowed: true as const,
                policyVersion: "onboarding-authorization-v1",
              }
            : {
                allowed: false as const,
                policyVersion: "onboarding-authorization-v1",
                reasonCode: "INTERESTS_REQUIRED" as const,
              }
          : capability === "USE_ONBOARDING_PRACTICE"
            ? educationEnabled
              ? {
                  allowed: true as const,
                  policyVersion: "onboarding-authorization-v1",
                }
              : {
                  allowed: false as const,
                  policyVersion: "onboarding-authorization-v1",
                  reasonCode: "FEATURE_NOT_AVAILABLE" as const,
                }
            : capability === "START_INTRODUCTORY_GROUP_FORMATION" &&
                introductoryEnabled &&
                basicsComplete &&
                interestsComplete &&
                !matchingReady
              ? {
                  allowed: true as const,
                  policyVersion: "onboarding-authorization-v1",
                }
              : matchingDecision,
    ]),
  );

  return onboardingProductStateSchema.parse({
    authorizationPolicyVersion: "onboarding-authorization-v1",
    clientPolicy: {
      category: "COMPATIBLE",
      declaredVersion: "onboarding-authorization-v1",
      treatmentEligible: true,
    },
    capabilities,
    milestones: {
      activeFullAttempt: false,
      basicsComplete,
      intentStepComplete,
      compatibilityCurrent: matchingReady,
      fullAssessmentAccepted,
      interestsComplete,
      reviewableAssessmentResult: false,
      starterAnswersRetained: false,
      starterSatisfied: introductoryEnabled || fullAssessmentAccepted,
      introductoryGroupFormationAvailable:
        introductoryEnabled &&
        basicsComplete &&
        interestsComplete &&
        !matchingReady,
      introductoryGroupFormationUsed: false,
    },
    minimumCompatibleClientPolicyVersion: "onboarding-authorization-v1",
    policyVersion: "onboarding-product-state-v1",
    recommendedAction: {
      code: !basicsComplete
        ? "COMPLETE_BASICS"
        : !intentStepComplete
          ? "CHOOSE_INTENT"
          : !interestsComplete
            ? "CHOOSE_INTERESTS"
            : !matchingReady
              ? "COMPLETE_FULL_ASSESSMENT"
              : "NONE",
      routeCode: safeDefaultDestination,
    },
    presentation:
      intent === "BRING_A_PLAN"
        ? {
            intent,
            firstMission: "CREATE_INTRODUCTORY_PLAN",
            destination: "START_PLAN",
            coachmarkOrder: ["START_PLAN", "EXPLORE", "ACTIVITY"],
          }
        : intent === "EXPLORE_AND_JOIN"
          ? {
              intent,
              firstMission: "EXPLORE_RECOMMENDATIONS",
              destination: "EXPLORE",
              coachmarkOrder: ["EXPLORE", "ACTIVITY", "START_PLAN"],
            }
          : {
              intent: null,
              firstMission: "EXPLORE_WITH_START_PLAN_OPTION",
              destination: "EXPLORE",
              coachmarkOrder: ["EXPLORE", "START_PLAN", "ACTIVITY"],
            },
    requirements: {
      fullFormVersion: "IPIP_30_V1",
      minimumInterestCategoryCount: 2,
      minimumInterestCount: 10,
    },
    rollout: {
      education: educationEnabled ? "education-v1" : "education-v1:disabled",
      introductoryAccess: introductoryEnabled
        ? "introductory-access-v1"
        : "introductory-access-v1:disabled",
      recovery: "recovery-v1:disabled",
      starter: "starter-v1:disabled",
      stitchedScoring: "stitched-scoring-v1:disabled",
    },
    safeDefaultDestination,
    stage: matchingReady
      ? "MATCHING_READY"
      : introductoryEnabled
        ? "INTRODUCTORY"
        : "SETUP",
  });
}
