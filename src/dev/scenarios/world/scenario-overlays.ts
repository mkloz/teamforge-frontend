import type { ScenarioWorld } from "@/dev/scenarios/world/scenario-world";

export function applyScenarioOverlays(
  world: ScenarioWorld,
  overlays: readonly string[],
) {
  const values = new Set(overlays);

  if (values.has("empty")) {
    clearProductCollections(world);
  }
  if (values.has("explore-empty")) {
    world.entities.groups = {};
    world.entities.plans = {};
  }
  if (values.has("activity-empty")) {
    world.entities.chats = {};
    world.entities.groups = {};
    world.entities.messages = {};
    world.entities.plans = {};
  }
  if (values.has("notifications-empty")) {
    world.entities.notifications = {};
  }
  if (values.has("safety-empty")) {
    world.entities.reports = {};
    world.safety.containments = {};
    world.safety.enforcementNotices = {};
  }
  if (values.has("dense")) {
    addDenseCollections(world);
  }
  if (values.has("pagination")) {
    addPaginationCollections(world);
  }
  if (values.has("long-copy")) {
    applyLongCopy(world);
  }
  if (values.has("missing-media")) {
    removeOptionalMedia(world);
  }
  if (values.has("restricted")) {
    for (const group of Object.values(world.entities.groups)) {
      group.access = "BY_REQUEST";
      group.visibility = "INVITE_ONLY";
    }
  }
  if (values.has("online-only")) {
    keepGroups(world, (groupId) => {
      const planId = world.entities.groups[groupId].planIds.at(0);
      return planId
        ? world.entities.plans[planId]?.locationMode === "ONLINE"
        : false;
    });
  }
  if (values.has("unscheduled")) {
    for (const plan of Object.values(world.entities.plans)) {
      plan.dateTime = null;
      plan.scheduleMode = "TO_BE_DECIDED";
    }
  }
  if (values.has("full-groups")) {
    const allUserIds = Object.keys(world.entities.users);
    for (const group of Object.values(world.entities.groups)) {
      group.memberIds = allUserIds.slice(0, group.maxMembers);
      group.maxMembers = group.memberIds.length;
    }
  }
  if (values.has("group-admin") && world.viewerId) {
    for (const group of Object.values(world.entities.groups)) {
      group.memberIds = [
        world.viewerId,
        ...group.memberIds.filter((id) => id !== world.viewerId),
      ];
    }
  }
  if (values.has("plan-guest") && world.viewerId) {
    const group = world.entities.groups["scenario-group-basketball"];
    if (group) {
      group.memberIds = group.memberIds.filter((id) => id !== world.viewerId);
    }
  }
  if (values.has("draft-plan")) {
    for (const plan of Object.values(world.entities.plans)) {
      plan.dateTime = null;
      plan.scheduleMode = "TO_BE_DECIDED";
      plan.status = "DRAFT";
    }
  }
  if (values.has("group-archived")) {
    const group = world.entities.groups["scenario-group-basketball"];
    if (group) {
      group.status = "ARCHIVED";
      group.archivedAt = world.clock;
      group.revision = (group.revision ?? 1) + 1;
      for (const planId of group.planIds) {
        const plan = world.entities.plans[planId];
        if (plan && ["CONFIRMED", "IN_PROGRESS"].includes(plan.status)) {
          plan.status = "COMPLETED";
        }
      }
    }
  }
  if (values.has("stale-commitment") && world.viewerId) {
    const plan = world.entities.plans["scenario-plan-basketball"];
    if (plan) {
      plan.materialRevision = Math.max(2, plan.materialRevision + 1);
      plan.commitments ??= {};
      plan.commitments[world.viewerId] = {
        acknowledgedMaterialRevision: plan.materialRevision - 1,
        response: "GOING",
        rowVersion: 1,
        updatedAt: world.clock,
      };
    }
  }
  if (values.has("seat-waitlisted")) {
    setViewerSeatOffer(world, "WAITING", null);
  }
  if (values.has("seat-offered")) {
    setViewerSeatOffer(
      world,
      "OFFERED",
      new Date(new Date(world.clock).getTime() + 60 * 60_000).toISOString(),
    );
  }
  if (values.has("ownership-pending") && world.viewerId) {
    const group = world.entities.groups["scenario-group-basketball"];
    const recipientId = group?.memberIds.find((id) => id !== world.viewerId);
    if (group && recipientId) {
      world.participation.ownershipTransfers[group.id] = {
        createdAt: world.clock,
        expiresAt: new Date(
          new Date(world.clock).getTime() + 48 * 60 * 60_000,
        ).toISOString(),
        groupId: group.id,
        id: `scenario-ownership-transfer-${group.id}`,
        initiatorId: world.viewerId,
        recipientId,
        respondedAt: null,
        status: "PENDING",
      };
    }
  }
  if (values.has("guest-promotion-pending") && world.viewerId) {
    setGuestPromotionProposal(world);
  }
  if (values.has("presence-hidden")) {
    world.settings.presencePrecision = "HIDDEN";
    world.settings.presenceFriendsVisible = false;
    world.settings.presenceGroupsVisible = false;
    world.settings.presencePlanGuestsVisible = false;
  }
  if (values.has("presence-exact")) {
    world.settings.presencePrecision = "EXACT";
    world.settings.presenceFriendsVisible = true;
    world.settings.presenceGroupsVisible = true;
    world.settings.presencePlanGuestsVisible = true;
  }
  if (values.has("theme-light")) {
    world.settings.themeAppearance = "light";
  }
  if (values.has("private-profile")) {
    for (const user of Object.values(world.entities.users)) {
      if (user.id !== world.viewerId) {
        user.age = null;
        user.city = null;
        user.gender = null;
        user.showFriendsListOnProfile = false;
      }
    }
  }
  if (values.has("no-assessment") && world.viewerId) {
    const viewer = world.entities.users[world.viewerId];
    viewer.oceanA = null;
    viewer.oceanC = null;
    viewer.oceanE = null;
    viewer.oceanN = null;
    viewer.oceanO = null;
    viewer.personalitySetupComplete = false;
    viewer.personalityType = null;
  }
}

