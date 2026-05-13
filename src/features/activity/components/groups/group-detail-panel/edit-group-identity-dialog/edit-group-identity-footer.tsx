import { Button } from "@/shared/components/ui/button";

import type { GroupIdentityEditor } from "./edit-group-identity-dialog.types";

interface EditGroupIdentityFooterProps {
  editor: GroupIdentityEditor;
  onCancel: () => void;
}

export function EditGroupIdentityFooter({
  editor,
  onCancel,
}: EditGroupIdentityFooterProps) {
  const isSaveDisabled =
    !editor.isNameValid ||
    !editor.isPlanValid ||
    !editor.hasChanges ||
    editor.isSaving ||
    editor.isAvatarUploading ||
    editor.isCoverUploading;

  return (
    <>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        type="button"
        variant="primary"
        disabled={isSaveDisabled}
        onClick={() => editor.save()}
      >
        {editor.isSaving ? "Saving..." : "Save"}
      </Button>
    </>
  );
}
