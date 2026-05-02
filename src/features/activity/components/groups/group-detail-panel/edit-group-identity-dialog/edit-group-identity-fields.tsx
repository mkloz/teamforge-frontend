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
        <label
          htmlFor="group-name"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Name
        </label>
        <input
          id="group-name"
          value={editor.name}
          onChange={(event) => editor.setName(event.target.value)}
          maxLength={120}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-forge-teal"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="group-description"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Description
        </label>
        <textarea
          id="group-description"
          value={editor.description}
          onChange={(event) => editor.setDescription(event.target.value)}
          maxLength={1000}
          rows={3}
          className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-forge-teal"
        />
      </div>
    </>
  );
}
