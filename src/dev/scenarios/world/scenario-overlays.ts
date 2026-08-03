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
