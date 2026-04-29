import type {
  Gender,
  OnlineStatus,
  PersonalityType,
} from "@/shared/schemas/enums";

export interface UserProfilePanelParticipant {
  id: string;
  name: string;
  avatar: string | null;
  bio?: string | null;
  age?: number | null;
  gender?: Gender | null;
  city?: string | null;
  personalityType?: PersonalityType | null;
  oceanO?: number | null;
  oceanC?: number | null;
  oceanE?: number | null;
  oceanA?: number | null;
  oceanN?: number | null;
  onlineStatus?: OnlineStatus;
  trustScore: number;
}

export interface UserProfilePanelChatParticipant {
  userId: string;
  chatId: string;
  user?: UserProfilePanelParticipant;
}

export interface UserProfilePanelMutualGroup {
  id: string;
  name: string;
  avatar: string | null;
}

export interface UserProfilePanelChat {
  participants?: UserProfilePanelChatParticipant[];
  mutualGroups?: UserProfilePanelMutualGroup[];
  isMuted?: boolean;
  isBlocked?: boolean;
}