function setViewerSeatOffer(
  world: ScenarioWorld,
  status: "OFFERED" | "WAITING",
  expiresAt: string | null,
) {
  if (!world.viewerId) return;
  const plan = world.entities.plans["scenario-plan-basketball"];
  const group = plan ? world.entities.groups[plan.groupId] : null;
  if (!plan || !group) return;
  group.memberIds = group.memberIds.filter((id) => id !== world.viewerId);
  world.participation.seatOffers[plan.id] = {
    candidateId: world.viewerId,
    consequenceVersion: "scenario-v1",
    expiresAt,
    id: `scenario-seat-offer-${plan.id}`,
    materialRevision: plan.materialRevision,
    planId: plan.id,
    status,
  };
}

function setGuestPromotionProposal(world: ScenarioWorld) {
  if (!world.viewerId) return;
  const group = world.entities.groups["scenario-group-basketball"];
  const planId = group?.planIds.at(0);
  const guest = group
    ? Object.values(world.entities.users).find(
        ({ id }) => !group.memberIds.includes(id),
      )
    : null;
  if (!group || !planId || !guest) return;
  world.participation.guestMembershipProposals[group.id] = [
    {
      approvalCount: 1,
      expiresAt: new Date(
        new Date(world.clock).getTime() + 72 * 60 * 60_000,
      ).toISOString(),
      groupId: group.id,
      guest: {
        avatar: guest.avatar,
        id: `scenario-plan-guest-${guest.id}`,
        name: guest.name,
        planId,
        userId: guest.id,
      },
      guestAcceptedAt: world.clock,
      id: `scenario-membership-proposal-${group.id}`,
      proposerId: world.viewerId,
      rejectionCount: 0,
      requiredApprovals: group.memberIds.length,
      resolvedAt: null,
      status: "PENDING_VOTE",
      viewerVote: "APPROVE",
    },
  ];
}

function clearProductCollections(world: ScenarioWorld) {
  world.entities.activities = {};
  world.entities.chats = {};
  world.entities.friendships = {};
  world.entities.groups = {};
  world.entities.invitations = {};
  world.entities.messages = {};
  world.entities.notifications = {};
  world.entities.plans = {};
  world.entities.reports = {};
}

