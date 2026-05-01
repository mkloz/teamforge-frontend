import { Check, X } from "lucide-react";
import { useMemo, useRef } from "react";

import { useEditGroupIdentity } from "@/features/activity/hooks/use-edit-group-identity";
import type { Group } from "@/features/activity/lib/activity-contract";
import { Avatar } from "@/shared/components/common/avatar";
import { FileDropzone } from "@/shared/components/common/file-dropzone";
import { PlanCover } from "@/shared/components/common/plan-cover";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  getPlanCoverPreset,
  PLAN_COVER_PRESETS,
} from "@/shared/lib/plan-cover";
import { cn } from "@/shared/lib/utils";

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

  const activeCoverPreset = useMemo(
    () => getPlanCoverPreset(editor.coverImage),
    [editor.coverImage],
  );

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>Group settings</DialogTitle>
        <DialogDescription className="sr-only">
          Edit group settings
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-5">
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

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Avatar
          </p>
          <div className="grid gap-3 sm:grid-cols-[4.5rem_1fr]">
            <Avatar
              src={editor.avatar || null}
              name={editor.name}
              shape="rounded"
              className="size-18 rounded-xl border border-border bg-muted"
            />
            <div className="flex min-w-0 flex-col gap-2">
              <FileDropzone
                inputRef={avatarInputRef}
                variant="inline"
                accept="image/*"
                title={editor.avatar ? "Replace avatar" : "Upload avatar"}
                description="Drop a square group image here."
                helper="PNG, JPG, WEBP up to 5 MB"
                actionLabel="Browse"
                isUploading={editor.isAvatarUploading}
                error={editor.avatarUploadError}
                onFiles={editor.handleAvatarFiles}
              />
              {editor.avatar && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="self-start"
                  onClick={() => editor.setAvatar("")}
                >
                  <X className="size-4" aria-hidden="true" />
                  Remove avatar
                </Button>
              )}
            </div>
          </div>
        </div>

        {group.plan && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Plan cover
            </p>
            <div className="relative">
              <FileDropzone
                inputRef={coverInputRef}
                variant="cover"
                accept="image/*"
                title={editor.coverImage ? "Change cover" : "Upload cover"}
                description="Drop a plan image here or browse from your device."
                helper="PNG, JPG, WEBP up to 5 MB"
                actionLabel="Browse"
                isUploading={editor.isCoverUploading}
                error={editor.coverUploadError}
                onFiles={editor.handleCoverFiles}
                preview={
                  <div className="h-full w-full">
                    <PlanCover
                      value={editor.coverImage}
                      alt={`${group.name} cover preview`}
                      imageClassName="transition-transform duration-500"
                    />
                  </div>
                }
              />
              {editor.coverImage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-2 top-2 z-20 rounded-full bg-black/45 text-white hover:bg-black/65 hover:text-white"
                  onClick={() => editor.setCoverImage(null)}
                  aria-label="Remove cover"
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {PLAN_COVER_PRESETS.map(({ id, gradient, label }) => {
                const selected = editor.coverImage === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => editor.setCoverImage(selected ? null : id)}
                    aria-pressed={selected}
                    className={cn(
                      "group relative h-14 overflow-hidden rounded-xl border-2 bg-linear-to-br transition duration-200",
                      gradient,
                      selected
                        ? "border-forge-teal shadow-md shadow-forge-teal/20"
                        : "border-transparent hover:scale-[1.03] hover:shadow-sm",
                    )}
                  >
                    <span className="absolute bottom-1 left-1.5 text-[10px] font-bold text-white/85 drop-shadow-sm">
                      {label}
                    </span>
                    {selected && (
                      <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-white/95 shadow-sm">
                        <Check
                          size={9}
                          className="text-forge-teal"
                          strokeWidth={3}
                        />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {activeCoverPreset && (
              <p className="text-[11px] font-medium text-muted-foreground">
                Selected: {activeCoverPreset.label}
              </p>
            )}
          </div>
        )}

        {editor.error && (
          <p className="text-sm font-medium text-destructive">{editor.error}</p>
        )}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={
            !editor.isNameValid ||
            !editor.hasChanges ||
            editor.isSaving ||
            editor.isAvatarUploading ||
            editor.isCoverUploading
          }
          onClick={() => void editor.save()}
        >
          {editor.isSaving ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
