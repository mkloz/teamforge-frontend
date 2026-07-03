import { Trash2 } from "lucide-react";
import { isMessageActionItem } from "./action-candidate";
import type {
  DangerMessageActionsInput,
  MessageActionCandidate,
} from "./types";

export function getDangerMessageActions({
  canDelete,
  setDeleteDialogOpen,
}: DangerMessageActionsInput) {
  return [getDeleteMessageAction({ canDelete, setDeleteDialogOpen })].filter(
    isMessageActionItem,
  );
}

function getDeleteMessageAction({
  canDelete,
  setDeleteDialogOpen,
}: DangerMessageActionsInput): MessageActionCandidate {
  if (!canDelete) {
    return null;
  }

  return {
    icon: Trash2,
    id: "delete",
    label: "Delete",
    onSelect: () => setDeleteDialogOpen(true),
    tone: "danger",
  };
}
