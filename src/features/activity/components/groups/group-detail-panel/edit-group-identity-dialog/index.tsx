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
    <DialogContent className="max-h-screen overflow-y-auto sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>Edit details</DialogTitle>
        <DialogDescription>
          Update the group identity and the current plan from one place.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-4">
          <SectionHeader
            title="Group"
            description="Name, description, and the image people recognise in the member list."
          />
          <EditGroupIdentityFields editor={editor} />
          <EditGroupAvatarSection editor={editor} inputRef={avatarInputRef} />
        </section>

        {group.plan ? (
          <section className="flex flex-col gap-4 border-border/70 border-t pt-5">
            <SectionHeader
              title="Current plan"
              description="Activity details, timing, place, cost, and cover image."
            />
            <EditPlanDetailsFields editor={editor} />
            <EditGroupCoverSection
              editor={editor}
              group={group}
              inputRef={coverInputRef}
            />
          </section>
        ) : null}

        {editor.error && (
          <p className="font-medium text-destructive text-sm">{editor.error}</p>
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

function SectionHeader({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="font-bold text-foreground text-sm">{title}</h3>
      <p className="text-muted-foreground text-xs leading-relaxed">
        {description}
      </p>
    </div>
  );
}
