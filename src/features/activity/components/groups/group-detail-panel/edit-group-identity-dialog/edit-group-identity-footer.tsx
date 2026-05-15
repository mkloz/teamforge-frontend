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
        Cancel
      </Button>
      <Button
        type="button"
        variant="primary"
        disabled={saveDisabled}
        onClick={() => editor.save()}
      >
        {editor.isSaving ? "Saving..." : saveLabel}
      </Button>
    </>
  );
}
