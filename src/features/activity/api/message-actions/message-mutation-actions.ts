import { toggleReaction } from "./message-mutations/reaction-actions";
import {
  forwardMessage,
  toggleSavedMessage,
} from "./message-mutations/saved-forward-actions";
import {
  deleteMessage,
  updateMessage,
} from "./message-mutations/update-delete-actions";

export const ActivityMessageMutationActions = {
  updateMessage,
  deleteMessage,
  toggleReaction,
  toggleSavedMessage,
  forwardMessage,
};