function addDenseCollections(world: ScenarioWorld) {
  const notifications = Object.values(world.entities.notifications);
  for (let index = notifications.length; index < 24; index += 1) {
    const source = notifications[index % Math.max(notifications.length, 1)];
    if (!source) {
      break;
    }
    const id = `scenario-notification-dense-${index + 1}`;
    world.entities.notifications[id] = {
      ...source,
      createdAt: `2026-07-${String(30 - (index % 8)).padStart(2, "0")}T10:00:00.000Z`,
      id,
      isRead: index % 3 === 0,
      title: `${source.title} ${index + 1}`,
      updatedAt: world.clock,
      version: Date.parse(world.clock) + index,
    };
  }

  const sourceGroup = Object.values(world.entities.groups)[0];
  const sourcePlan = sourceGroup?.planIds.at(0)
    ? world.entities.plans[sourceGroup.planIds[0]]
    : null;
  if (!sourceGroup || !sourcePlan) {
    return;
  }

  for (let index = 1; index <= 6; index += 1) {
    const groupId = `scenario-group-dense-${index}`;
    const planId = `scenario-plan-dense-${index}`;
    world.entities.groups[groupId] = {
      ...structuredClone(sourceGroup),
      id: groupId,
      name: `Scenario group ${index}`,
      pendingInvitationIds: [],
      planIds: [planId],
    };
    world.entities.plans[planId] = {
      ...structuredClone(sourcePlan),
      groupId,
      id: planId,
      title: `Scenario plan ${index}`,
    };
  }
}

function addPaginationCollections(world: ScenarioWorld) {
  const sourceGroup = Object.values(world.entities.groups)[0];
  const sourcePlan = sourceGroup?.planIds.at(0)
    ? world.entities.plans[sourceGroup.planIds[0]]
    : null;
  if (!sourceGroup || !sourcePlan) {
    return;
  }

  for (let index = 1; index <= 24; index += 1) {
    const groupId = `scenario-group-page-${index}`;
    const planId = `scenario-plan-page-${index}`;
    world.entities.groups[groupId] = {
      ...structuredClone(sourceGroup),
      id: groupId,
      name: `Pagination group ${index}`,
      pendingInvitationIds: [],
      planIds: [planId],
    };
    world.entities.plans[planId] = {
      ...structuredClone(sourcePlan),
      groupId,
      id: planId,
      title: `Pagination plan ${index}`,
    };
  }
}

function applyLongCopy(world: ScenarioWorld) {
  for (const user of Object.values(world.entities.users)) {
    user.bio =
      "A thoughtful organiser who prefers clear expectations, accessible meeting points, and enough flexibility for every member to contribute without feeling rushed.";
  }
  for (const group of Object.values(world.entities.groups)) {
    group.description =
      "A deliberately long group description that tests wrapping, truncation, responsive spacing, and action alignment across narrow mobile screens and wide desktop layouts.";
    group.name = `${group.name} with an unusually descriptive community name`;
  }
  for (const plan of Object.values(world.entities.plans)) {
    plan.description =
      "Bring one question, one useful example, and enough time for everyone to contribute before the group decides what should happen next.";
    plan.title = `${plan.title}: a deliberately longer plan title`;
  }
  for (const notification of Object.values(world.entities.notifications)) {
    notification.title = `${notification.title}: a deliberately longer notification title`;
    notification.message =
      "This deliberately longer notification description verifies two-line titles, readable metadata, and balanced action alignment inside narrow drawers.";
  }
}

function removeOptionalMedia(world: ScenarioWorld) {
  for (const user of Object.values(world.entities.users)) {
    user.avatar = null;
  }
  for (const group of Object.values(world.entities.groups)) {
    group.avatar = null;
  }
  for (const plan of Object.values(world.entities.plans)) {
    plan.coverImage = null;
  }
  for (const notification of Object.values(world.entities.notifications)) {
    notification.avatarUrl = null;
  }
}

function keepGroups(
  world: ScenarioWorld,
  predicate: (groupId: string) => boolean,
) {
  for (const groupId of Object.keys(world.entities.groups)) {
    if (predicate(groupId)) {
      continue;
    }
    for (const planId of world.entities.groups[groupId].planIds) {
      delete world.entities.plans[planId];
    }
    delete world.entities.groups[groupId];
  }
}
