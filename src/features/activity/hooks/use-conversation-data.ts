import type {
  DirectChat,
  Group,
} from "@/features/activity/lib/activity-contract";
import { getOtherChatParticipant } from "@/features/activity/lib/activity-projections";
import {
  formatTypingText,
  getStatusText,
} from "@/features/activity/lib/chat-utils";
import { getGroupAvatarUrl } from "@/features/activity/lib/group-identity";
import {
  MY_NOTES_AVATAR_URL,
  MY_NOTES_SUBTITLE,
  MY_NOTES_TITLE,
} from "@/features/activity/lib/my-notes-identity";
import { buildProfileNavigation } from "@/features/profile/lib/profile-route";

export type ConversationDetailsNavigation = ReturnType<
  typeof buildProfileNavigation
>;

interface BaseProps {
  isTyping?: boolean;
  typingUsers?: { name: string; avatar: string | null }[];
}

export type UseConversationDataProps =
  | (BaseProps & { kind: "dm"; data: DirectChat })
  | (BaseProps & { kind: "group"; data: Group });

/**
 * useConversationData - Derives header props and active typing state based on conversation type.
 */
export function useConversationData({
  kind,
  data,
  isTyping,
  typingUsers = [],
}: UseConversationDataProps) {
  const isGroup = kind === "group";
  const group = isGroup ? data : null;
  const chat = !isGroup ? data : null;

  const participant = isGroup || !chat ? null : getOtherChatParticipant(chat);

  const headerProps = getConversationHeaderProps({
    chat,
    group,
    isGroup,
    participant,
  });

  const activeTypingUsers = getActiveTypingUsers({
    isGroup,
    isTyping,
    participant,
    typingUsers,
  });
  const typingText = formatTypingText(activeTypingUsers, isGroup);

  return {
    isGroup,
    group,
    chat,
    headerProps,
    activeTypingUsers,
    typingText,
    isCompleted: isGroup && group?.plan?.status === "COMPLETED",
  };
}

interface ConversationHeaderPropsInput {
  chat: DirectChat | null;
  group: Group | null;
  isGroup: boolean;
  participant: ReturnType<typeof getOtherChatParticipant> | null;
}

function getConversationHeaderProps({
  chat,
  group,
  isGroup,
  participant,
}: ConversationHeaderPropsInput) {
  if (isGroup && group) {
    return {
      title: group.name,
      subtitle: getGroupPresenceText(group),
      avatarUrl: getGroupAvatarUrl(group),
    };
  }

  if (chat?.type === "NOTES") {
    return {
      title: MY_NOTES_TITLE,
      subtitle: MY_NOTES_SUBTITLE,
      avatarUrl: MY_NOTES_AVATAR_URL,
    };
  }

  if (chat && participant) {
    return {
      title: participant.name,
      subtitle: getStatusText(
        participant.onlineStatus || "OFFLINE",
        undefined, // lastSeen not in schema yet
      ),
      avatarUrl: participant.avatar,
      onlineStatus: participant.onlineStatus,
      detailsNavigation: buildProfileNavigation(participant.id),
    };
  }

  return { title: "", avatarUrl: "" };
}

function getGroupPresenceText(group: Group) {
  const members = group.members ?? [];
  const memberCount = members.length;
  const onlineCount = members.filter(
    (member) => member.user?.onlineStatus === "ONLINE",
  ).length;
  const memberLabel = `${memberCount} ${memberCount === 1 ? "member" : "members"}`;

  if (onlineCount === 0) {
    return memberLabel;
  }

  return `${onlineCount} online · ${memberLabel}`;
}

interface ActiveTypingUsersInput {
  isGroup: boolean;
  isTyping?: boolean;
  participant: ReturnType<typeof getOtherChatParticipant> | null;
  typingUsers: { name: string; avatar: string | null }[];
}

function getActiveTypingUsers({
  isGroup,
  isTyping,
  participant,
  typingUsers,
}: ActiveTypingUsersInput) {
  if (isGroup) return typingUsers;
  if (isTyping && participant) {
    return [{ name: participant.name, avatar: participant.avatar ?? null }];
  }
  return [];
}
