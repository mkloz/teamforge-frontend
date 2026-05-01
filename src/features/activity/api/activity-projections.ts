import {
  buildGroupParticipants,
  buildParticipantsFromChatSummary,
  mapCurrentUserParticipant,
} from "./projections/activity-participant-projections";
import {
  buildDirectFeedItem,
  mapDirectChat,
} from "./projections/activity-direct-projections";
import { deriveFeedData } from "./projections/activity-feed-projections";
import {
  buildGroupFeedItem,
  findGroupChat,
  mapApiGroupFromSelection,
  mapGroup,
} from "./projections/activity-group-projections";
import {
  buildProposalMessage,
  mapMessages,
  mapSingleMessage,
  mergeConversationTimeline,
} from "./projections/activity-message-projections";

export const ActivityProjections = {
  buildDirectFeedItem,
  buildGroupFeedItem,
  buildGroupParticipants,
  buildParticipantsFromChatSummary,
  buildProposalMessage,
  deriveFeedData,
  findGroupChat,
  mapApiGroupFromSelection,
  mapCurrentUserParticipant,
  mapDirectChat,
  mapGroup,
  mapMessages,
  mapSingleMessage,
  mergeConversationTimeline,
};
