import {
  buildDirectFeedItem,
  buildNotesFeedItem,
  mapDirectChat,
  mapNotesChat,
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
import {
  buildGroupParticipants,
  buildParticipantsFromChatSummary,
  mapCurrentUserParticipant,
} from "./projections/activity-participant-projections";

export const ActivityProjections = {
  buildDirectFeedItem,
  buildGroupFeedItem,
  buildGroupParticipants,
  buildNotesFeedItem,
  buildParticipantsFromChatSummary,
  buildProposalMessage,
  deriveFeedData,
  findGroupChat,
  mapApiGroupFromSelection,
  mapCurrentUserParticipant,
  mapDirectChat,
  mapGroup,
  mapMessages,
  mapNotesChat,
  mapSingleMessage,
  mergeConversationTimeline,
};
