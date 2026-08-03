import type {
  PlanOperationalState,
  PlanParticipantPlace,
} from "@/shared/schemas/plan-operational-state";

type PresentationTone = "danger" | "neutral" | "success" | "warning";

export type PlanReadinessSummary = {
  accessibilityLabel: string;
  detail: string;
  nextAction: string | null;
  title: string;
  tone: PresentationTone;
};

export function presentPlanReadiness(
  state: PlanOperationalState,
): PlanReadinessSummary {
  return presentPlanReadinessSummary({
    overall: state.overall,
    requiredAction: state.viewer.requiredAction,
  });
}

export function presentPlanReadinessSummary(input: {
  overall: PlanOperationalState["overall"];
  requiredAction: string | null;
}): PlanReadinessSummary {
  const presentations: Record<
    PlanOperationalState["overall"],
    { detail: string; title: string; tone: PresentationTone }
  > = {
    READY: {
      detail: "The essential details are agreed and your response is current.",
      title: "Ready to go",
      tone: "success",
    },
    WAITING: {
      detail: "The group is still agreeing one or more plan details.",
      title: "Still taking shape",
      tone: "neutral",
    },
    ACTION_REQUIRED: {
      detail: describeRequiredAction(input.requiredAction),
      title: "Your response is needed",
      tone: "warning",
    },
    BLOCKED: {
      detail: "This plan cannot move forward in its current state.",
      title: "Plan unavailable",
      tone: "danger",
    },
    COMPLETE: {
      detail: "This plan has finished. Attendance and follow-up are available.",
      title: "Plan complete",
      tone: "success",
    },
  };
  const presentation = presentations[input.overall];

  return {
    ...presentation,
    accessibilityLabel: `${presentation.title}. ${presentation.detail}`,
    nextAction: input.requiredAction,
  };
}

export type PlanParticipantSlotPresentation = {
  accessibilityLabel: string;
  detail: string | null;
  label: string;
  tone: PresentationTone;
};

export function presentPlanParticipantSlot(
  place: PlanParticipantPlace,
): PlanParticipantSlotPresentation {
  const person = place.participantName ?? "Participant details private";
  const presentations: Record<
    PlanParticipantPlace["state"],
    { detail: string | null; label: string; tone: PresentationTone }
  > = {
    OCCUPIED: {
      detail: person,
      label:
        place.participantScope === "GUEST" ? "Plan guest" : "Assigned place",
      tone: "success",
    },
    HELD: {
      detail: place.offerExpiresAt
        ? `Reply by ${formatDateTime(place.offerExpiresAt)}`
        : "Held for a limited time",
      label: "Place held",
      tone: "warning",
    },
    OPEN: {
      detail: "Available for an eligible participant",
      label: "Open place",
      tone: "neutral",
    },
    PENDING_INVITE: {
      detail: "The invite must be accepted before this place is assigned",
      label: "Invitation pending",
      tone: "warning",
    },
    RELEASED: {
      detail: "Available for safe recovery",
      label: "Released place",
      tone: "neutral",
    },
    UNAVAILABLE: {
      detail: null,
      label: "Place unavailable",
      tone: "danger",
    },
    WAITLISTED: {
      detail: "A place will be offered when one becomes available",
      label: "On the waitlist",
      tone: "neutral",
    },
  };
  const presentation = presentations[place.state];

  return {
    ...presentation,
    accessibilityLabel: [presentation.label, presentation.detail]
      .filter(Boolean)
      .join(". "),
  };
}

export type GroupLifecyclePresentation = {
  detail: string;
  label: string;
  tone: PresentationTone;
};

export function presentGroupLifecycle(
  status: string,
): GroupLifecyclePresentation {
  const known = {
    FORMING: [
      "Forming",
      "Members are still deciding whether to form.",
      "warning",
    ],
    PENDING: [
      "Pending",
      "The group is waiting for its next decision.",
      "neutral",
    ],
    ACTIVE: ["Active", "The group has an active plan.", "success"],
    PLANNING: ["Planning", "The group is deciding what to do next.", "neutral"],
    COMPLETED: [
      "Completed",
      "The group has completed its lifecycle.",
      "success",
    ],
    ARCHIVED: [
      "Archived",
      "The group is read-only until it is restored.",
      "neutral",
    ],
    DORMANT: [
      "Dormant",
      "The group is quiet and can be reactivated.",
      "neutral",
    ],
    DISBANDED: ["Disbanded", "This group is no longer available.", "danger"],
  } as const;
  const value = isKnownGroupLifecycleStatus(status, known)
    ? known[status]
    : ([
        "Group status",
        "The latest group state is available.",
        "neutral",
      ] as const);
  return { detail: value[1], label: value[0], tone: value[2] };
}

function isKnownGroupLifecycleStatus<T extends Record<string, unknown>>(
  status: string,
  presentations: T,
): status is Extract<keyof T, string> {
  return Object.hasOwn(presentations, status);
}

export type MatchScorePresentation = {
  accessibilityLabel: string;
  label: string;
  percentage: number;
  supportingText: string;
};

