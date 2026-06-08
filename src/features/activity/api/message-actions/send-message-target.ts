import type { ActivityActionContext } from "@/features/activity/api/activity-action-context";
import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";
import type { User } from "@/shared/schemas";

type ActivityMessageTargetKind = "group" | "dm";

export interface OutgoingMessageTarget {
  chatId: string;
  currentUser: User;
  currentUserParticipant: ActivityParticipant;
  participants: ActivityParticipant[];
}

interface ResolveOutgoingMessageTargetInput {
  context: ActivityActionContext;
  kind: ActivityMessageTargetKind | null;
  selectedId: string | null;
}

export async function resolveNewMessageTarget({
  context,
  kind,
  selectedId,
}: ResolveOutgoingMessageTargetInput): Promise<OutgoingMessageTarget | null> {
  if (!kind || !selectedId) {
    return null;
  }

  const chatId = await context.resolveChatId(kind, selectedId);

  if (!chatId) {
    return null;
  }

  return resolveMessageTargetBase({
    chatId,
    context,
    kind,
    selectedId,
  });
}

export async function resolveRetryMessageTarget({
  context,
  kind,
  selectedId,
  chatId,
}: ResolveOutgoingMessageTargetInput & {
  chatId: string;
}): Promise<OutgoingMessageTarget | null> {
  if (!kind || !selectedId) {
    return null;
  }

  return resolveMessageTargetBase({
    chatId,
    context,
    kind,
    selectedId,
  });
}

async function resolveMessageTargetBase({
  chatId,
  context,
  kind,
  selectedId,
}: ResolveOutgoingMessageTargetInput & {
  chatId: string;
  kind: ActivityMessageTargetKind;
  selectedId: string;
}): Promise<OutgoingMessageTarget> {
  const { currentUser, currentUserParticipant } =
    await context.ensureBaseData();
  const participants = await context.resolveParticipants(
    kind,
    selectedId,
    currentUserParticipant,
  );

  return {
    chatId,
    currentUser,
    currentUserParticipant,
    participants,
  };
}
