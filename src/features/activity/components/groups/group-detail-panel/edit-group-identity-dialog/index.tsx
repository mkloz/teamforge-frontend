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
import { EditPlanDetailsFields } from "./edit-plan-details-fields";

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

export function EditPlanDetailsDialog({
  group,
  open,
  onOpenChange,
}: EditGroupIdentityDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <EditPlanDetailsDialogContent
          group={group}
          onOpenChange={onOpenChange}
        />
      )}
    </Dialog>
  );
}

interface EditDetailsDialogContentProps {
  group: Group;
  onOpenChange: (open: boolean) => void;
}

function EditGroupIdentityDialogContent({
  group,
  onOpenChange,
}: EditDetailsDialogContentProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const editor = useEditGroupIdentity(group, {
    onSaved: () => onOpenChange(false),
  });

  return (
    <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-2xl border-border/70 bg-popover px-5 py-0 shadow-none sm:max-w-lg [&>button]:top-4 [&>button]:right-4 [&>button]:shadow-none">
      <DialogHeader className="border-border/60 border-b py-5 pr-10">
        <DialogTitle>Edit group details</DialogTitle>
        <DialogDescription>
          Update the name, description, and avatar people see.
        </DialogDescription>
      </DialogHeader>

      <div className="min-h-0 overflow-y-auto py-5">
        <section className="flex flex-col gap-4">
          <EditGroupIdentityFields editor={editor} />
          <EditGroupAvatarSection editor={editor} inputRef={avatarInputRef} />
        </section>
      </div>

      {editor.error && (
        <p className="border-border/60 border-t py-3 font-medium text-destructive text-sm">
          {editor.error}
        </p>
      )}

      <DialogFooter className="border-border/60 border-t py-4">
        <EditGroupIdentityFooter
          editor={editor}
          isSaveDisabled={!editor.canSaveGroupDetails}
          onCancel={() => onOpenChange(false)}
          saveLabel="Save group"
        />
      </DialogFooter>
    </DialogContent>
  );
}

function EditPlanDetailsDialogContent({
  group,
  onOpenChange,
}: EditDetailsDialogContentProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const editor = useEditGroupIdentity(group, {
    onSaved: () => onOpenChange(false),
  });

  return (
    <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-2xl border-border/70 bg-popover px-5 py-0 shadow-none sm:max-w-2xl [&>button]:top-4 [&>button]:right-4 [&>button]:shadow-none">
      <DialogHeader className="border-border/60 border-b py-5 pr-10">
        <DialogTitle>Edit plan</DialogTitle>
        <DialogDescription>
          Update the activity details, timing, place, cost, and cover.
        </DialogDescription>
      </DialogHeader>

      <div className="min-h-0 overflow-y-auto py-5">
        <section className="flex flex-col gap-5">
          <EditPlanDetailsFields editor={editor} />
          <EditGroupCoverSection
            editor={editor}
            group={group}
            inputRef={coverInputRef}
          />
        </section>
      </div>

      {editor.error && (
        <p className="border-border/60 border-t py-3 font-medium text-destructive text-sm">
          {editor.error}
        </p>
      )}

      <DialogFooter className="border-border/60 border-t py-4">
        <EditGroupIdentityFooter
          editor={editor}
          isSaveDisabled={!editor.canSavePlanDetails}
          onCancel={() => onOpenChange(false)}
          saveLabel="Save plan"
        />
      </DialogFooter>
    </DialogContent>
  );
}