export function presentMatchScore(
  rawScore: number | null | undefined,
  reasons: string[] = [],
): MatchScorePresentation | null {
  if (rawScore === null || rawScore === undefined || Number.isNaN(rawScore)) {
    return null;
  }
  const normalized = rawScore >= 0 && rawScore <= 1 ? rawScore * 100 : rawScore;
  const percentage = Math.round(Math.min(100, Math.max(0, normalized)));
  const supportingText =
    reasons.filter(Boolean).slice(0, 2).join(" · ") ||
    "Based on the compatibility information you chose to share.";
  return {
    accessibilityLabel: `${percentage} percent group fit. ${supportingText}`,
    label: `${percentage}% group fit`,
    percentage,
    supportingText,
  };
}

export type PresencePresentation = {
  accessibilityLabel: string;
  label: string;
  showExactTime: boolean;
  tone: PresentationTone;
};

export function presentPresence(input: {
  canView: boolean;
  isOnline: boolean;
  lastSeenAt?: string | null;
  showExactTime?: boolean;
}): PresencePresentation {
  if (!input.canView) {
    return {
      accessibilityLabel: "Presence hidden by this person",
      label: "Last seen hidden",
      showExactTime: false,
      tone: "neutral",
    };
  }
  if (input.isOnline) {
    return {
      accessibilityLabel: "Online now",
      label: "Online",
      showExactTime: false,
      tone: "success",
    };
  }
  const exact = Boolean(input.showExactTime && input.lastSeenAt);
  return {
    accessibilityLabel: exact
      ? `Last seen ${formatDateTime(input.lastSeenAt ?? "")}`
      : "Not online now",
    label: exact
      ? `Last seen ${formatDateTime(input.lastSeenAt ?? "")}`
      : "Offline",
    showExactTime: exact,
    tone: "neutral",
  };
}

export type MutationOutcomePresentation = {
  action: "REFRESH" | "RETRY" | "RETURN" | null;
  detail: string;
  title: string;
  tone: PresentationTone;
};

export function presentMutationOutcome(
  code?: string | null,
): MutationOutcomePresentation {
  const outcomes: Record<string, MutationOutcomePresentation> = {
    PLAN_MATERIAL_REVISION_STALE: {
      action: "REFRESH",
      detail:
        "The plan changed while you were acting. Review the latest details and try again.",
      title: "Plan updated",
      tone: "warning",
    },
    PLAN_SEAT_MATERIAL_REVISION_CONFLICT: {
      action: "REFRESH",
      detail: "This place was offered using older plan details.",
      title: "Review the latest plan",
      tone: "warning",
    },
    ACTION_EXPIRED: {
      action: "REFRESH",
      detail:
        "The response window has ended and the latest state is being loaded.",
      title: "Action expired",
      tone: "warning",
    },
    ALREADY_COMPLETED: {
      action: null,
      detail: "This action was already completed. Nothing else is needed.",
      title: "Already done",
      tone: "success",
    },
    PERMISSION_LOST: {
      action: "RETURN",
      detail: "Your access changed before the action completed.",
      title: "Access changed",
      tone: "danger",
    },
    CONFLICT: {
      action: "REFRESH",
      detail:
        "Someone else changed this first. The latest plan state is being loaded.",
      title: "Plan state changed",
      tone: "warning",
    },
    INVALID_TRANSITION: {
      action: "REFRESH",
      detail:
        "That action is no longer available. Review the current plan before choosing another action.",
      title: "Action no longer available",
      tone: "warning",
    },
  };
  return (
    outcomes[code ?? ""] ?? {
      action: "RETRY",
      detail: "The change was not saved. Check your connection and try again.",
      title: "Couldn’t save that",
      tone: "danger",
    }
  );
}

export function getMutationOutcomeCode(error: unknown): string | null {
  const cause = readObjectProperty(error, "cause");
  const explicitCode = readStringProperty(cause, "code");
  if (explicitCode) return explicitCode;

  const response = readObjectProperty(error, "response");
  const status = readNumberProperty(response, "status");
  if (status === 403) return "PERMISSION_LOST";
  if (status === 409) return "CONFLICT";
  if (status === 410) return "ACTION_EXPIRED";
  if (status === 422) return "INVALID_TRANSITION";
  return null;
}

function readObjectProperty(
  value: unknown,
  key: string,
): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || !(key in value)) {
    return null;
  }
  const property = Reflect.get(value, key);
  return typeof property === "object" && property !== null
    ? Object.fromEntries(Object.entries(property))
    : null;
}

function readStringProperty(
  value: Record<string, unknown> | null,
  key: string,
) {
  const property = value?.[key];
  return typeof property === "string" ? property : null;
}

function readNumberProperty(
  value: Record<string, unknown> | null,
  key: string,
) {
  const property = value?.[key];
  return typeof property === "number" ? property : null;
}

function describeRequiredAction(action: string | null) {
  if (action === "RESPOND_TO_SEAT_OFFER") {
    return "A plan place is being held for you. Accept or decline it before the deadline.";
  }
  if (action === "RECONFIRM_COMMITMENT") {
    return "The plan changed after your response. Review it and answer again.";
  }
  if (action === "SET_COMMITMENT")
    return "Tell the group whether you can make it.";
  if (action === "SET_SCHEDULE") return "The plan still needs a date and time.";
  if (action === "SET_LOCATION") return "The plan still needs a location.";
  return "Review the latest plan details.";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
