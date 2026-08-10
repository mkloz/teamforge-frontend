export const ONBOARDING_PRACTICE_VERSION = "education-v1" as const;

export const onboardingPracticeTaskIds = [
  "navigation",
  "group-and-plan",
  "ways-to-join",
  "plan-changes",
  "privacy-and-safety",
] as const;

export type OnboardingPracticeTaskId =
  (typeof onboardingPracticeTaskIds)[number];

export interface OnboardingPracticeChoice {
  detail: string;
  id: string;
  label: string;
}

export interface OnboardingPracticeTask {
  choices: readonly OnboardingPracticeChoice[];
  correctChoiceId: string;
  eyebrow: string;
  id: OnboardingPracticeTaskId;
  prompt: string;
  success: string;
  title: string;
}

function immutableTask(task: OnboardingPracticeTask) {
  return Object.freeze({
    ...task,
    choices: Object.freeze(
      task.choices.map((choice) => Object.freeze({ ...choice })),
    ),
  });
}

export const ONBOARDING_PRACTICE_TASKS = Object.freeze([
  immutableTask({
    id: "navigation",
    eyebrow: "Find something new",
    title: "Start in the right place",
    prompt: "Where would you look for something to join this weekend?",
    choices: [
      {
        id: "activity",
        label: "Activity",
        detail: "Your conversations, invitations and group updates.",
      },
      {
        id: "explore",
        label: "Explore",
        detail: "Open plans and groups you can discover.",
      },
      {
        id: "profile",
        label: "Profile",
        detail: "What other people can learn about you.",
      },
    ],
    correctChoiceId: "explore",
    success: "Explore finds new plans. Activity holds things involving you.",
  }),
  immutableTask({
    id: "group-and-plan",
    eyebrow: "Keep your group",
    title: "Plans and groups are separate",
    prompt: "You cannot make one museum visit. What changes?",
    choices: [
      {
        id: "group",
        label: "The whole group",
        detail: "Leaving one plan would remove your membership.",
      },
      {
        id: "plan",
        label: "That plan only",
        detail: "Group membership and plan attendance stay separate.",
      },
    ],
    correctChoiceId: "plan",
    success: "Right. Skip one plan and stay in the group.",
  }),
  immutableTask({
    id: "ways-to-join",
    eyebrow: "Bring an idea",
    title: "Choose the route that fits",
    prompt: "You have an idea and want Findafew to assemble the group.",
    choices: [
      {
        id: "invite",
        label: "Direct invitation",
        detail: "Ask a specific person you already know.",
      },
      {
        id: "open-plan",
        label: "Open plan",
        detail: "Request a place in something already planned.",
      },
      {
        id: "planCreation",
        label: "Start a plan",
        detail: "Start with an activity and let Findafew form the group.",
      },
    ],
    correctChoiceId: "planCreation",
    success:
      "Start with the activity and practical details, then see who is interested.",
  }),
  immutableTask({
    id: "plan-changes",
    eyebrow: "Notice a change",
    title: "A new date needs a new answer",
    prompt: "The organiser changes the date after you said yes.",
    choices: [
      {
        id: "keep-going",
        label: "Keep my old answer",
        detail: "Assume the new time still works.",
      },
      {
        id: "reconfirm",
        label: "Ask me again",
        detail: "Show the change and request a new attendance choice.",
      },
    ],
    correctChoiceId: "reconfirm",
    success: "Correct. Findafew asks again instead of assuming.",
  }),
  immutableTask({
    id: "privacy-and-safety",
    eyebrow: "Share safely",
    title: "Preview without exposing the group",
    prompt: "Someone opens an invitation link before signing in.",
    choices: [
      {
        id: "everything",
        label: "The full group workspace",
        detail: "Member list, chat history and exact private details.",
      },
      {
        id: "limited",
        label: "A limited plan preview",
        detail: "Enough context to decide, plus hide and report controls.",
      },
    ],
    correctChoiceId: "limited",
    success: "Yes. Guests get enough context, not private group history.",
  }),
] satisfies readonly OnboardingPracticeTask[]);

export function isOnboardingPracticeTaskId(
  value: unknown,
): value is OnboardingPracticeTaskId {
  return (
    typeof value === "string" &&
    onboardingPracticeTaskIds.some((taskId) => taskId === value)
  );
}
