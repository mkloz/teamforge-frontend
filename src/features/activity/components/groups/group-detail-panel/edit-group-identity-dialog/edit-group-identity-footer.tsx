import { Save, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

import type { GroupIdentityEditor } from "./edit-group-identity-dialog.types";

interface EditGroupIdentityFooterProps {
  editor: GroupIdentityEditor;
  isSaveDisabled?: boolean;
  onCancel: () => void;
  saveLabel?: string;
}

export function EditGroupIdentityFooter({
  editor,
  isSaveDisabled,
  onCancel,
  saveLabel = "Save",
}: EditGroupIdentityFooterProps) {
  const saveDisabled = isSaveDisabled ?? !editor.canSave;

  return (
    <>
      <Button type="button" variant="outline" onClick={onCancel}>
        <X className="size-4" aria-hidden="true" />
        Cancel
      </Button>
      <Button
        type="button"
        variant="primary"
        disabled={saveDisabled}
        title={editor.isOnline ? undefined : "Reconnect before saving changes."}
        onClick={() => editor.save()}
      >
        <Save className="size-4" aria-hidden="true" />
        {editor.isSaving
          ? "Saving..."
          : editor.isOnline
            ? saveLabel
            : "Reconnect to save"}
      </Button>
    </>
  );
}
