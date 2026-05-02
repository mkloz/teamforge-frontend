import { useRef } from "react";

import { useEditGroupIdentity } from "@/features/activity/hooks/use-edit-group-identity";
import type { Group } from "@/features/activity/lib/activity-contract";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

import { EditGroupAvatarSection } from "./edit-group-avatar-section";
import { EditGroupCoverSection } from "./edit-group-cover-section";
import { EditGroupIdentityFields } from "./edit-group-identity-fields";
import { EditGroupIdentityFooter } from "./edit-group-identity-footer";

interface EditGroupIdentityDialogProps {
  group: Group;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditGroupIdentityDialog({
  group,
  open,
  onOpenChange,
}: EditGroupIdentityDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <EditGroupIdentityDialogContent
          group={group}
          onOpenChange={onOpenChange}
        />
      )}
    </Dialog>
  );
}

interface EditGroupIdentityDialogContentProps {
  group: Group;
  onOpenChange: (open: boolean) => void;
}

function EditGroupIdentityDialogContent({
  group,
  onOpenChange,
}: EditGroupIdentityDialogContentProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const editor = useEditGroupIdentity(group, {
    onSaved: () => onOpenChange(false),
  });

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>Group settings</DialogTitle>
        <DialogDescription className="sr-only">
          Edit group settings
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-5">
        <EditGroupIdentityFields editor={editor} />
        <EditGroupAvatarSection editor={editor} inputRef={avatarInputRef} />
        <EditGroupCoverSection
          editor={editor}
          group={group}
          inputRef={coverInputRef}
        />

        {editor.error && (
          <p className="text-sm font-medium text-destructive">{editor.error}</p>
        )}
      </div>

      <DialogFooter>
        <EditGroupIdentityFooter
          editor={editor}
          onCancel={() => onOpenChange(false)}
        />
      </DialogFooter>
    </DialogContent>
  );
}
