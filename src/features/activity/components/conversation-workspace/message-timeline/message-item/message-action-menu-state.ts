import { getDangerMessageActions } from "./message-action-menu-state/danger-actions";
import { getMessageActionAvailability } from "./message-action-menu-state/message-action-availability";
import { getPrimaryMessageActions } from "./message-action-menu-state/primary-actions";
import type { GetMessageActionMenuStateInput } from "./message-action-menu-state/types";

export type { MessageActionItem } from "./message-action-menu-state/types";

export function getMessageActionMenuState(
  input: GetMessageActionMenuStateInput,
) {
  const availability = getMessageActionAvailability(input);

  return {
    canReact: availability.canReact,
    dangerActions: getDangerMessageActions({
      canDelete: availability.canDelete,
      setDeleteDialogOpen: input.setDeleteDialogOpen,
    }),
    primaryActions: getPrimaryMessageActions({
      ...input,
      ...availability,
    }),
  };
}
