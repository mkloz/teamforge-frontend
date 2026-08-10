import type { ScenarioWorld } from "@/dev/scenarios/world/scenario-world";

export const SCENARIO_GROUP_PROPOSAL_ID = "scenario-group-proposal-current";

export function projectScenarioGroupProposal(world: ScenarioWorld) {
  const viewer = world.viewerId ? world.entities.users[world.viewerId] : null;
  const candidates = Object.values(world.entities.users)
    .filter((user) => user.id !== viewer?.id)
    .slice(0, 2);

  if (!viewer || candidates.length !== 2) {
    return null;
  }

  const members = [viewer, ...candidates];

  return {
    activity: {
      description:
        "Choose a game, bring a snack, and decide the details together.",
      id: "scenario-activity-games",
      interests: [
        { id: "games", name: "Games", slug: "games" },
        { id: "community", name: "Community", slug: "community" },
      ],
      title: "Rules and snacks",
    },
    areaLabel: null,
    cost: "FREE" as const,
    costAmount: null,
    costDetails: null,
    dateTime: null,
    deadlineAt: "2099-08-10T18:30:00.000Z",
    formedResources: null,
    id: SCENARIO_GROUP_PROPOSAL_ID,
    locationMode: "TBD" as const,
    matchingStrategy: "FULL_COMPATIBILITY" as const,
    minimumGroupSize: 3,
    policyVersion: "group-proposal-decision-v1" as const,
    recovery: null,
    requestId: "scenario-automatic-group-formation-request",
    requestedMaximumGroupSize: 4,
    requestedMinimumGroupSize: 3,
    scheduleMode: "TO_BE_DECIDED" as const,
    scope: "ONLINE" as const,
    seats: members.map((member, index) => ({
      compatibilityWithViewer:
        index === 0
          ? null
          : {
              explanationCodes: ["SHARED_INTERESTS", "COMMUNICATION_STYLE"],
              score: index === 1 ? 84 : 78,
            },
      profile: {
        age: member.age,
        avatar: member.avatar,
        city: member.city,
        interests: (member.interests ?? []).slice(0, 4).map((interest) => ({
          id: interest.id,
          name: interest.name,
          slug: interest.slug,
        })),
        name: member.name,
        ocean: {
          agreeableness: member.oceanA,
          conscientiousness: member.oceanC,
          extraversion: member.oceanE,
          neuroticism: member.oceanN,
          openness: member.oceanO,
        },
        personalityType: member.personalityType,
      },
      role: index === 0 ? ("REQUESTER" as const) : ("CANDIDATE" as const),
      seatId: `scenario-proposal-seat-${index + 1}`,
      userId: member.id,
    })),
    selectedGroupSize: 3,
    state: "OPEN" as const,
    targetGroupSize: 3,
    version: 1,
    viewer: {
      decision: "PENDING" as const,
      decisionRevision: 0,
      disposition: "ACTIVE" as const,
      role: "REQUESTER" as const,
      seatId: "scenario-proposal-seat-1",
      userId: viewer.id,
    },
  };
}
