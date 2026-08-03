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
import { getProjectedPresenceText } from "@/shared/lib/presence-formatters";
import { buildProfileNavigation } from "@/shared/navigation/profile-navigation";

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

type ConversationParticipant = ReturnType<typeof getOtherChatParticipant>;
type DirectConversationParticipant = NonNullable<ConversationParticipant>;

interface ConversationHeaderProps {
  avatarUrl: string | null;
  detailsNavigation?: ConversationDetailsNavigation;
  onlineStatus?: DirectConversationParticipant["onlineStatus"];
  subtitle?: string;
  title: string;
}

interface ConversationViewState {
  chat: DirectChat | null;
  group: Group | null;
  isGroup: boolean;
  kind: UseConversationDataProps["kind"];
  participant: ConversationParticipant | null;
}

/**
 * useConversationData - Derives header props and active typing state based on conversation type.
 */
export function useConversationData(props: UseConversationDataProps) {
  const { isTyping, typingUsers = [] } = props;
  const conversation = getConversationViewState(props);
  const headerProps = getConversationHeaderProps({
    chat: conversation.chat,
    group: conversation.group,
    isGroup: conversation.isGroup,
    participant: conversation.participant,
  });
  const activeTypingUsers = getActiveTypingUsers({
    kind: conversation.kind,
    isTyping,
    participant: conversation.participant,
    typingUsers,
  });
  const typingText = formatTypingText(activeTypingUsers, conversation.isGroup);

  return {
    isGroup: conversation.isGroup,
    group: conversation.group,
    chat: conversation.chat,
    headerProps,
    activeTypingUsers,
    typingText,
    isCompleted: isCompletedGroup(conversation.group),
  };
}

function getConversationViewState(
  props: UseConversationDataProps,
): ConversationViewState {
  if (props.kind === "group") {
    return {
      chat: null,
      group: props.data,
      isGroup: true,
      kind: props.kind,
      participant: null,
    };
  }

  return {
    chat: props.data,
    group: null,
    isGroup: false,
    kind: props.kind,
    participant: getOtherChatParticipant(props.data),
  };
}

function isCompletedGroup(group: Group | null) {
  return group?.plan?.status === "COMPLETED";
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
}: ConversationHeaderPropsInput): ConversationHeaderProps {
  if (isGroupConversationHeader(isGroup, group)) {
    return getGroupHeaderProps(group);
  }

  if (isNotesHeader(chat)) {
    return getNotesHeaderProps();
  }

  if (isDirectHeader(chat, participant)) {
    return getDirectHeaderProps(participant);
  }

  return { title: "", avatarUrl: "" };
}

function isGroupConversationHeader(
  isGroup: boolean,
  group: Group | null,
): group is Group {
  return isGroup && group !== null;
}

function isNotesHeader(chat: DirectChat | null) {
  return chat?.type === "NOTES";
}

function isDirectHeader(
  chat: DirectChat | null,
  participant: ReturnType<typeof getOtherChatParticipant> | null,
): participant is NonNullable<ReturnType<typeof getOtherChatParticipant>> {
  return chat !== null && participant !== null;
}

function getGroupHeaderProps(group: Group) {
  return {
    title: group.name,
    subtitle: getGroupPresenceText(group),
    avatarUrl: getGroupAvatarUrl(group),
  };
}

function getNotesHeaderProps() {
  return {
    title: MY_NOTES_TITLE,
    subtitle: MY_NOTES_SUBTITLE,
    avatarUrl: MY_NOTES_AVATAR_URL,
  };
}

function getDirectHeaderProps(
  participant: DirectConversationParticipant,
): ConversationHeaderProps {
  return {
    title: participant.name,
    subtitle: getDirectPresenceText(participant),
    avatarUrl: participant.avatar,
    onlineStatus: participant.onlineStatus,
    detailsNavigation: buildProfileNavigation(participant.id),
  };
}

function getDirectPresenceText(participant: DirectConversationParticipant) {
  return (
    getProjectedPresenceText(participant.presenceLabel) ??
    getStatusText(
      participant.onlineStatus || "OFFLINE",
      participant.lastSeenAt ?? undefined,
    )
  );
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
  isTyping?: boolean;
  kind: UseConversationDataProps["kind"];
  participant: ConversationParticipant | null;
  typingUsers: { name: string; avatar: string | null }[];
}

function getActiveTypingUsers({
  isTyping,
  kind,
  participant,
  typingUsers,
}: ActiveTypingUsersInput) {
  if (kind === "group") return typingUsers;

  return getDirectActiveTypingUsers(isTyping, participant);
}

function getDirectActiveTypingUsers(
  isTyping: boolean | undefined,
  participant: ConversationParticipant | null,
) {
  if (isTyping && participant) {
    return [{ name: participant.name, avatar: participant.avatar ?? null }];
  }

  return [];
}
