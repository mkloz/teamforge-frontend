import {
  projectActivityChat,
  projectActivityChats,
  projectActivityGroup,
  projectActivityGroups,
  projectExploreFeed,
  projectExploreGroups,
  projectGroupDetail,
  projectHomeGroups,
  projectViewerProfile,
} from "@/dev/scenarios/projectors/scenario-projectors";
import type { ScenarioController } from "@/dev/scenarios/runtime/scenario-controller";
import {
  scenarioJson,
  scenarioPage,
} from "@/dev/scenarios/runtime/scenario-response";
import {
  scenarioInterestLeavesById,
  scenarioInterestTree,
} from "@/dev/scenarios/world/scenario-interest-catalog";
import {
  type CurrentUser,
  chatApiSchema,
  fullUserResponseSchema,
  inviteSchema,
  messageApiSchema,
} from "@/shared/schemas";
import {
  personalityAssessmentCapabilitiesSchema,
  personalityAssessmentStateSchema,
} from "@/shared/schemas/personality-assessment";

const API_VERSION_MARKER = "/api/v1/";

export async function handleScenarioRequest(
  controller: ScenarioController,
  request: Request,
): Promise<Response> {
  const url = new URL(request.url);
  const pathname = getApiPathname(url.pathname);
  const fault = controller.world.faults.find(
    (candidate) =>
      (!candidate.method || candidate.method === request.method) &&
      (!candidate.pathname || candidate.pathname === pathname),
  );

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
    if (!viewer || viewer.role !== "ADMIN") {
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
        managePilotRetention: true,
        manageSponsorArtifacts: true,
        manageWorkers: true,
        revealEvidence: true,
        reverseActions: true,
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
    if (!viewer || viewer.role !== "ADMIN") {
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

  if (pathname === "operator/moderation/cases" && request.method === "GET") {
    const queue = url.searchParams.get("queue") ?? "HUMAN_REQUIRED";
    const data = world.traits.includes("admin-empty")
      ? []
      : [scenarioModerationCase(world.clock)];
    return scenarioJson({
      data,
      limit: Number(url.searchParams.get("limit") ?? 25),
      page: Number(url.searchParams.get("page") ?? 1),
      queue,
      total: data.length,
    });
  }

  if (pathname === "operator/moderation/intake" && request.method === "GET") {
    const data = world.traits.includes("admin-empty")
      ? []
      : [scenarioModerationCase(world.clock)];
    return scenarioJson({
      data,
      limit: Number(url.searchParams.get("limit") ?? 25),
      page: Number(url.searchParams.get("page") ?? 1),
      total: data.length,
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
            caseReference: "TF-SCENARIO-001",
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

  if (pathname === "forge/availability" && request.method === "GET") {
    return scenarioJson({
      availableUntil: null,
      canReceiveLocalProposals: false,
      canReceiveOnlineProposals: false,
      legacyAvailabilityPrompt: false,
      lifecycle: null,
      liveAutomaticGroupCount: 0,
      localEnabled: false,
      onlineEnabled: false,
      policyVersion: "candidate-availability-v1",
      proposalCooldownUntil: null,
      reconfirmedAt: null,
      reservedSeatCount: 0,
      revision: 0,
    });
  }

  if (pathname === "auto-forge-requests/current" && request.method === "GET") {
    return scenarioJson({ request: null });
  }

  if (pathname === "forge-proposals/current" && request.method === "GET") {
    return scenarioJson({ proposal: null });
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
            forgeMode: "MANUAL",
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

  if (pathname === "reports" && request.method === "GET") {
    return scenarioJson(
      scenarioPage(
        Object.values(world.entities.reports),
        Number(url.searchParams.get("limit") ?? 50),
      ),
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

  if (pathname === "safety/containments" && request.method === "GET") {
    return scenarioJson(
      scenarioPage(
        Object.values(world.safety.containments),
        Number(url.searchParams.get("limit") ?? 50),
      ),
    );
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
    return scenarioJson({
      ...scenarioPage(
        projectExploreFeed(world),
        Number(url.searchParams.get("limit") ?? 24),
      ),
      insight: {
        bullets: [
          "Several groups meet near your saved area.",
          "Your strongest overlaps are community, learning, and sport.",
        ],
        summary: "A varied set of groups fits the profile in this scenario.",
      },
    });
  }

  if (pathname === "explore/groups" && request.method === "GET") {
    return scenarioJson({
      ...scenarioPage(
        projectExploreGroups(world),
        Number(url.searchParams.get("limit") ?? 24),
      ),
      insight: {
        bullets: [
          "Several groups meet near your saved area.",
          "Your strongest overlaps are community, learning, and sport.",
        ],
        summary: "A varied set of groups fits the profile in this scenario.",
      },
    });
  }

  const groupDetailMatch = pathname.match(/^groups\/([^/]+)\/detail$/u);
  if (groupDetailMatch && request.method === "GET") {
    const detail = projectGroupDetail(world, groupDetailMatch[1]);
    return detail ? scenarioJson(detail) : notFound(pathname);
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
      "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//TeamForge//Scenario//EN\r\nEND:VCALENDAR\r\n",
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
      commitment.response !== "CANNOT_ATTEND" &&
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
    goingCount,
    materialRevision: plan.materialRevision,
    needsReconfirmationCount: count("NEEDS_RECONFIRMATION"),
    notRespondedCount: Math.max(0, eligibleUserIds.length - commitments.length),
    planId: plan.id,
    unsureCount: count("UNSURE"),
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
    reference: "TF-SCENARIO-001",
    reportCount: 2,
    severity: "P2",
    status: "AWAITING_HUMAN_DECISION",
    uncertainty: "MEDIUM",
    updatedAt: clock,
    version: 1,
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
    coverage: {
      backupOperator: {
        displayName: "Scenario Backup",
        id: "scenario-operator-backup",
      },
      backupOperatorReady: true,
      declarationId: "scenario-coverage-declaration",
      endsAt: "2026-08-01T20:00:00.000Z",
      primaryOperator: {
        displayName: "Quinn Hart",
        id: "scenario-operator-account",
      },
      primaryOperatorReady: true,
      rowVersion: 1,
      scopes: [
        "SAFETY_CASEWORK",
        "APPEALS_AND_REVIEWS",
        "OPERATIONS_INCIDENT_RESPONSE",
      ],
      startsAt: "2026-08-01T08:00:00.000Z",
      status: "ACTIVE",
    },
    eligibleOperators: [
      {
        displayName: "Quinn Hart",
        id: "scenario-operator-account",
        roles: ["OWNER_ADMIN"],
      },
      {
        displayName: "Scenario Backup",
        id: "scenario-operator-backup",
        roles: ["MODERATOR"],
      },
    ],
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
