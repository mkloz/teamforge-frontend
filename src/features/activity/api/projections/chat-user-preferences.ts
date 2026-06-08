import type { ChatApi } from "@/shared/schemas";

type ChatParticipantPreference = NonNullable<ChatApi["participants"]>[number];

export type ChatPreferenceSummary = Partial<
  Pick<ChatApi, "isMuted" | "participants">
>;

export function getChatIsMutedForUser(
  chat: ChatPreferenceSummary | null | undefined,
  userId: string | null,
) {
  const participantMuted = userId
    ? chat?.participants?.find(
        (participant: ChatParticipantPreference) =>
          participant.userId === userId,
      )?.isMuted
    : undefined;

  return participantMuted ?? chat?.isMuted ?? false;
}
