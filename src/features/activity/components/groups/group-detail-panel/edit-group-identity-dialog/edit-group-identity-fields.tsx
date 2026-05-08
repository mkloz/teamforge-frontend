import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";

import type { GroupIdentityEditor } from "./edit-group-identity-dialog.types";

interface EditGroupIdentityFieldsProps {
  editor: GroupIdentityEditor;
}

export function EditGroupIdentityFields({
  editor,
}: EditGroupIdentityFieldsProps) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="group-name"
          className="font-semibold text-muted-foreground text-xs uppercase tracking-wide"
        >
          Name
        </Label>
        <Input
          id="group-name"
          value={editor.name}
          onChange={(event) => editor.setName(event.target.value)}
          maxLength={120}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="group-description"
          className="font-semibold text-muted-foreground text-xs uppercase tracking-wide"
        >
          Description
        </Label>
        <Textarea
          id="group-description"
          value={editor.description}
          onChange={(event) => editor.setDescription(event.target.value)}
          maxLength={1000}
          rows={3}
          className="resize-none"
        />
      </div>
    </>
  );
}
